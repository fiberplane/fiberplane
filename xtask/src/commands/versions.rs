use crate::constants::*;
use clap::Parser;
use fiberplane_ci::utils::toml_query::TomlNode;
use fiberplane_ci::TaskError;
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
        .ok_or_else(|| TaskError::WorkspaceError("Cannot determine workspace members".into()))?;
    let crates_using_workspace_version: Vec<_> = all_crates
        .into_iter()
        .filter(|crate_name| {
            TomlNode::from_file(format!("{crate_name}/Cargo.toml"))
                .ok()
                .and_then(|node| node.get_bool("package.version.workspace"))
                == Some(true)
        })
        .collect();

    let patch_workspace = args.dependency == "fiberplane";
    if crates_using_workspace_version.contains(&args.dependency) && !patch_workspace {
        return Err(TaskError::InvalidRequest(
            "Crates that use the workspace version cannot have their version set independently. \
            Please set the version for the `fiberplane` crate to bump them."
                .into(),
        )
        .into());
    }

    set_version(
        &SetVersionParams {
            cargo_path: "Cargo.toml",
            patch_workspace,
        },
        args,
    )?;

    if patch_workspace {
        for crate_name in crates_using_workspace_version {
            set_version(
                &SetVersionParams {
                    cargo_path: "Cargo.toml",
                    patch_workspace,
                },
                &SetVersionArgs {
                    dependency: crate_name,
                    version: args.version.clone(),
                },
            )?;
        }
    } else {
        set_version(
            &SetVersionParams {
                cargo_path: format!("{}/Cargo.toml", args.dependency),
                patch_workspace,
            },
            args,
        )?;
    }

    println!("{SUCCESS}Version updated.");
    Ok(())
}
