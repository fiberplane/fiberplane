use crate::names::Name;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use time::OffsetDateTime;
use typed_builder::TypedBuilder;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::templates")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub enum TemplateParameterType {
    String,
    Number,
    Boolean,
    // Note: we may add the nested types in the future.
    // If we do, we should add it in a non-breaking way
    // so that serialized objects created with this schema
    // can still be deserialized.
    Object,
    Array,
    /// We can only extract the parameter type from function parameters
    /// that have default values
    Unknown,
}

impl Default for TemplateParameterType {
    fn default() -> Self {
        Self::Unknown
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::templates")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TemplateParameter {
    #[builder(setter(into))]
    pub name: String,
    #[builder(default)]
    #[serde(rename = "type")]
    pub ty: TemplateParameterType,
    #[builder(default, setter(into, strip_option))]
    pub default_value: Option<Value>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::templates")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Template {
    pub id: Base64Uuid,
    pub name: Name,
    pub description: String,
    pub body: String,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated_at: OffsetDateTime,
    pub parameters: Vec<TemplateParameter>,
}
