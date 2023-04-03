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

#[tokio::main]
async fn main() {
    if let Err(err) = handle_cli().await {
        println!("{ERROR}{}", style(format!("Error: {err}")).red());
        std::process::exit(1);
    }
}

async fn handle_cli() -> TaskResult {
    let args = Args::parse();
    match args.command {
        Command::GenerateApiClient => handle_generate_api_client_command(),
        Command::Publish(args) => handle_publish_command(&args).await,
        Command::Version(args) => handle_version_command(&args),
    }
}
