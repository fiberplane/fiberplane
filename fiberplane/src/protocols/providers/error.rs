use std::num::ParseFloatError;

use super::HttpRequestError;
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, Serializable)]
#[fp(rust_plugin_module = "fiberplane::protocols::providers")]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Error {
    UnsupportedRequest,
    ValidationError {
        /// List of errors, so all fields that failed validation can
        /// be highlighted at once.
        errors: Vec<ValidationError>,
    },
    #[fp(rename_all = "camelCase")]
    Http {
        error: HttpRequestError,
    },
    #[fp(rename_all = "camelCase")]
    Data {
        message: String,
    },
    #[fp(rename_all = "camelCase")]
    Deserialization {
        message: String,
    },
    #[fp(rename_all = "camelCase")]
    Config {
        message: String,
    },
    #[fp(rename_all = "camelCase")]
    Other {
        message: String,
    },
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

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, Serializable)]
#[fp(rust_plugin_module = "fiberplane::protocols::providers")]
#[serde(rename_all = "camelCase")]
pub struct ValidationError {
    /// Refers to a field from the query schema.
    pub field_name: String,
    /// Description of why the validation failed.
    pub message: String,
}