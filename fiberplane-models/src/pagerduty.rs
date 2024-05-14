//! PagerDuty related models.
//!
//! A PagerDuty receiver is a resource that is defined in Fiberplane. It works
//! unison with a PagerDuty webhook, which is defined in PagerDuty. A PagerDuty
//! webhook will have its target URL set to the receiver.
//!
//! Once a incident is created in PagerDuty, PagerDuty will send a webhook to a
//! webhook receiver. Depending on the configuration of the receiver this will
//! create a new notebook based on a template, it can also update any
//! front-matter values defined in any notebook.
//!
//! A shared security-key should be set in the PagerDuty webhook customer header
//! which will verified by Fiberplane. If the security-key does not match, the
//! request will be dropped. The header should be <..> and contain the
//! security-key as-is.

use crate::auth::AuthError;
use crate::names::Name;
use crate::sorting::SortField;
use crate::timestamps::Timestamp;
use serde::{Deserialize, Serialize};
use strum_macros::IntoStaticStr;
use thiserror::Error;
use typed_builder::TypedBuilder;

#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;

#[cfg(feature = "axum_06")]
use http_02::StatusCode;

use crate::errors::GeneralError;
#[cfg(feature = "axum_07")]
use http_1::StatusCode;

/// A new PagerDuty receiver. This will be used in the create endpoint.
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewPagerDutyReceiver {
    /// A reference to a template that will be expanded when a incident is
    /// created. If this is empty then no template will be expanded.
    #[builder(default, setter())]
    pub incident_created_template_name: Option<Name>,

    /// A secret as defined by PagerDuty when creating the webhook. This secret
    /// will be use to verify that any incoming webhooks are valid.
    #[builder(default, setter(into))]
    pub secret: Option<String>,
}

/// PagerDutyReceiver represents a single PagerDuty receiver in Fiberplane.
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct PagerDutyReceiver {
    /// Unique identifier for the PagerDuty receiver for a workspace.
    pub name: Name,

    /// A reference to a template that will be expanded when a incident is
    /// created. If this is empty then no template will be expanded.
    #[builder(default, setter())]
    pub incident_created_template_name: Option<Name>,

    /// The URL that should be set in the PagerDuty webhook.
    pub webhook_url: String,

    /// A secret is set on the PagerDuty receiver. This will verify any incoming
    /// webhooks against this secret and drops requests that do no pass.
    pub secret_set: bool,

    /// Timestamp that the PagerDuty receiver was created.
    #[builder(setter(into))]
    pub created_at: Timestamp,

    /// Timestamp that the PagerDuty receiver was last updated.
    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq, TypedBuilder)]
#[non_exhaustive]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePagerDutyReceiver {
    /// A reference to a template that will be expanded when a incident is
    /// created. If this is empty then no template will be expanded.
    #[builder(default, setter())]
    #[serde(
        default,
        deserialize_with = "crate::deserialize_some",
        skip_serializing_if = "Option::is_none"
    )]
    pub incident_created_template_name: Option<Option<Name>>,

    /// A secret as defined by PagerDuty when creating the webhook. This secret
    /// will be use to verify that any incoming webhooks are valid.
    ///
    /// Set this to `None` to remove the secret and disable verification.
    #[builder(default, setter(into))]
    #[serde(
        default,
        deserialize_with = "crate::deserialize_some",
        skip_serializing_if = "Option::is_none"
    )]
    pub secret: Option<Option<String>>,
}

/// Errors that can occur when creating a new PagerDuty receiver.
#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum PagerDutyReceiverCreateError {
    #[error("Name of the PagerDuty receiver is already in use")]
    DuplicateName,

    #[error("Referenced creation template does not exist")]
    CreationTemplateNotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl PagerDutyReceiverCreateError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            PagerDutyReceiverCreateError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverCreateError::CreationTemplateNotFound => StatusCode::BAD_REQUEST,
            PagerDutyReceiverCreateError::DuplicateName => StatusCode::BAD_REQUEST,
            PagerDutyReceiverCreateError::Auth(auth_err) => auth_err.status_code(),
        }
    }
}

impl From<AuthError> for PagerDutyReceiverCreateError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverCreateError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for PagerDutyReceiverCreateError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for PagerDutyReceiverCreateError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

/// Errors that can occur when retrieving a PagerDuty receiver.
#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum PagerDutyReceiverGetError {
    #[error("PagerDuty receiver not found")]
    NotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl PagerDutyReceiverGetError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            PagerDutyReceiverGetError::NotFound => StatusCode::NOT_FOUND,
            PagerDutyReceiverGetError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverGetError::Auth(auth_err) => auth_err.status_code(),
        }
    }
}

