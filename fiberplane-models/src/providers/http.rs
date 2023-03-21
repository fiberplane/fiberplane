use crate::debug_print_bytes;
use bytes::Bytes;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fmt::{self, Debug, Formatter};
use typed_builder::TypedBuilder;

/// HTTP request options.
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct HttpRequest {
    pub url: String,

    pub method: HttpRequestMethod,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body: Option<Bytes>,
}

impl HttpRequest {
    /// Returns a new DELETE request to the given URL.
    pub fn delete(url: impl Into<String>) -> Self {
        Self {
            url: url.into(),
            method: HttpRequestMethod::Delete,
            ..Default::default()
        }
    }

    /// Returns a new GET request to the given URL.
    pub fn get(url: impl Into<String>) -> Self {
        Self {
            url: url.into(),
            method: HttpRequestMethod::Get,
            ..Default::default()
        }
    }

    /// Returns a new POST request to the given URL with the given body.
    pub fn post(url: impl Into<String>, body: impl Into<Bytes>) -> Self {
        Self {
            url: url.into(),
            method: HttpRequestMethod::Post,
            body: Some(body.into()),
            ..Default::default()
        }
    }

    /// Returns a new PATCH request to the given URL with the given body.
    pub fn patch(url: impl Into<String>, body: impl Into<Bytes>) -> Self {
        Self {
            url: url.into(),
            method: HttpRequestMethod::Patch,
            body: Some(body.into()),
            ..Default::default()
        }
    }

    /// Returns a new PUT request to the given URL with the given body.
    pub fn put(url: impl Into<String>, body: impl Into<Bytes>) -> Self {
        Self {
            url: url.into(),
            method: HttpRequestMethod::Put,
            body: Some(body.into()),
            ..Default::default()
        }
    }

    /// Adds the given headers to the request.
    pub fn with_headers(self, headers: impl Into<BTreeMap<String, String>>) -> Self {
        Self {
            headers: Some(headers.into()),
            ..self
        }
    }
}

/// Possible errors that may happen during an HTTP request.
#[derive(Clone, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum HttpRequestError {
    Offline,
    NoRoute,
    ConnectionRefused,
    Timeout,
    ResponseTooBig,
    #[cfg_attr(feature = "fp-bindgen", fp(rename_all = "camelCase"))]
    ServerError {
        status_code: u16,
        response: Bytes,
    },
    #[cfg_attr(feature = "fp-bindgen", fp(rename_all = "camelCase"))]
    Other {
        reason: String,
    },
}

impl Debug for HttpRequestError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Self::Offline => f.write_str("Offline"),
            Self::NoRoute => f.write_str("NoRoute"),
            Self::ConnectionRefused => f.write_str("ConnectionRefused"),
            Self::Timeout => f.write_str("Timeout"),
            Self::ResponseTooBig => f.write_str("ResponseTooBig"),
            Self::ServerError {
                status_code,
                response,
            } => f
                .debug_struct("ServerError")
                .field("status_code", status_code)
                .field("response_length", &response.len())
                .field("response", &debug_print_bytes(response))
                .finish(),
            Self::Other { reason } => f.debug_struct("Other").field("reason", reason).finish(),
        }
    }
}

/// HTTP request method.
// Note: we use SCREAMING_SNAKE_CASE here because this is
// effectively a constant
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum HttpRequestMethod {
    Delete,
    #[default]
    Get,
    Head,
    Options,
    Patch,
    Post,
    Put,
}

/// Response to an HTTP request.
#[derive(Clone, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct HttpResponse {
    #[builder(setter(into))]
    pub body: Bytes,

    #[builder(setter(into))]
    pub headers: BTreeMap<String, String>,

    pub status_code: u16,
}

impl Debug for HttpResponse {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.debug_struct("HttpResponse")
            .field("status_code", &self.status_code)
            .field("headers", &self.headers)
            .field("body_length", &self.body.len())
            .field("body", &debug_print_bytes(&self.body))
            .finish()
    }
}
