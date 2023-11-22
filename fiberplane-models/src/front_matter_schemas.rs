use std::collections::HashMap;

use crate::timestamps::Timestamp;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use strum_macros::Display;
use typed_builder::TypedBuilder;

/// Front Matter Schema representation.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, Default)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
pub struct FrontMatterSchema(HashMap<String, FrontMatterValueSchema>);

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, Display)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum FrontMatterValueSchema {
    Number(FrontMatterNumberSchema),
    String(FrontMatterStringSchema),
    DateTime(FrontMatterDateTimeSchema),
    User(FrontMatterUserSchema),
}

impl From<FrontMatterUserSchema> for FrontMatterValueSchema {
    fn from(v: FrontMatterUserSchema) -> Self {
        Self::User(v)
    }
}

impl From<FrontMatterDateTimeSchema> for FrontMatterValueSchema {
    fn from(v: FrontMatterDateTimeSchema) -> Self {
        Self::DateTime(v)
    }
}

impl From<FrontMatterStringSchema> for FrontMatterValueSchema {
    fn from(v: FrontMatterStringSchema) -> Self {
        Self::String(v)
    }
}

impl From<FrontMatterNumberSchema> for FrontMatterValueSchema {
    fn from(v: FrontMatterNumberSchema) -> Self {
        Self::Number(v)
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterNumberSchema {
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,
    pub multiple: bool,
    pub allow_extra_values: bool,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<FrontMatterEnumValue<f64>>>,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub unit: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterStringSchema {
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,
    pub multiple: bool,
    pub allow_extra_values: bool,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<FrontMatterEnumValue<String>>>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterDateTimeSchema {
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    icon_name: Option<String>,
    multiple: bool,
    allow_extra_values: bool,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    options: Option<Vec<FrontMatterEnumValue<Timestamp>>>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterUserSchema {
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    icon_name: Option<String>,
    multiple: bool,
    allow_extra_values: bool,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    options: Option<Vec<FrontMatterEnumValue<Base64Uuid>>>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterEnumValue<T>
where
    T: Serialize + 'static + PartialEq + Clone + std::fmt::Debug,
{
    value: T,
}
