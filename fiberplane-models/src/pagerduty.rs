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
use {
    axum_06::http::StatusCode,
    axum_06::response::{IntoResponse, Response},
};

/// A new PagerDuty receiver. This will be used in the create endpoint.
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewPagerDutyReceiver {
    /// A reference to a template that will be expanded when a incident is
    /// created. If this is empty then no template will be expanded.
    #[builder(default, setter())]
    pub incident_created_template_name: Option<Name>,
}

/// PagerDutyReceiver represents a single PagerDuty receiver in Fiberplane.
#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct PagerDutyReceiver {
    /// Unique identifier for the PagerDuty receiver for a workspace.
    pub name: Name,

    /// A reference to a template that will be expanded when a incident is
    /// created. If this is empty then no template will be expanded.
    #[builder(default, setter())]
    pub incident_created_template_name: Option<Name>,

    /// A shared security-key that should be set in the PagerDuty webhook
    /// customer header.
    pub security_key: String,

    /// The URL that should be set in the PagerDuty webhook.
    pub webhook_url: String,

    /// Timestamp that the PagerDuty receiver was created.
    #[builder(setter(into))]
    pub created_at: Timestamp,

    /// Timestamp that the PagerDuty receiver was last updated.
    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq, TypedBuilder)]
#[non_exhaustive]
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

    /// If this value is set to true, then a new random security-key will be
    /// generated. This new value will be part of the response.
    #[builder(default, setter())]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub regenerate_security_key: bool,
}

/// Errors that can occur when creating a new PagerDuty receiver.
#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::pagerduty")
)]
#[non_exhaustive]
#[serde(tag = "error", rename_all = "snake_case")]
pub enum PagerDutyReceiverCreateError {
    #[error("Name of the PagerDuty receiver is already in use")]
    DuplicateName,

    #[error("Referenced creation template does not exist")]
    CreationTemplateNotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[serde(untagged)]
    #[error(transparent)]
    Auth(AuthError),
}

impl From<AuthError> for PagerDutyReceiverCreateError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverCreateError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl IntoResponse for PagerDutyReceiverCreateError {
    fn into_response(self) -> Response {
        let body = serde_json::to_string(&self).expect("should never fail!");
        let status_code = match self {
            PagerDutyReceiverCreateError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverCreateError::CreationTemplateNotFound => StatusCode::BAD_REQUEST,
            PagerDutyReceiverCreateError::Auth(AuthError::Unauthenticated) => {
                StatusCode::UNAUTHORIZED
            }
            PagerDutyReceiverCreateError::Auth(AuthError::Unauthorized) => StatusCode::FORBIDDEN,
            PagerDutyReceiverCreateError::DuplicateName => StatusCode::BAD_REQUEST,
        };

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
#[serde(tag = "error", rename_all = "snake_case")]
pub enum PagerDutyReceiverGetError {
    #[error("PagerDuty receiver not found")]
    NotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[serde(untagged)]
    #[error(transparent)]
    Auth(AuthError),
}

impl From<AuthError> for PagerDutyReceiverGetError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverGetError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl IntoResponse for PagerDutyReceiverGetError {
    fn into_response(self) -> Response {
        let body = serde_json::to_string(&self).expect("should never fail!");
        let status_code = match self {
            PagerDutyReceiverGetError::NotFound => StatusCode::NOT_FOUND,
            PagerDutyReceiverGetError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverGetError::Auth(AuthError::Unauthenticated) => StatusCode::UNAUTHORIZED,
            PagerDutyReceiverGetError::Auth(AuthError::Unauthorized) => StatusCode::FORBIDDEN,
        };

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
#[serde(tag = "error", rename_all = "snake_case")]
pub enum PagerDutyReceiverUpdateError {
    #[error("PagerDuty receiver not found")]
    NotFound,

    #[error("Referenced creation template does not exist")]
    CreationTemplateNotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[serde(untagged)]
    #[error(transparent)]
    Auth(AuthError),
}

impl From<AuthError> for PagerDutyReceiverUpdateError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverUpdateError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl IntoResponse for PagerDutyReceiverUpdateError {
    fn into_response(self) -> Response {
        let body = serde_json::to_string(&self).expect("should never fail!");
        let status_code = match self {
            PagerDutyReceiverUpdateError::NotFound => StatusCode::NOT_FOUND,
            PagerDutyReceiverUpdateError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverUpdateError::CreationTemplateNotFound => StatusCode::BAD_REQUEST,
            PagerDutyReceiverUpdateError::Auth(AuthError::Unauthenticated) => {
                StatusCode::UNAUTHORIZED
            }
            PagerDutyReceiverUpdateError::Auth(AuthError::Unauthorized) => StatusCode::FORBIDDEN,
        };

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
#[serde(tag = "error", rename_all = "snake_case")]
pub enum PagerDutyReceiverDeleteError {
    #[error("PagerDuty receiver not found")]
    NotFound,

    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[serde(untagged)]
    #[error(transparent)]
    Auth(AuthError),
}

impl From<AuthError> for PagerDutyReceiverDeleteError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverDeleteError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl IntoResponse for PagerDutyReceiverDeleteError {
    fn into_response(self) -> Response {
        let body = serde_json::to_string(&self).expect("should never fail!");
        let status_code = match self {
            PagerDutyReceiverDeleteError::NotFound => StatusCode::NOT_FOUND,
            PagerDutyReceiverDeleteError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverDeleteError::Auth(AuthError::Unauthenticated) => {
                StatusCode::UNAUTHORIZED
            }
            PagerDutyReceiverDeleteError::Auth(AuthError::Unauthorized) => StatusCode::FORBIDDEN,
        };

        (status_code, body).into_response()
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
pub enum PagerDutyReceiverListError {
    #[error("Unknown error occurred")]
    InternalServerError,

    /// Common auth errors.
    #[serde(untagged)]
    #[error(transparent)]
    Auth(AuthError),
}

impl From<AuthError> for PagerDutyReceiverListError {
    fn from(value: AuthError) -> Self {
        PagerDutyReceiverListError::Auth(value)
    }
}

#[cfg(feature = "axum_06")]
impl IntoResponse for PagerDutyReceiverListError {
    fn into_response(self) -> Response {
        let body = serde_json::to_string(&self).expect("should never fail!");
        let status_code = match self {
            PagerDutyReceiverListError::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
            PagerDutyReceiverListError::Auth(AuthError::Unauthenticated) => {
                StatusCode::UNAUTHORIZED
            }
            PagerDutyReceiverListError::Auth(AuthError::Unauthorized) => StatusCode::FORBIDDEN,
        };

        (status_code, body).into_response()
    }
}

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
