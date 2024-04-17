use crate::auth::AuthError;
use crate::timestamps::Timestamp;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
#[cfg(feature = "axum_06")]
use http_02::StatusCode;
#[cfg(feature = "axum_07")]
use http_1::StatusCode;
use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumIter};
use thiserror::Error;
use typed_builder::TypedBuilder;

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct PersonalIntegrationSummary {
    pub id: PersonalIntegrationId,
    pub status: IntegrationStatus,

    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub created_at: Option<Timestamp>,
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<Timestamp>,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize, Display, EnumIter)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "lowercase")]
pub enum PersonalIntegrationId {
    GitHub,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceIntegrationSummary {
    pub id: WorkspaceIntegrationId,
    pub status: IntegrationStatus,

    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub created_at: Option<Timestamp>,
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<Timestamp>,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize, Display, EnumIter)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "lowercase")]
pub enum WorkspaceIntegrationId {
    PagerDutyWebhook,
    GitHubApp,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Display, EnumIter)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum IntegrationStatus {
    Connected,
    Disconnected,
    AttentionRequired { reason: String },
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct GitHubAppDetails {
    /// GitHub organization id
    pub org_id: i32,

    /// GitHub organization name
    #[builder(setter(into))]
    pub org_name: String,

    /// Timestamp when this integration was installed
    #[builder(setter(into))]
    pub created_at: Timestamp,
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum GitHubAppDetailsError {
    #[error("The GitHub app was not yet installed")]
    NotInstalled,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl GitHubAppDetailsError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            GitHubAppDetailsError::NotInstalled => StatusCode::NOT_FOUND,
            GitHubAppDetailsError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            GitHubAppDetailsError::Auth(err) => err.status_code(),
        }
    }
}

impl From<AuthError> for GitHubAppDetailsError {
    fn from(value: AuthError) -> Self {
        GitHubAppDetailsError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for GitHubAppDetailsError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for GitHubAppDetailsError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum GitHubAppInstallFlowError {
    #[error("the integration has already been installed for this workspace")]
    AlreadyInstalled,

    #[error("unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl GitHubAppInstallFlowError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            GitHubAppInstallFlowError::AlreadyInstalled => StatusCode::CONFLICT,
            GitHubAppInstallFlowError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            GitHubAppInstallFlowError::Auth(auth) => auth.status_code(),
        }
    }
}

impl From<AuthError> for GitHubAppInstallFlowError {
    fn from(value: AuthError) -> Self {
        GitHubAppInstallFlowError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for GitHubAppInstallFlowError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for GitHubAppInstallFlowError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum GitHubAppInstallRedirectError {
    #[error("The provided code could not be exchanged into a Bearer token by GitHub")]
    InvalidCode,

    #[error("Failed to query installations for user on GitHub")]
    InstallationAccessDenied,

    #[error("No installation found on account with the provided `installation_id`")]
    InstallationNotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl GitHubAppInstallRedirectError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            GitHubAppInstallRedirectError::InvalidCode => StatusCode::BAD_REQUEST,
            GitHubAppInstallRedirectError::InstallationAccessDenied => StatusCode::BAD_GATEWAY,
            GitHubAppInstallRedirectError::InstallationNotFound => StatusCode::BAD_REQUEST,
            GitHubAppInstallRedirectError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            GitHubAppInstallRedirectError::Auth(err) => err.status_code(),
        }
    }
}

impl From<AuthError> for GitHubAppInstallRedirectError {
    fn from(value: AuthError) -> Self {
        GitHubAppInstallRedirectError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for GitHubAppInstallRedirectError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for GitHubAppInstallRedirectError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum GitHubAppUninstallError {
    #[error("the integration is not installed")]
    NotInstalled,

    #[error("unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl GitHubAppUninstallError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            GitHubAppUninstallError::NotInstalled => StatusCode::NOT_FOUND,
            GitHubAppUninstallError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            GitHubAppUninstallError::Auth(err) => err.status_code(),
        }
    }
}

