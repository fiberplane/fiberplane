mod publish;
mod versions;

use clap::Parser;
pub use publish::*;
pub use versions::*;

#[derive(Parser)]
pub enum Command {
    Publish(PublishArgs),

    #[clap(alias = "versions")]
    Version(VersionArgs),
}
