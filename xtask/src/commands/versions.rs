use crate::constants::*;
use anyhow::{anyhow, bail};
use clap::Parser;
use fiberplane_ci::utils::toml_query::TomlNode;
use fiberplane_ci::{commands::versions::*, TaskResult};

#[derive(Parser)]
pub struct VersionArgs {
    #[clap(subcommand)]
    sub_command: VersionCommand,
}

#[derive(Parser)]
pub enum VersionCommand {
    /// Sets the version of one of the crates in this repository.
    #[clap()]
    Set(SetVersionArgs),
}

pub fn handle_version_command(args: &VersionArgs) -> TaskResult {
    match &args.sub_command {
        VersionCommand::Set(args) => handle_set_version(args),
    }
}

fn handle_set_version(args: &SetVersionArgs) -> TaskResult {
    let all_crates = TomlNode::from_file("Cargo.toml")?
        .get_string_array("workspace.members")
        .ok_or_else(|| anyhow!("Cannot determine workspace members"))?;
    let crates_using_workspace_version: Vec<_> = all_crates
        .into_iter()
        .filter(|crate_name| {
            TomlNode::from_file(format!("{crate_name}/Cargo.toml"))
                .ok()
                .and_then(|node| node.get_bool("package.version.workspace"))
                .unwrap_or_default()
        })
        .collect();

    if let Some(crate_name) = args.crate_name.as_ref() {
        if crates_using_workspace_version.contains(crate_name) {
            bail!(
                "Crates that use the workspace version cannot have their version set independently. \
                Please set the workspace version to bump them (omit --crate-name).",
            );
        }
    }

    set_version("Cargo.toml", args)?;

    if let Some(crate_name) = args.crate_name.as_ref() {
        set_version(format!("{crate_name}/Cargo.toml"), args)?;

        println!("{SUCCESS}Version updated.");
    } else {
        for crate_name in crates_using_workspace_version {
            set_version(
                "Cargo.toml",
                &SetVersionArgs {
                    crate_name: Some(crate_name.clone()),
                    version: args.version.clone(),
                },
            )?;
        }

        println!("{SUCCESS}Workspace version updated.");
    }

    Ok(())
}
