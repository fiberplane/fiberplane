use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(JsonSchema, Serialize, Clone)]
pub struct Workspace {
    path: String,
    config: Config,
}

#[derive(JsonSchema, Serialize, Deserialize, Clone)]
pub struct Config {
    port: u16,
}

impl Workspace {
    pub fn new(path: String, config: Config) -> Self {
        Self { path, config }
    }
}
#[derive(JsonSchema, Serialize)]
#[serde(tag = "type")]
pub enum OpenWorkspaceByPathError {
    ConfigFileMissing { path: String },
    InvalidConfiguration { message: String },
}
