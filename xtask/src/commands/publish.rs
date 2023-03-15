use crate::constants::*;
use anyhow::{bail, Context, Result};
use clap::Parser;
use console::style;
use duct::cmd;
use fiberplane_ci::utils::*;
use fiberplane_ci::{commands::versions::*, TaskResult};

#[derive(Parser)]
pub struct PublishArgs {
    /// Publish all crates that can be published, instead of only changed ones.
    #[clap(long)]
    pub all: bool,

    /// Do not actually publish the release(s).
    ///
    /// Note that publication will fail if you try to dry-run publication for
    /// multiple crates that depend on one another. This is because later crates
    /// need their updated dependencies to be really published to be publishable
    /// themselves.
    #[clap(long)]
    pub dry_run: bool,

    #[clap(subcommand)]
    sub_command: PublishCommand,
}

#[derive(Parser)]
pub enum PublishCommand {
    /// Publishes all the crates that changed in the last commit under a new
    /// alpha version.
    Alphas,

    /// Publishes all the crates with an unpublished beta version.
    Betas,
}

pub async fn handle_publish_command(args: &PublishArgs) -> TaskResult {
    match &args.sub_command {
        PublishCommand::Alphas => handle_publish_alphas(args).await,
        PublishCommand::Betas => handle_publish_betas(args).await,
    }
}

async fn handle_publish_alphas(args: &PublishArgs) -> TaskResult {
    let commits = get_commits(".")?;
    let previous_commit = commits
        .get(1)
        .context("Could not determine previous commit")?;

    if args.all {
        eprintln!("{NOTE}Will publish alpha versions for all publishable crates.");
    } else {
        eprintln!(
            "{NOTE}Will publish alpha versions for all crates changed since {previous_commit}."
        );
    }

    let all_crate_dirs = get_publishable_workspace_crate_dirs(".")?;
    let crates_using_workspace_version = get_crates_using_workspace_version(".", &all_crate_dirs);
    let changed_crate_dirs: Vec<&str> = all_crate_dirs
        .iter()
        .map(String::as_str)
        .filter_map(|crate_dir| {
            if args.all {
                Some(Ok(crate_dir))
            } else {
                match did_change(crate_dir, previous_commit) {
                    Ok(true) => Some(Ok(crate_dir)),
                    Ok(false) => None,
                    Err(err) => Some(Err(err)),
                }
            }
        })
        .collect::<Result<Vec<_>>>()?;

    if changed_crate_dirs.is_empty() {
        eprintln!("{SUCCESS}No crates need publishing.");
        return Ok(());
    }

    let changed_crate_dirs = sort_by_dependencies(".", &changed_crate_dirs)?;
    let changed_crates_using_workspace_version: Vec<&str> = changed_crate_dirs
        .iter()
        .cloned()
        .filter(|crate_name| crates_using_workspace_version.contains(crate_name))
        .collect();

    eprintln!("{WORKING}Updating necessary Cargo files...");

    let workspace_cargo_toml = TomlNode::from_file("Cargo.toml")?;
    let mut workspace_version = workspace_cargo_toml
        .get_string("workspace.package.version")
        .context("Cannot determine workspace version")?;

    if !changed_crates_using_workspace_version.is_empty() {
        workspace_version = determine_next_workspace_alpha(
            CRATES_IO_INDEX_URL,
            &workspace_version,
            &changed_crates_using_workspace_version,
        )
        .await?;

        set_version(
            "Cargo.toml",
            &SetVersionArgs {
                crate_name: None,
                version: workspace_version.clone(),
            },
        )?;

        eprintln!(
            " - Workspace => {version}.",
            version = style(&workspace_version).bold()
        );
    }

    for crate_dir in changed_crate_dirs.iter().cloned() {
        let crate_name = get_crate_name_from_dir(crate_dir);

        let version = if changed_crates_using_workspace_version.contains(&crate_name) {
            workspace_version.clone()
        } else {
            let crate_cargo_path = format!("{crate_dir}/Cargo.toml");
            let crate_cargo_toml = TomlNode::from_file(&crate_cargo_path)?;
            let version = crate_cargo_toml
                .get_string("package.version")
                .context("Cannot determine package version")?;
            let new_version = add_next_alpha_suffix(crate_name, &version).await?;

            set_version(
                crate_cargo_path,
                &SetVersionArgs {
                    crate_name: Some(crate_name.to_owned()),
                    version: new_version.clone(),
                },
            )?;

            new_version
        };

        set_version(
            "Cargo.toml",
            &SetVersionArgs {
                crate_name: Some(crate_name.to_owned()),
                version: version.clone(),
            },
        )?;

        eprintln!(
            " - {crate_name} => {version}.",
            version = style(&version).bold()
        );
    }

    eprintln!("{CHECK}Cargo files patched. Starting publication...");

    publish_crates(&changed_crate_dirs, args)?;

    eprintln!("{SUCCESS}All changed crates published.");

    Ok(())
}

