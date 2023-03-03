pub mod commands;
mod toml_patcher;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum TaskError {
    #[error("Unknown command")]
    UnknownCommand,
}

pub type TaskResult = anyhow::Result<()>;
