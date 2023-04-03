#![forbid(unsafe_code)]

use anyhow::{bail, Context, Result};
use args::GeneratorArgs;
use clap::Parser;
use std::fs;
use std::path::Path;

mod args;
mod client_config;
mod generator;
mod routes;
mod types;

fn main() -> Result<()> {
    let args: GeneratorArgs = GeneratorArgs::parse();

    let path = args.file.as_path();
    if !path.is_file() {
        bail!("Open api file not found");
    }

    let extension = path.extension().unwrap_or_default();
    if extension != "yml" && extension != "yaml" {
        bail!("Input needs to be a YAML file (extension: .yml or .yaml)");
    }

    let output = args.output.as_path();
    if output.exists() {
        if args.force {
            // Windows does not delete the directory until the last handle to it is closed: https://docs.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-removedirectorya#remarks
            // A handle gets created by `clap` to it however (as its passed as a PathBuf in CLI args)
            // To work around this, rename the old directory and delete that. I hate Windows.
            let new_name = Path::new("__tmp_old_crate");

            fs::rename(output, new_name).context("Failed to rename previous output crate")?;
            fs::remove_dir_all(new_name).context("Failed to delete previous output crate")?;
        } else {
            bail!("Output crate already exists. Supply --force to allow overwriting");
        }
    }

    generator::generate_crate_from_schema(&args)
}
