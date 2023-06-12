use crate::constants::*;
use anyhow::bail;
use clap::Parser;
use fiberplane_ci::utils::*;
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
    let all_crate_dirs = get_workspace_crate_dirs(".")?;
    let crates_using_workspace_version = get_crates_using_workspace_version(".", &all_crate_dirs);

    if let Some(crate_name) = args.crate_name.as_deref() {
        if crates_using_workspace_version.contains(&crate_name) {
            bail!(
                "Crates that use the workspace version cannot have their version set independently. \
                Please set the workspace version to bump them (omit --crate-name).",
            );
        }
    }

    set_version("Cargo.toml", args)?;

    if let Some(crate_name) = args.crate_name.as_ref() {
        let Some(crate_dir) = get_crate_dir_from_name(&all_crate_dirs, crate_name) else {
            bail!("Unknown crate name: {crate_name}");
        };

        set_version(format!("{crate_dir}/Cargo.toml"), args)?;

        println!("{SUCCESS}Version updated.");
    } else {
        for crate_name in crates_using_workspace_version {
            set_version(
                "Cargo.toml",
                &SetVersionArgs {
                    crate_name: Some(crate_name.to_owned()),
                    version: args.version.clone(),
                },
            )?;
        }

        println!("{SUCCESS}Workspace version updated.");
    }

    Ok(())
}
