use super::HttpRequestError;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::num::ParseFloatError;
use typed_builder::TypedBuilder;

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, thiserror::Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Error {
    #[error("unsupported request")]
    UnsupportedRequest,
    #[error("validation error: {errors:?}")]
    ValidationError {
        /// List of errors, so all fields that failed validation can
        /// be highlighted at once.
        errors: Vec<ValidationError>,
    },
    #[error("http error: {error:?}")]
    #[cfg_attr(feature = "fp-bindgen", fp(rename_all = "camelCase"))]
    Http { error: HttpRequestError },
    #[error("data error: {message}")]
    #[cfg_attr(feature = "fp-bindgen", fp(rename_all = "camelCase"))]
    Data { message: String },
    #[error("deserialization error: {message}")]
    #[cfg_attr(feature = "fp-bindgen", fp(rename_all = "camelCase"))]
    Deserialization { message: String },
    #[error("config error: {message}")]
    #[cfg_attr(feature = "fp-bindgen", fp(rename_all = "camelCase"))]
    Config { message: String },
    #[error("provider cannot be found")]
    NotFound,
    #[error("proxy is disconnected")]
    ProxyDisconnected,
    #[error("error invoking provider: {message}")]
    Invocation { message: String },
    #[error("error: {message}")]
    #[cfg_attr(feature = "fp-bindgen", fp(rename_all = "camelCase"))]
    Other { message: String },
}

impl From<base64::DecodeError> for Error {
    fn from(error: base64::DecodeError) -> Self {
        Self::Deserialization {
            message: format!("Invalid base64 string: {error}"),
        }
    }
}

impl From<HttpRequestError> for Error {
    fn from(error: HttpRequestError) -> Self {
        Self::Http { error }
    }
}

impl From<ParseFloatError> for Error {
    fn from(error: ParseFloatError) -> Self {
        Self::Deserialization {
            message: format!("Invalid floating point number: {error}"),
        }
    }
}

impl From<rmpv::decode::Error> for Error {
    fn from(error: rmpv::decode::Error) -> Self {
        Self::Deserialization {
            message: format!("Invalid MessagePack payload: {error}"),
        }
    }
}

impl From<rmp_serde::decode::Error> for Error {
    fn from(error: rmp_serde::decode::Error) -> Self {
        Self::Deserialization {
            message: format!("Invalid MessagePack payload: {error}"),
        }
    }
}
impl From<rmp_serde::encode::Error> for Error {
    fn from(error: rmp_serde::encode::Error) -> Self {
        Self::Data {
            message: format!("Cannot serialize to MessagePack: {error}"),
        }
    }
}

impl From<serde_json::Error> for Error {
    fn from(error: serde_json::Error) -> Self {
        Self::Deserialization {
            message: format!("Invalid JSON payload: {error}"),
        }
    }
}

impl From<time::error::Parse> for Error {
    fn from(error: time::error::Parse) -> Self {
        Self::Deserialization {
            message: format!("Invalid date time: {error}"),
        }
    }
}

impl From<crate::notebooks::InvalidTableId> for Error {
    fn from(error: crate::notebooks::InvalidTableId) -> Self {
        Self::Other {
            message: format!("Invalid ID in table: {error}"),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ValidationError {
    /// Refers to a field from the query schema.
    #[builder(setter(into))]
    pub field_name: String,

    /// Description of why the validation failed.
    #[builder(setter(into))]
    pub message: String,
}
