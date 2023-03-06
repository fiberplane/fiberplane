mod commands;
mod constants;

use clap::Parser;
use commands::*;
use console::style;
use constants::ERROR;
use fiberplane_ci::TaskResult;

#[derive(Parser)]
struct Args {
    #[clap(subcommand)]
    command: Command,
}

fn main() {
    if let Err(err) = handle_cli() {
        println!("{ERROR}{}", style(format!("Error: {err}")).red());
    }
}

fn handle_cli() -> TaskResult {
    let args = Args::parse();
    match args.command {
        Command::Version(args) => handle_version_command(&args),
    }
}
