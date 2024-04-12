use crate::auth::AuthError;
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[cfg(feature = "axum_06")]
use http_02::StatusCode;

#[cfg(feature = "axum_07")]
use http_1::StatusCode;

/// General high level error that can be aliased to a specific error
#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::errors")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum GeneralError {
    #[error("unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl GeneralError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            GeneralError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            GeneralError::Auth(auth) => auth.status_code(),
        }
    }
}

impl From<AuthError> for GeneralError {
    fn from(value: AuthError) -> Self {
        GeneralError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for GeneralError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for GeneralError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}
