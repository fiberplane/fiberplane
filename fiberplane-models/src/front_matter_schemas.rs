use crate::timestamps::Timestamp;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use ordered_float::OrderedFloat;
use serde::{Deserialize, Serialize};
use strum_macros::Display;
use typed_builder::TypedBuilder;

/// A floating-point number that can be ordered and compared using Eq.
///  
/// It is not compliant to IEEE standard, and NaN is considered greater than
/// everything and equal to itself.
///
/// Also, this type is serializable using fp-bindgen, transparently to the underlying
/// f64 primitive.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Default)]
#[repr(transparent)]
pub struct SerializableEqFloat(OrderedFloat<f64>);

#[cfg(feature = "fp-bindgen")]
impl Serializable for SerializableEqFloat {
    fn ident() -> fp_bindgen::types::TypeIdent {
        fp_bindgen::types::TypeIdent::from("f64")
    }

    fn ty() -> fp_bindgen::types::Type {
        fp_bindgen::types::Type::Primitive(fp_bindgen::primitives::Primitive::F64)
    }
}

impl<T: Into<f64>> From<T> for SerializableEqFloat {
    fn from(value: T) -> Self {
        Self(OrderedFloat(value.into()))
    }
}

/// Front Matter Schema representation.
///
/// The order of the elements in the schema drives the order of
/// rendering elements.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Default)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[repr(transparent)]
pub struct FrontMatterSchema(pub Vec<FrontMatterSchemaEntry>);

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterSchemaEntry {
    /// The key to use to target the front matter value in a notebook storage (Notebook::frontmatter).
    ///
    /// Currently, this key is also used to decide the "display" name of the front matter key
    #[builder(setter(into))]
    pub key: String,

    #[builder(setter(into))]
    pub schema: FrontMatterValueSchema,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Display)]
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

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterNumberSchema {
    #[builder(default, setter(into))]
    pub display_name: String,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,
    // Skip serialization if the bool is false, and defaults to false, and the setter in typed_builder will set the field to true.
    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub multiple: bool,
    pub allow_extra_values: bool,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<FrontMatterEnumNumberValue>>,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<FrontMatterEnumNumberValue>,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prefix: Option<String>,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suffix: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterStringSchema {
    #[builder(default, setter(into))]
    pub display_name: String,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,
    // Skip serialization if the bool is false, and defaults to false, and the setter in typed_builder will set the field to true.
    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub multiple: bool,
    pub allow_extra_values: bool,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<FrontMatterEnumStringValue>>,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<FrontMatterEnumStringValue>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterDateTimeSchema {
    #[builder(default, setter(into))]
    pub display_name: String,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,
    // Skip serialization if the bool is false, and defaults to false, and the setter in typed_builder will set the field to true.
    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub multiple: bool,
    pub allow_extra_values: bool,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<FrontMatterEnumDateTimeValue>>,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<FrontMatterEnumDateTimeValue>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
pub struct FrontMatterUserSchema {
    #[builder(default, setter(into))]
    pub display_name: String,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,
    // Skip serialization if the bool is false, and defaults to false, and the setter in typed_builder will set the field to true.
    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub multiple: bool,
    pub allow_extra_values: bool,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<FrontMatterEnumBase64UuidValue>>,
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<FrontMatterEnumBase64UuidValue>,
}

// NOTE: The cleaner way would be to have a generic type FrontMatterEnumValue<T>,
// but it's impossible to _conditionnally_ add the `Serializable` trait bound on
// the inner type T only when there is the "fp-bindgen" feature.

// NOTE: The reason those are struct instead of "just" being the
// inner value is because we are already thinking of adding extra properties (like "color")
// to the known options of an enumeration

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterEnumBase64UuidValue {
    value: Base64Uuid,
}
impl From<Base64Uuid> for FrontMatterEnumBase64UuidValue {
    fn from(value: Base64Uuid) -> Self {
        Self { value }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterEnumStringValue {
    value: String,
}

impl<T: Into<String>> From<T> for FrontMatterEnumStringValue {
    fn from(value: T) -> Self {
        Self {
            value: value.into(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterEnumNumberValue {
    value: SerializableEqFloat,
}
impl<T: Into<f64>> From<T> for FrontMatterEnumNumberValue {
    fn from(value: T) -> Self {
        Self {
            value: SerializableEqFloat(OrderedFloat(value.into())),
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterEnumDateTimeValue {
    value: Timestamp,
}
impl<T: Into<Timestamp>> From<T> for FrontMatterEnumDateTimeValue {
    fn from(value: T) -> Self {
        Self {
            value: value.into(),
        }
    }
}