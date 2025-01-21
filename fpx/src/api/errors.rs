use axum::response::IntoResponse;
use fpx_macros::ApiError;
use http::StatusCode;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tracing::{error, warn};

pub trait ApiError {
    fn status_code(&self) -> StatusCode;
}

#[derive(Debug, Error)]
pub enum ApiServerError<E> {
    /// An error occurred in the service. These errors are specific to the
    /// endpoint that was called.
    #[error(transparent)]
    ServiceError(E),

    #[error(transparent)]
    CommonError(CommonError),
}

/// An Implementation for `()` which always returns a 500 status code. This is
/// useful if an endpoint does not have any errors, but we still require it for
/// our blanket IntoResponse impl for ApiServerError<E>.
impl ApiError for () {
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }
}

/// Blanket implementation for all types that implement `ApiError` and
/// `Serialize`. This should be the only implementation for `IntoResponse` that
/// we will use, since it adheres to our error handling strategy and only
/// requires implementing the `ApiError` trait (the `Serialize` trait is a
/// noop).
impl<E> IntoResponse for ApiServerError<E>
where
    E: ApiError,
    E: Serialize,
{
    fn into_response(self) -> axum::response::Response {
        let result = match &self {
            ApiServerError::ServiceError(err) => (
                err.status_code(),
                serde_json::to_vec(err).expect("Failed to serialize ServiceError"),
            ),
            ApiServerError::CommonError(err) => (
                err.status_code(),
                serde_json::to_vec(err).expect("Failed to serialize CommonError"),
            ),
        };

        result.into_response()
    }
}

/// Implementation for any anyhow::Error to be converted to a
/// `CommonError::InternalServerError`.
impl<E> From<anyhow::Error> for ApiServerError<E> {
    fn from(err: anyhow::Error) -> Self {
        warn!(?err, "An anyhow error was converted to a ApiServerError");
        ApiServerError::CommonError(CommonError::InternalServerError)
    }
}

/// Implementation for any ApiError to be converted to a
/// `ApiServerError::ServiceError`. This does not apply to _all_ types since
/// that would conflict with the impl for `anyhow::Error`.
impl<E> From<E> for ApiServerError<E>
where
    E: ApiError,
{
    fn from(value: E) -> Self {
        ApiServerError::ServiceError(value)
    }
}

#[derive(Debug, Error, Serialize, Deserialize, ApiError)]
#[serde(tag = "error", content = "details", rename_all = "camelCase")]
pub enum CommonError {
    #[api_error(status_code = StatusCode::INTERNAL_SERVER_ERROR)]
    #[error("Internal server error")]
    InternalServerError,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Debug, Serialize, Deserialize, Error, ApiError)]
    #[serde(tag = "error", content = "details", rename_all = "camelCase")]
    #[non_exhaustive]
    pub enum TestError {
        #[api_error(status_code = StatusCode::NOT_FOUND)]
        #[error("Request not found")]
        RequestNotFound,

        #[api_error(status_code = StatusCode::BAD_REQUEST)]
        #[error("Provided ID is invalid")]
        InvalidId,
    }

    /// Test to confirm that a anyhow::Error can be converted into a
    /// ApiServerError.
    #[tokio::test]
    async fn anyhow_error_into_api_server_error() {
        let anyhow_error = anyhow::Error::msg("some random anyhow error");
        let api_server_error: ApiServerError<TestError> = anyhow_error.into();

        assert!(
            matches!(
                api_server_error,
                ApiServerError::CommonError(CommonError::InternalServerError)
            ),
            "returned error does not match expected error; got: {:?}",
            api_server_error
        );
    }
}
