mod generate_api_client;
mod publish;
mod versions;

use clap::Parser;
pub use generate_api_client::*;
pub use publish::*;
pub use versions::*;

#[derive(Parser)]
pub enum Command {
    GenerateApiClient,

    Publish(PublishArgs),

    #[clap(alias = "versions")]
    Version(VersionArgs),
}
