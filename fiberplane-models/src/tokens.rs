use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use typed_builder::TypedBuilder;

use crate::timestamps::Timestamp;

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::tokens")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TokenSummary {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    #[builder(setter(into))]
    pub title: String,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<Timestamp>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::tokens")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewToken {
    pub title: String,
}

impl NewToken {
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            title: title.into(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::tokens")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Token {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    #[builder(setter(into))]
    pub title: String,

    #[builder(setter(into))]
    pub token: String,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<Timestamp>,
}
