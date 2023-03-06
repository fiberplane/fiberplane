use crate::constants::*;
use clap::Parser;
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
    set_version(
        &SetVersionParams {
            cargo_path: "Cargo.toml",
            patch_workspace: args.dependency == "fiberplane",
        },
        args,
    )?;

    set_version(
        &SetVersionParams {
            cargo_path: format!("{}/Cargo.toml", args.dependency),
            patch_workspace: false,
        },
        args,
    )?;

    println!("{SUCCESS}Version updated.");

    Ok(())
}
