use crate::constants::*;
use anyhow::{anyhow, bail, Result};
use clap::Parser;
use console::style;
use fiberplane_ci::utils::*;
use fiberplane_ci::{commands::versions::*, TaskResult};

#[derive(Parser)]
pub struct PublishArgs {
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

pub fn handle_publish_command(args: &PublishArgs) -> TaskResult {
    match &args.sub_command {
        PublishCommand::Alphas => handle_publish_alphas(),
        PublishCommand::Betas => handle_publish_betas(),
    }
}

fn handle_publish_alphas() -> TaskResult {
    let commits = get_commits()?;
    let previous_commit = commits
        .get(1)
        .ok_or_else(|| anyhow!("Could not determine previous commit"))?;

    let all_crate_dirs = get_workspace_crate_dirs()?;
    let crates_using_workspace_version = get_crates_using_workspace_version(&all_crate_dirs);
    let changed_crates: Vec<&str> = all_crate_dirs
        .iter()
        .filter_map(|crate_dir| match did_change(crate_dir, previous_commit) {
            Ok(true) => Some(Ok(crate_dir)),
            Ok(false) => None,
            Err(err) => Some(Err(err)),
        })
        .map(|result| result.map(String::as_str).map(get_crate_name_from_dir))
        .collect()?;

    if crates_using_workspace_version
        .iter()
        .any(|crate_name| changed_crates.contains(crate_name))
    {
        let workspace_version = determine_next_workspace_version();
        set_version(
            "Cargo.toml",
            &SetVersionArgs {
                crate_name: None,
                version: workspace_version,
            },
        )?;
    }

    for crate_name in changed_crates {
        

        eprintln!(
            "{CHECK}{crate_name} {version} published.",
            version = style(version).bold()
        );
    }

    eprintln!("{SUCCESS}All changed crates published.");
}

/// Finds the first available alpha suffix for the crate and adds it to the
/// version.
///
/// Typically, `version` should be a suffix-less version coming from the `main`
/// branch, but if `main` is on a beta version, we may get odd version numbers
/// such as `v1.0.0-beta.2-alpha.1`. This looks awful, but we will accept this
/// because it would be even weirder to publish an alpha for a version that
/// already has a beta out.
async fn add_alpha_suffix(crate_name: &str, version: &str) -> Result<String> {
    let previous_alpha_version =
        get_previous_alpha_version(CRATES_IO_INDEX_URL, crate_name).await?;
    Ok(match previous_alpha_version.as_ref() {
        Some(alpha_version) if matches_base_version(&alpha_version, version) => {
            let Ok((major, minor, patch, Some(suffix))) = parse_version(&alpha_version) else {
                bail!("Cannot parse release version");
            };
            let Some(last_dash_position) = suffix.chars().rev().position(|char| char == '-') else {
                bail!("Cannot bump alpha version");
            };
            let count_index = suffix.len() - last_dash_position - 1;
            let count = suffix[count_index..].parse::<u32>()? + 1;
            format!(
                "v{major}.{minor}.{patch}-{}{}",
                &suffix[..count_index],
                count
            )
        }
        _ => format!("{version}-alpha.1"),
    })
}
