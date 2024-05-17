use crate::auth::AuthError;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
#[cfg(feature = "axum_06")]
use http_02::StatusCode;
#[cfg(feature = "axum_07")]
use http_1::StatusCode;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use typed_builder::TypedBuilder;

/// Request to install the Slack integration and link
/// the user to a Slack user in a single workspace.
#[derive(Debug, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations::slack")
)]
#[serde(rename_all = "camelCase")]
#[non_exhaustive]
pub struct SlackInstallRequest {
    pub client_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slack_team_id: Option<String>,
}

/// Internal communication model between the services.
#[derive(Debug, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations::slack")
)]
#[serde(rename_all = "camelCase")]
#[non_exhaustive]
pub struct SlackOAuthStartRequest {
    pub api_user_id: Base64Uuid,
    pub api_access_token: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slack_team_id: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations::slack")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum SlackInstallError {
    // The String is meant to be the string representation
    // of an api::service::ServiceError, as the token_create
    // doesn’t use the new error types yet.
    #[error("integration token creation: {0}")]
    TokenCreation(String),

    #[error("slack service: {0}")]
    SlackService(String),

    #[error("internal error")]
    Internal,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl SlackInstallError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            SlackInstallError::TokenCreation(_) => StatusCode::INTERNAL_SERVER_ERROR,
            SlackInstallError::SlackService(_) => StatusCode::INTERNAL_SERVER_ERROR,
            SlackInstallError::Internal => StatusCode::INTERNAL_SERVER_ERROR,
            SlackInstallError::Auth(err) => err.status_code(),
        }
    }
}

impl From<AuthError> for SlackInstallError {
    fn from(value: AuthError) -> Self {
        SlackInstallError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for SlackInstallError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for SlackInstallError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations::slack")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum SlackUninstallError {
    // The String is meant to be the string representation
    // of an api::service::ServiceError, as the token_delete
    // doesn’t use the new error types yet.
    #[error("integration token deletion: {0}")]
    TokenDeletion(String),

    #[error("internal error")]
    Internal,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl SlackUninstallError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            SlackUninstallError::TokenDeletion(_) => StatusCode::INTERNAL_SERVER_ERROR,
            SlackUninstallError::Internal => StatusCode::INTERNAL_SERVER_ERROR,
            SlackUninstallError::Auth(err) => err.status_code(),
        }
    }
}

impl From<AuthError> for SlackUninstallError {
    fn from(value: AuthError) -> Self {
        SlackUninstallError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for SlackUninstallError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for SlackUninstallError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}