async fn handle_publish_betas(args: &PublishArgs) -> TaskResult {
    eprintln!("{WORKING}Detecting crates that need publication...");

    let workspace_version = TomlNode::from_file("Cargo.toml")?
        .get_string("workspace.package.version")
        .context("Cannot determine workspace version")?;

    let mut changed_crate_dirs = Vec::new();
    let all_crate_dirs = get_publishable_workspace_crate_dirs(".")?;
    for crate_dir in all_crate_dirs.iter() {
        let cargo_toml_path = format!("{crate_dir}/Cargo.toml");
        let crate_cargo_toml = TomlNode::from_file(&cargo_toml_path)?;
        let version = if crate_cargo_toml
            .get_bool("package.version.workspace")
            .unwrap_or_default()
        {
            workspace_version.clone()
        } else {
            match crate_cargo_toml.get_string("package.version") {
                Some(package_version) => package_version,
                None => {
                    eprintln!("{WARN}Cannot determine package version in {cargo_toml_path}.");
                    continue;
                }
            }
        };

        let crate_name = get_crate_name_from_dir(crate_dir);
        if is_published(CRATES_IO_INDEX_URL, crate_name, &version).await? {
            continue;
        }

        eprintln!(
            " - {crate_name} => {version}.",
            version = style(&version).bold()
        );

        changed_crate_dirs.push(crate_dir.as_str());
    }

    if changed_crate_dirs.is_empty() {
        eprintln!("{SUCCESS}No crates need publishing.");
        return Ok(());
    }

    eprintln!("{CHECK}Unpublished crates detected. Starting publication...");

    let changed_crate_dirs = sort_by_dependencies(".", &changed_crate_dirs)?;
    publish_crates(&changed_crate_dirs, args)?;

    eprintln!("{SUCCESS}All changed crates published.");

    Ok(())
}

/// Finds the first available alpha suffix for the crate and adds it to the
/// version.
///
/// Typically, `version` should be a suffix-less version coming from the `main`
/// branch, but if `main` is on a beta version, we may get odd version numbers
/// such as `v1.0.0-beta.2-alpha.1`. This looks awful, but we will accept this
/// because it would be even weirder to publish an alpha for a version that
/// already has a beta out.
async fn add_next_alpha_suffix(crate_name: &str, version: &str) -> Result<String> {
    let previous_alpha_version =
        get_previous_alpha_version(CRATES_IO_INDEX_URL, crate_name).await?;
    Ok(match previous_alpha_version.as_ref() {
        Some(alpha_version) if matches_base_version(alpha_version, version) => {
            let alpha_count = get_suffix_count(alpha_version)?;
            format!("{version}-alpha.{count}", count = alpha_count + 1)
        }
        _ => format!("{version}-alpha.1"),
    })
}

fn publish_crates(crate_dirs: &[&str], args: &PublishArgs) -> TaskResult {
    for crate_dir in crate_dirs {
        let mut cargo_args = vec!["publish", "--allow-dirty"];
        if args.dry_run {
            cargo_args.push("--dry-run");
        }

        let output = cmd("cargo", &cargo_args)
            .stderr_to_stdout()
            .stdout_capture()
            .dir(crate_dir)
            .unchecked()
            .run()?;

        if output.status.code() != Some(0) {
            eprintln!(
                "{WARN}cargo {args} failed with exit code {code:?}.\n\
                Output:\n{output}",
                args = cargo_args.join(" "),
                code = output.status.code().unwrap_or(-1),
                output = String::from_utf8(output.stdout)?
            );
            bail!("Cargo publication failed in {crate_dir}")
        }

        eprintln!(
            "{CHECK}{crate_name} published.",
            crate_name = style(get_crate_name_from_dir(crate_dir)).bold()
        );
    }

    Ok(())
}
