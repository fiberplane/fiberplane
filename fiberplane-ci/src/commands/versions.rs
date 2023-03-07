use crate::utils::{toml_patcher::TomlPatcher, toml_query::TomlNode};
use crate::TaskResult;
use anyhow::Context;
use clap::Parser;
use std::{fs, path::Path};
use taplo::dom::KeyOrIndex;
use thiserror::Error;

#[derive(Parser)]
pub struct SetVersionArgs {
    /// Name of the crate to bump. If no specific crate is given, set the
    /// version of the workspace. For non-workspace repositories, specifying
    /// the crate name is still required.
    #[clap(long, short)]
    pub crate_name: Option<String>,

    /// The new version of the dependency.
    #[clap(long, short)]
    pub version: String,
}

pub fn set_version<P>(cargo_path: P, args: &SetVersionArgs) -> TaskResult
where
    P: AsRef<Path>,
{
    let cargo_toml = fs::read_to_string(cargo_path.as_ref()).context("Cannot read Cargo file")?;
    let output = set_version_in_toml(&cargo_toml, args)?;
    fs::write(cargo_path, output).context("Cannot write Cargo file")
}

fn set_version_in_toml(cargo_toml: &str, args: &SetVersionArgs) -> anyhow::Result<String> {
    let root = TomlNode::parse(cargo_toml)?;
    let mut patcher = TomlPatcher::new(root.clone()).unwrap();

    if let Some(crate_name) = args.crate_name.as_ref() {
        match root.get_string("package.name") {
            Some(package_name) if &package_name == crate_name => {
                if root.get_bool("package.version.workspace") != Some(true) {
                    patcher
                        .set_string("package.version", &args.version)
                        .map_err(|err| VersionError::PatchError(err.to_string()))?;
                }
            }
            _ => {}
        }

        patcher
            .set_string(format!("dependencies.{crate_name}.version"), &args.version)
            .map_err(|err| VersionError::PatchError(err.to_string()))?;
        patcher
            .set_string(
                format!("workspace.dependencies.{crate_name}.version"),
                &args.version,
            )
            .map_err(|err| VersionError::PatchError(err.to_string()))?;

        if let Some((path, _)) = args
            .crate_name
            .as_ref()
            .and_then(|crate_name| root.get_patch(crate_name))
        {
            let maybe_branch = root.get_string(&format!("patch.*.{}.branch", crate_name));
            let table_path = path
                .iter()
                .take(path.len() - 1)
                .map(KeyOrIndex::to_string)
                .collect::<Vec<_>>()
                .join(".");
            patcher
                .comment_out_table_key_and_replace_value(&table_path, &crate_name, |value| {
                    match &maybe_branch {
                        Some(branch) => value.replace(branch, "main"),
                        None => value,
                    }
                })
                .map_err(|err| VersionError::PatchError(err.to_string()))?;
        }
    } else {
        patcher
            .set_string("workspace.package.version", &args.version)
            .map_err(|err| VersionError::PatchError(err.to_string()))?;
    }

    let output = patcher.to_string();
    Ok(output)
}

#[derive(Debug, Error)]
pub enum VersionError {
    #[error("Patch error: {0}")]
    PatchError(String),
}

#[cfg(test)]
mod tests {
    use super::{set_version_in_toml, SetVersionArgs};
    use pretty_assertions::assert_eq;

