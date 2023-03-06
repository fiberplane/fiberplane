mod versions;

use clap::Parser;
pub use versions::*;

#[derive(Parser)]
pub enum Command {
    #[clap(alias = "versions")]
    Version(VersionArgs),
}
