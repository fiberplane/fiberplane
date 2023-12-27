use crate::constants::*;
use anyhow::Context;
use duct::cmd;
use fiberplane_ci::{utils::TomlNode, TaskResult};
use fiberplane_openapi_rust_gen::{generate_crate_from_schema, GeneratorArgs};
use std::fs;

pub fn handle_generate_api_client_command() -> TaskResult {
    let workspace_toml =
        TomlNode::from_file("Cargo.toml").context("Could not read workspace Cargo.toml")?;

    let args = GeneratorArgs {
        file: "schemas/openapi_v1.yml".into(),
        output: "fiberplane-api-client".into(),
        models: vec![
            "fiberplane_models::notebooks::*".to_owned(),
            "fiberplane_models::notebooks::operations::*".to_owned(),
            "fiberplane_models::blobs::*".to_owned(),
            "fiberplane_models::comments::*".to_owned(),
            "fiberplane_models::data_sources::*".to_owned(),
            "fiberplane_models::events::*".to_owned(),
            "fiberplane_models::files::*".to_owned(),
            "fiberplane_models::formatting::*".to_owned(),
            "fiberplane_models::front_matter_schemas::*".to_owned(),
            "fiberplane_models::integrations::*".to_owned(),
            "fiberplane_models::labels::*".to_owned(),
            "fiberplane_models::names::*".to_owned(),
            "fiberplane_models::proxies::*".to_owned(),
            "fiberplane_models::query_data::*".to_owned(),
            "fiberplane_models::realtime::*".to_owned(),
            "fiberplane_models::snippets::*".to_owned(),
            "fiberplane_models::sorting::*".to_owned(),
            "fiberplane_models::templates::*".to_owned(),
            "fiberplane_models::timestamps::*".to_owned(),
            "fiberplane_models::tokens::*".to_owned(),
            "fiberplane_models::users::*".to_owned(),
            "fiberplane_models::views::*".to_owned(),
            "fiberplane_models::webhooks::*".to_owned(),
            "fiberplane_models::workspaces::*".to_owned(),
        ],
        force: false,
        crate_version: None,
        license: workspace_toml.get_string("workspace.package.license"),
        description: Some("Generated API client for Fiberplane API".to_owned()),
        readme: Some("README.md".to_owned()),
        documentation: None,
        repository: workspace_toml.get_string("workspace.package.repository"),
        local: true,
        workspace: true,
    };

    fs::remove_dir_all(&args.output).context("Could not remove existing client")?;

    generate_crate_from_schema(&args)?;

    cmd!("cargo", "fmt").dir(&args.output).run()?;

    // Just restore the README that was already there.
    cmd!("git", "restore", args.output.join("README.md")).run()?;

    eprintln!("{SUCCESS}Client generated.");

    Ok(())
}