impl From<AuthError> for PagerDutyReceiverGetError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverGetError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for PagerDutyReceiverGetError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for PagerDutyReceiverGetError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

/// Errors that can occur when updating a PagerDuty receiver.
#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum PagerDutyReceiverUpdateError {
    #[error("PagerDuty receiver not found")]
    NotFound,

    #[error("Referenced creation template does not exist")]
    CreationTemplateNotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl PagerDutyReceiverUpdateError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            PagerDutyReceiverUpdateError::NotFound => StatusCode::NOT_FOUND,
            PagerDutyReceiverUpdateError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverUpdateError::CreationTemplateNotFound => StatusCode::BAD_REQUEST,
            PagerDutyReceiverUpdateError::Auth(auth_err) => auth_err.status_code(),
        }
    }
}

impl From<AuthError> for PagerDutyReceiverUpdateError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverUpdateError::Auth(value)
    }
}
#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for PagerDutyReceiverUpdateError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for PagerDutyReceiverUpdateError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

/// Errors that can occur when deleting a PagerDuty receiver.
#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(tag = "error", content = "details", rename_all = "snake_case")]
pub enum PagerDutyReceiverDeleteError {
    #[error("PagerDuty receiver not found")]
    NotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[error(transparent)]
    Auth(AuthError),
}

impl From<AuthError> for PagerDutyReceiverDeleteError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverDeleteError::Auth(value)
    }
}

impl PagerDutyReceiverDeleteError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            PagerDutyReceiverDeleteError::NotFound => StatusCode::NOT_FOUND,
            PagerDutyReceiverDeleteError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverDeleteError::Auth(auth_err) => auth_err.status_code(),
        }
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for PagerDutyReceiverDeleteError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for PagerDutyReceiverDeleteError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

/// Errors that can occur when listing PagerDuty receivers.
pub type PagerDutyReceiverListError = GeneralError;

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum PagerDutyReceiverListSortFields {
    Name,
    CreatedAt,
    UpdatedAt,
}

impl SortField for PagerDutyReceiverListSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Name
    }
}

/// Errors that can occur when listing PagerDuty receivers.
#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(tag = "error", rename_all = "snake_case")]
pub enum PagerDutyReceiverWebhookError {
    #[error("this event is unsupported")]
    UnsupportedEvent,

    #[error("already exists")]
    Duplicate,

    #[error("expected front matter to be of type `PagerDutyIncident` but it was not")]
    UnexpectedFrontMatterType,

    #[error("incident in front matter does not match the received incident from the webhook")]
    MismatchingIncident,

    #[error("failed to parse payload as JSON")]
    InvalidJson,

    #[error("template not found")]
    TemplateNotFound,

    #[error("failed to expand template")]
    TemplateExpansionFailed,

    #[error("Unknown error occurred")]
    InternalServerError,

    #[error("A signature is required. Either it was not provided, contained invalid characters or didn't match against the secret.")]
    InvalidSignature,
}

impl PagerDutyReceiverWebhookError {
    #[cfg(any(feature = "axum_06", feature = "axum_07"))]
    fn status_code(&self) -> StatusCode {
        match self {
            PagerDutyReceiverWebhookError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverWebhookError::InvalidSignature => StatusCode::BAD_REQUEST,
            PagerDutyReceiverWebhookError::Duplicate => StatusCode::CONFLICT,
            PagerDutyReceiverWebhookError::UnexpectedFrontMatterType => {
                StatusCode::PRECONDITION_FAILED
            }
            PagerDutyReceiverWebhookError::MismatchingIncident => StatusCode::BAD_REQUEST,
            PagerDutyReceiverWebhookError::InvalidJson => StatusCode::BAD_REQUEST,
            PagerDutyReceiverWebhookError::TemplateNotFound => StatusCode::NOT_FOUND,
            PagerDutyReceiverWebhookError::TemplateExpansionFailed => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
            PagerDutyReceiverWebhookError::UnsupportedEvent => StatusCode::NOT_IMPLEMENTED,
        }
    }
}

#[cfg(feature = "axum_06")]
impl axum_06::response::IntoResponse for PagerDutyReceiverWebhookError {
    fn into_response(self) -> axum_06::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}

#[cfg(feature = "axum_07")]
impl axum_07::response::IntoResponse for PagerDutyReceiverWebhookError {
    fn into_response(self) -> axum_07::response::Response {
        let body = serde_json::to_string(&self).expect("unable to serialize error body");
        let status_code = self.status_code();

        (status_code, body).into_response()
    }
}