impl From<AuthError> for GitHubAppUninstallError {
    fn from(value: AuthError) -> Self {
        GitHubAppUninstallError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for GitHubAppUninstallError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for GitHubAppUninstallError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[derive(Serialize, Debug, Error)]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum GitHubAppWebhookError {
    #[error("signature was not sent with the request")]
    SignatureMissing,

    #[error("signature header was sent with the request but incorrectly formatted")]
    SignatureInvalid,

    #[error("unsupported signature algorithm, only sha256 is supported")]
    SignatureAlgorithmUnsupported,

    #[error("signature mismatch")]
    SignatureMismatch,

    #[error("failed to parse payload as JSON")]
    InvalidJson,

    #[error("payload did not contain installation id")]
    NoInstallation,

    #[error("installation id is not registered with us")]
    InstallationIdUnknown,

    #[error("invalid github app config")]
    InvalidConfig,

    #[error("event header missing")]
    EventMissing,

    #[error("event header contains non ascii characters")]
    EventInvalid,

    #[error("unknown error occurred")]
    InternalServerError,
}

impl GitHubAppWebhookError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            GitHubAppWebhookError::SignatureMissing => StatusCode::BAD_REQUEST,
            GitHubAppWebhookError::SignatureInvalid => StatusCode::BAD_REQUEST,
            GitHubAppWebhookError::SignatureAlgorithmUnsupported => StatusCode::BAD_REQUEST,
            GitHubAppWebhookError::SignatureMismatch => StatusCode::BAD_REQUEST,
            GitHubAppWebhookError::InvalidJson => StatusCode::BAD_REQUEST,
            GitHubAppWebhookError::NoInstallation => StatusCode::BAD_REQUEST,
            GitHubAppWebhookError::InstallationIdUnknown => StatusCode::NOT_FOUND,
            GitHubAppWebhookError::InvalidConfig => StatusCode::INTERNAL_SERVER_ERROR,
            GitHubAppWebhookError::EventMissing => StatusCode::BAD_REQUEST,
            GitHubAppWebhookError::EventInvalid => StatusCode::BAD_REQUEST,
            GitHubAppWebhookError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for GitHubAppWebhookError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for GitHubAppWebhookError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct GitHubAppAddPullRequest {
    /// The url of the GitHub pull request
    pub url: String,
}

#[derive(Serialize, Debug, Error)]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum GitHubAppAddPullRequestError {
    #[error("access denied to repository")]
    AccessDenied,

    #[error("provided url is invalid")]
    InvalidUrl,

    #[error("integration not installed")]
    IntegrationNotInstalled,

    #[error("refresh token expired, please re-link integration")]
    RefreshTokenExpired,

    #[error("didnt receive new refresh token from GitHub")]
    RefreshTokenNotReceived,

    #[error("unknown error occurred")]
    InternalServerError,

    #[error(transparent)]
    Auth(AuthError),
}

impl GitHubAppAddPullRequestError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            GitHubAppAddPullRequestError::AccessDenied => StatusCode::UNAUTHORIZED,
            GitHubAppAddPullRequestError::InvalidUrl => StatusCode::BAD_REQUEST,
            GitHubAppAddPullRequestError::IntegrationNotInstalled => {
                StatusCode::PRECONDITION_FAILED
            }
            GitHubAppAddPullRequestError::RefreshTokenExpired => StatusCode::GONE,
            GitHubAppAddPullRequestError::RefreshTokenNotReceived => StatusCode::BAD_GATEWAY,
            GitHubAppAddPullRequestError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            GitHubAppAddPullRequestError::Auth(auth) => auth.status_code(),
        }
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for GitHubAppAddPullRequestError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for GitHubAppAddPullRequestError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

impl From<AuthError> for GitHubAppAddPullRequestError {
    fn from(value: AuthError) -> Self {
        GitHubAppAddPullRequestError::Auth(value)
    }
}
