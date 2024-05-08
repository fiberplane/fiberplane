use crate::args::GeneratorArgs;
use crate::client_config::{generate_api_client, generate_client_configs};
use crate::routes::generate_routes;
use anyhow::{anyhow, bail, Context, Result};
use cargo_toml::{
    Dependency, DependencyDetail, DepsSet, Inheritable, InheritedDependencyDetail, Manifest,
    OptionalFile,
};
use okapi::openapi3::OpenApi;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use std::process::Command;

/// Generates the crate for the OpenAPI client using a path to the schema file.
pub fn generate_crate_from_schema(args: &GeneratorArgs) -> Result<()> {
    let contents =
        std::fs::read_to_string(&args.file).context("Failed to read OpenAPI document")?;
    let document: OpenApi =
        serde_yaml::from_str(&contents).context("Failed to parse OpenAPI document")?;

    generate_crate(document, args)
}

fn generate_crate(document: OpenApi, args: &GeneratorArgs) -> Result<()> {
    let status = Command::new("cargo")
        .arg("new")
        .arg("--quiet")
        .args(["--vcs", "none"])
        .arg("--lib")
        .args(["--edition", "2021"])
        .arg(
            args.output
                .to_str()
                .ok_or_else(|| anyhow!("Failed to convert output OsStr into &str"))?,
        )
        .status()
        .context("Failed to run Cargo")?;

    if !status.success() {
        if let Some(code) = status.code() {
            bail!("Cargo exited with non-zero status code: {}", code);
        } else {
            bail!("Cargo subprocess was killed by another process or system");
        }
    }

    edit_cargo_toml(&args.output, args)?;

    let src_directory = args.output.join("src");

    generate_client_configs(&document.servers, &src_directory)?;
    generate_api_client(&src_directory)?;

    if let Some(components) = &document.components {
        generate_routes(&document.paths, &src_directory, components, &args.models)?;
    }

    Ok(())
}

fn open_manifest(path: &Path) -> Result<Manifest> {
    Manifest::from_path(path).context("Failed to parse `Cargo.toml`")
}

fn edit_cargo_toml(path: &Path, args: &GeneratorArgs) -> Result<()> {
    let path = path.join("Cargo.toml");

    // https://stackoverflow.com/a/50691004/11494565
    let mut file = OpenOptions::new()
        .read(false)
        .write(true)
        .create(false)
        .append(false)
        .open(&path)
        .context("Failed to open or create `Cargo.toml`")?;

    let mut manifest = open_manifest(&path)?;

    let package_metadata = manifest
        .package
        .as_mut()
        .context("`Cargo.toml` does not contain a [package] section")?;

    if args.workspace {
        package_metadata.version = Inheritable::Inherited { workspace: true };
    } else if let Some(version) = args.crate_version.as_ref() {
        package_metadata.version = Inheritable::Set(version.clone());
    }

    if let Some(license) = args.license.as_ref() {
        package_metadata.license = if args.workspace {
            Some(Inheritable::Inherited { workspace: true })
        } else {
            Some(Inheritable::Set(license.clone()))
        }
    }

    if let Some(description) = args.description.as_ref() {
        package_metadata.description = Some(Inheritable::Set(description.clone()));
    }

    if let Some(readme) = args.readme.as_ref() {
        package_metadata.readme =
            Inheritable::Set(OptionalFile::Path(Path::new(readme).to_path_buf()));
    }

    if let Some(documentation) = args.documentation.as_ref() {
        package_metadata.documentation = if args.workspace {
            Some(Inheritable::Inherited { workspace: true })
        } else {
            Some(Inheritable::Set(documentation.clone()))
        }
    }

    if let Some(repository) = args.repository.as_ref() {
        package_metadata.repository = if args.workspace {
            Some(Inheritable::Inherited { workspace: true })
        } else {
            Some(Inheritable::Set(repository.clone()))
        }
    }

    add_dependencies(&mut manifest.dependencies, args)?;

    // workaround for "values must be emitted before tables" error which happens for some people
    // https://gitlab.com/crates.rs/cargo_toml/-/issues/3#note_687730489
    let value =
        toml::Value::try_from(&manifest).context("Failed to convert `Cargo.toml` to toml value")?;
    let serialized =
        toml::to_string(&value).context("Failed to serialize `Cargo.toml` value to string")?;

    file.write_all(serialized.as_bytes())
        .context("Failed to write `Cargo.toml` to disk")?;

    Ok(())
}

fn add_dependencies(dependencies: &mut DepsSet, args: &GeneratorArgs) -> Result<()> {
    // serde
    dependencies.insert(
        "serde".to_owned(),
        Dependency::Detailed(DependencyDetail {
            features: vec!["derive".to_owned()],
            version: Some("1".to_owned()),
            ..Default::default()
        }),
    );

    // serde_json
    dependencies.insert(
        "serde_json".to_string(),
        Dependency::Simple("1".to_string()),
    );

    // anyhow
    dependencies.insert("anyhow".to_string(), Dependency::Simple("1".to_string()));

    // secrecy
    dependencies.insert("secrecy".to_string(), Dependency::Simple("0".to_string()));

    // reqwest
    dependencies.insert(
        "reqwest".to_owned(),
        Dependency::Detailed(DependencyDetail {
            default_features: false,
            features: vec![
                "gzip".to_owned(),
                "json".to_owned(),
                "multipart".to_owned(),
                "rustls-tls".to_owned(),
            ],
            version: Some("0.12".to_owned()),
            ..Default::default()
        }),
    );

    // base64uuid
    dependencies.insert(
        "base64uuid".to_string(),
        fp_dependency("base64uuid", args, Vec::new()),
    );

    // fiberplane-models
    dependencies.insert(
        "fiberplane-models".to_string(),
        fp_dependency("fiberplane-models", args, Vec::new()),
    );
    dependencies.insert("bytes".to_string(), Dependency::Simple("1".to_string()));

    dependencies.insert("thiserror".to_string(), Dependency::Simple("1".to_string()));

    dependencies.insert("url".to_string(), Dependency::Simple("2".to_string()));

    Ok(())
}

/// declare a dependency which lives within the fiberplane repository
fn fp_dependency(name: &str, args: &GeneratorArgs, features: Vec<String>) -> Dependency {
    if args.workspace {
        Dependency::Inherited(InheritedDependencyDetail {
            features,
            workspace: true,
            ..Default::default()
        })
    } else if args.local {
        Dependency::Detailed(DependencyDetail {
            features,
            path: Some(format!("../{name}")),
            version: args.crate_version.as_ref().cloned(),
            ..Default::default()
        })
    } else {
        Dependency::Detailed(DependencyDetail {
            features,
            git: Some("ssh://git@github.com/fiberplane/fiberplane.git".to_owned()),
            branch: Some("main".to_owned()),
            ..Default::default()
        })
    }
}
