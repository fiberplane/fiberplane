use serde::{Deserialize, Serialize};
use thiserror::Error;

#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;

#[derive(Debug, Deserialize, Error, Serialize, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::auth")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AuthError {
    #[error("no credentials were provided")]
    Unauthenticated,

    #[error("credentials are not allowed to perform this action")]
    Unauthorized,
}

impl AuthError {
    #[cfg(feature = "axum_06")]
    pub fn status_code(&self) -> axum_06::http::StatusCode {
        match self {
            Self::Unauthenticated => axum_06::http::StatusCode::UNAUTHORIZED,
            Self::Unauthorized => axum_06::http::StatusCode::FORBIDDEN,
        }
    }

    #[cfg(feature = "axum_07")]
    pub fn status_code(&self) -> axum_07::http::StatusCode {
        match self {
            Self::Unauthenticated => axum_07::http::StatusCode::UNAUTHORIZED,
            Self::Unauthorized => axum_07::http::StatusCode::FORBIDDEN,
        }
    }
}
