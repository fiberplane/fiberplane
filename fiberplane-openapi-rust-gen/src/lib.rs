mod args;
mod client_config;
mod generator;
mod routes;
mod types;

pub use args::GeneratorArgs;
pub use generator::generate_crate_from_schema;
