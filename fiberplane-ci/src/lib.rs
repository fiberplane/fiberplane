pub mod commands;
pub mod utils;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum TaskError {
    /// The user is trying to perform a request that we consider invalid.
    #[error("Invalid request: {0}")]
    InvalidRequest(String),

    #[error("Unknown command")]
    UnknownCommand,

    #[error("Workspace error: {0}")]
    WorkspaceError(String),
}

pub type TaskResult = anyhow::Result<()>;