    #[test]
    fn test_set_crate_version_in_workspace_toml() {
        let workspace_toml = r#"[workspace]
members = [
    "base64uuid",
    "fiberplane",
    "fiberplane-api-client",
    "fiberplane-provider-protocol/fiberplane-provider-bindings",
]

[workspace.package]
version = "1.0.0-alpha.1"
authors = ["Fiberplane <info@fiberplane.com>"]
edition = "2021"
license = "MIT OR Apache-2.0"
repository = "https://github.com/fiberplane/fiberplane"
rust-version = "1.64"

[workspace.dependencies]
base64uuid = { version = "1.0.0", path = "base64uuid", default-features = false }
bytes = "1"
fp-bindgen = { version = "3.0.0-alpha.1" }
fiberplane = { version = "1.0.0-alpha.1", path = "fiberplane" }
fiberplane-api-client = { version = "1.0.0-alpha.1", path = "fiberplane-api-client" }
once_cell = { version = "1.8" }
vergen = { version = "7.4.2", default-features = false, features = [
    "build",
    "git",
] }

[patch.crates-io]
#fp-bindgen = { git = "ssh://git@github.com/fiberplane/fp-bindgen.git", branch = "main" }
#fp-bindgen = { path = "../fp-bindgen/fp-bindgen" }
"#;

        let expected_toml = r#"[workspace]
members = [
    "base64uuid",
    "fiberplane",
    "fiberplane-api-client",
    "fiberplane-provider-protocol/fiberplane-provider-bindings",
]

[workspace.package]
version = "1.0.0-alpha.1"
authors = ["Fiberplane <info@fiberplane.com>"]
edition = "2021"
license = "MIT OR Apache-2.0"
repository = "https://github.com/fiberplane/fiberplane"
rust-version = "1.64"

[workspace.dependencies]
base64uuid = { version = "1.0.0", path = "base64uuid", default-features = false }
bytes = "1"
fp-bindgen = { version = "3.0.0-alpha.1" }
fiberplane = { version = "1.0.0-beta.1", path = "fiberplane" }
fiberplane-api-client = { version = "1.0.0-alpha.1", path = "fiberplane-api-client" }
once_cell = { version = "1.8" }
vergen = { version = "7.4.2", default-features = false, features = [
    "build",
    "git",
] }

[patch.crates-io]
#fp-bindgen = { git = "ssh://git@github.com/fiberplane/fp-bindgen.git", branch = "main" }
#fp-bindgen = { path = "../fp-bindgen/fp-bindgen" }
"#;

        let output = set_version_in_toml(
            workspace_toml,
            &SetVersionArgs {
                crate_name: Some("fiberplane".to_owned()),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        assert_eq!(&output, expected_toml);
    }

    #[test]
    fn test_set_workspace_version_in_workspace_toml() {
        let workspace_toml = r#"[workspace]
members = [
    "base64uuid",
    "fiberplane",
    "fiberplane-api-client",
    "fiberplane-provider-protocol/fiberplane-provider-bindings",
]

[workspace.package]
version = "1.0.0-alpha.1"
authors = ["Fiberplane <info@fiberplane.com>"]
edition = "2021"
license = "MIT OR Apache-2.0"
repository = "https://github.com/fiberplane/fiberplane"
rust-version = "1.64"

[workspace.dependencies]
base64uuid = { version = "1.0.0", path = "base64uuid", default-features = false }
bytes = "1"
fp-bindgen = { version = "3.0.0-alpha.1" }
fiberplane = { version = "1.0.0-alpha.1", path = "fiberplane" }
fiberplane-api-client = { version = "1.0.0-alpha.1", path = "fiberplane-api-client" }
once_cell = { version = "1.8" }
vergen = { version = "7.4.2", default-features = false, features = [
    "build",
    "git",
] }

[patch.crates-io]
#fp-bindgen = { git = "ssh://git@github.com/fiberplane/fp-bindgen.git", branch = "main" }
#fp-bindgen = { path = "../fp-bindgen/fp-bindgen" }
"#;

        let expected_toml = r#"[workspace]
members = [
    "base64uuid",
    "fiberplane",
    "fiberplane-api-client",
    "fiberplane-provider-protocol/fiberplane-provider-bindings",
]

[workspace.package]
version = "1.0.0-beta.1"
authors = ["Fiberplane <info@fiberplane.com>"]
edition = "2021"
license = "MIT OR Apache-2.0"
repository = "https://github.com/fiberplane/fiberplane"
rust-version = "1.64"

[workspace.dependencies]
base64uuid = { version = "1.0.0", path = "base64uuid", default-features = false }
bytes = "1"
fp-bindgen = { version = "3.0.0-alpha.1" }
fiberplane = { version = "1.0.0-alpha.1", path = "fiberplane" }
fiberplane-api-client = { version = "1.0.0-alpha.1", path = "fiberplane-api-client" }
once_cell = { version = "1.8" }
vergen = { version = "7.4.2", default-features = false, features = [
    "build",
    "git",
] }

[patch.crates-io]
#fp-bindgen = { git = "ssh://git@github.com/fiberplane/fp-bindgen.git", branch = "main" }
#fp-bindgen = { path = "../fp-bindgen/fp-bindgen" }
"#;

        let output = set_version_in_toml(
            workspace_toml,
            &SetVersionArgs {
                crate_name: None,
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        assert_eq!(&output, expected_toml);
    }

    #[test]
    fn test_set_version_in_crate_toml() {
        let crate_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-alpha.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { workspace = true, optional = true }
"#;

        let expected_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-beta.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { workspace = true, optional = true }
"#;

        let output = set_version_in_toml(
            crate_toml,
            &SetVersionArgs {
                crate_name: Some("fiberplane".to_owned()),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        assert_eq!(&output, expected_toml);
    }

    #[test]
    fn test_set_dependency_version_in_crate_toml() {
        let crate_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-alpha.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { version = "1.0.0-alpha.1", optional = true }
"#;

        let expected_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-alpha.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { version = "1.0.0-beta.1", optional = true }
"#;

        let output = set_version_in_toml(
            crate_toml,
            &SetVersionArgs {
                crate_name: Some("fiberplane-api-client".to_owned()),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        assert_eq!(&output, expected_toml);
    }

    #[test]
    fn test_set_patched_dependency_version_in_crate_toml() {
        let crate_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-alpha.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { version = "1.0.0-alpha.1", optional = true }

[patch.'crates-io']
fiberplane-api-client = { git = "ssh://git@github.com/fiberplane/fiberplane.git", branch = "custom" }
"#;

        let expected_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-alpha.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { version = "1.0.0-beta.1", optional = true }

[patch.'crates-io']
#fiberplane-api-client = { git = "ssh://git@github.com/fiberplane/fiberplane.git", branch = "main" }
"#;

        let output = set_version_in_toml(
            crate_toml,
            &SetVersionArgs {
                crate_name: Some("fiberplane-api-client".to_owned()),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        assert_eq!(&output, expected_toml);
    }

    #[test]
    fn test_set_version_in_crate_toml_with_workspace_version() {
        let crate_toml = r#"[package]
name = "fiberplane"
version = { workspace = true }

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { workspace = true, optional = true }
"#;

        let output = set_version_in_toml(
            crate_toml,
            &SetVersionArgs {
                crate_name: Some("fiberplane".to_owned()),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        // No changes expected.
        assert_eq!(&output, crate_toml);
    }
}
