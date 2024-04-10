use crate::notebooks::{
    front_matter::{
        FrontMatterDateTimeValue, FrontMatterNumberValue, FrontMatterPagerDutyIncident,
        FrontMatterStringList, FrontMatterStringValue, FrontMatterUserList, FrontMatterUserValue,
        FrontMatterValidationError, FrontMatterValue,
    },
    operations::FrontMatterSchemaRow,
};
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use ordered_float::OrderedFloat;
use serde::{Deserialize, Serialize};
use serde_json::Value;
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
pub struct SerializableEqFloat(pub OrderedFloat<f64>);

#[cfg(feature = "fp-bindgen")]
impl Serializable for SerializableEqFloat {
    fn ident() -> fp_bindgen::types::TypeIdent {
        fp_bindgen::types::TypeIdent::from("f64")
    }

    fn ty() -> fp_bindgen::types::Type {
        // fp_bindgen::types::Type::Primitive(fp_bindgen::primitives::Primitive::F64)

        fp_bindgen::types::Type::Custom(fp_bindgen::types::CustomType {
            ident: fp_bindgen::types::TypeIdent::from("SerializableEqFloat"),
            rs_ty: "f64".to_owned(),
            ts_ty: "number".to_owned(),
            // Not filling the BTreeMap here can be wrong, but as long as fiberplane_models ends up
            // in the dependencies of downstream users, it should be fine.
            rs_dependencies: std::collections::BTreeMap::new(),
            serde_attrs: Vec::new(),
            ts_declaration: None,
        })
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

impl std::ops::Deref for FrontMatterSchema {
    type Target = Vec<FrontMatterSchemaEntry>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl std::ops::DerefMut for FrontMatterSchema {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl From<Vec<FrontMatterSchemaEntry>> for FrontMatterSchema {
    fn from(value: Vec<FrontMatterSchemaEntry>) -> Self {
        Self(value)
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
pub struct FrontMatterSchemaEntry {
    /// The key to use to target the front matter value in a notebook storage (Notebook::frontmatter).
    ///
    /// Currently, this key is also used to decide the "display" name of the front matter key
    #[builder(setter(into))]
    pub key: String,

    #[builder(setter(into))]
    pub schema: FrontMatterValueSchema,
}

impl FrontMatterSchemaEntry {
    pub fn validate_value(
        &self,
        value: serde_json::Value,
    ) -> Result<FrontMatterValue, FrontMatterValidationError> {
        self.schema.validate_value(value)
    }
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

    #[serde(rename = "pagerduty_incident")]
    PagerDutyIncident(FrontMatterPagerDutyIncidentSchema),
}

impl FrontMatterValueSchema {
    pub fn validate_value(
        &self,
        value: serde_json::Value,
    ) -> Result<FrontMatterValue, FrontMatterValidationError> {
        match self {
            FrontMatterValueSchema::Number(schema) => schema.validate_value(value),
            FrontMatterValueSchema::String(schema) => schema.validate_value(value),
            FrontMatterValueSchema::DateTime(schema) => schema.validate_value(value),
            FrontMatterValueSchema::User(schema) => schema.validate_value(value),
            FrontMatterValueSchema::PagerDutyIncident(schema) => schema.validate_value(value),
        }
    }

    pub fn validate_front_matter_value(
        &self,
        value: &FrontMatterValue,
    ) -> Result<(), FrontMatterValidationError> {
        match self {
            FrontMatterValueSchema::Number(schema) => schema.validate_front_matter_value(value),
            FrontMatterValueSchema::String(schema) => schema.validate_front_matter_value(value),
            FrontMatterValueSchema::DateTime(schema) => schema.validate_front_matter_value(value),
            FrontMatterValueSchema::User(schema) => schema.validate_front_matter_value(value),
            FrontMatterValueSchema::PagerDutyIncident(schema) => {
                schema.validate_front_matter_value(value)
            }
        }
    }
}

impl FrontMatterNumberSchema {
    pub fn validate_value(
        &self,
        value: serde_json::Value,
    ) -> Result<FrontMatterValue, FrontMatterValidationError> {
        Ok(FrontMatterNumberValue::try_from(value)?.into())
    }

    pub fn validate_front_matter_value(
        &self,
        value: &FrontMatterValue,
    ) -> Result<(), FrontMatterValidationError> {
        match value {
            FrontMatterValue::Number(_) => Ok(()),
            other => Err(FrontMatterValidationError::wrong_variant(
                other.get_type(),
                "number",
            )),
        }
    }
}

impl FrontMatterStringSchema {
    pub fn validate_value(
        &self,
        value: serde_json::Value,
    ) -> Result<FrontMatterValue, FrontMatterValidationError> {
        if self.multiple {
            Ok(FrontMatterStringList::try_from(value)?.into())
        } else {
            Ok(FrontMatterStringValue::try_from(value)?.into())
        }
    }

    pub fn validate_front_matter_value(
        &self,
        value: &FrontMatterValue,
    ) -> Result<(), FrontMatterValidationError> {
        match (value, self.multiple) {
            (FrontMatterValue::String(_), false) => Ok(()),
            (FrontMatterValue::StringList(_), true) => Ok(()),
            (other, true) => Err(FrontMatterValidationError::wrong_variant(
                other.get_type(),
                "string_list",
            )),
            (other, false) => Err(FrontMatterValidationError::wrong_variant(
                other.get_type(),
                "string",
            )),
        }
    }
}

impl FrontMatterDateTimeSchema {
    pub fn validate_value(
        &self,
        value: serde_json::Value,
    ) -> Result<FrontMatterValue, FrontMatterValidationError> {
        Ok(FrontMatterDateTimeValue::try_from(value)?.into())
    }

    pub fn validate_front_matter_value(
        &self,
        value: &FrontMatterValue,
    ) -> Result<(), FrontMatterValidationError> {
        match value {
            FrontMatterValue::DateTime(_) => Ok(()),
            other => Err(FrontMatterValidationError::wrong_variant(
                other.get_type(),
                "date_time",
            )),
        }
    }
}

impl FrontMatterUserSchema {
    pub fn validate_value(
        &self,
        value: serde_json::Value,
    ) -> Result<FrontMatterValue, FrontMatterValidationError> {
        if self.multiple {
            Ok(FrontMatterUserList::try_from(value)?.into())
        } else {
            Ok(FrontMatterUserValue::try_from(value)?.into())
        }
    }

    pub fn validate_front_matter_value(
        &self,
        value: &FrontMatterValue,
    ) -> Result<(), FrontMatterValidationError> {
        match (value, self.multiple) {
            (FrontMatterValue::User(_), false) => Ok(()),
            (FrontMatterValue::UserList(_), true) => Ok(()),
            (other, true) => Err(FrontMatterValidationError::wrong_variant(
                other.get_type(),
                "user_list",
            )),
            (other, false) => Err(FrontMatterValidationError::wrong_variant(
                other.get_type(),
                "user",
            )),
        }
    }
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
#[serde(rename_all = "camelCase")]
pub struct FrontMatterNumberSchema {
    #[builder(default, setter(into))]
    pub display_name: String,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,

    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub allow_extra_values: bool,

    /// The list of valid "pre-filled" options one can choose for the field.
    ///
    /// There is a functional difference between `None` and `Some(Vec::new())`:
    /// - When `options.is_none()`, that means the current number field should
    ///   not propose pre-filled values at all: this front matter field is a
    ///   freeform field
    /// - When `options == Some(Vec::new())` (arguably with `allow_extra_values` being true),
    ///   that means that the field is supposed to be a "choose value from an enumerated list"-kind
    ///   of field, but without any pre-existing values being present.
    ///
    /// The difference of intent between those two cases can be used on the front-end side to decide
    /// how to render the front matter cell
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<FrontMatterNumberValue>>,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<FrontMatterNumberValue>,

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
#[serde(rename_all = "camelCase")]
pub struct FrontMatterStringSchema {
    #[builder(default, setter(into))]
    pub display_name: String,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,

    /// Whether the field can have multiple values
    // Skip serialization if the bool is false, and defaults to false, and the setter in typed_builder
    // will set the field to true.
    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub multiple: bool,

    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub allow_extra_values: bool,

    /// The list of valid "pre-filled" options one can choose for the field.
    ///
    /// There is a functional difference between `None` and `Some(Vec::new())`:
    /// - When `options.is_none()`, that means the current number field should
    ///   not propose pre-filled values at all: this front matter field is a
    ///   freeform field
    /// - When `options == Some(Vec::new())` (arguably with `allow_extra_values` being true),
    ///   that means that the field is supposed to be a "choose value from an enumerated list"-kind
    ///   of field, but without any pre-existing values being present.
    ///
    /// The difference of intent between those two cases can be used on the front-end side to decide
    /// how to render the front matter cell
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<FrontMatterStringValue>>,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<FrontMatterStringValue>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterDateTimeSchema {
    #[builder(default, setter(into))]
    pub display_name: String,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<FrontMatterDateTimeValue>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterUserSchema {
    #[builder(default, setter(into))]
    pub display_name: String,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<FrontMatterUserValue>,

    /// Whether the field can have multiple values
    // Skip serialization if the bool is false, and defaults to false, and the setter in typed_builder will set the field to true.
    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub multiple: bool,
}

/// API Payload to update an entry to a front matter schema.
///
/// The payload is received in the context of a known (Notebook,
/// target key) pair, and
/// maps easily to an [`UpdateFrontMatterSchemaOperation`](crate::notebooks::operations::UpdateFrontMatterSchemaOperation)
///
/// Notably, as the _API_ will handle the call, it can fill the ceremonial data
/// related to Operational Transform, such as getting the "old" state and "old" value
/// that are necessary to build a valid `Operation`.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterUpdateRow {
    /// The new schema to use, if unspecified the operation will leave the schema
    /// untouched (so the operation is only being used to edit the associated value).
    ///
    /// If a new schema is specified, and the data type does _not_ match between the
    /// old and the new one, then the old value will be wiped anyway.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub new_schema: Option<FrontMatterValueSchema>,

    /// The new value to set for the front matter entry.
    ///
    /// If this attribute is `None` or `null` it can mean multiple things depending on
    /// the other attributes:
    /// - if `delete_value` is `false`, this means we want to keep the current value
    ///   + it is impossible to keep the current if the schemas are incompatible. In that
    ///     case we use the `default_value` of the new schema (or nothing if there’s no default)
    /// - if `delete_value` is `true`, this means we want to wipe the value from the front
    ///   matter in all cases.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub new_value: Option<Value>,

    /// Switch that controls front matter value edition alongside `new_value`, when
    /// `new_value` is None.
    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub delete_value: bool,
}

/// API Payload to add an entry to a front matter schema.
///
/// The payload is received in the context of a known Notebook, and
/// maps easily to an [`InsertFrontMatterOperation`](crate::notebooks::operations::InsertFrontMatterOperation)
///
/// Notably, as the _API_ will handle the call, it can fill the ceremonial data
/// related to Operational Transform, such as getting the "old" state and "old" value
/// that are necessary to build a valid `Operation`.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterAddRows {
    /// The index to insert the new front matter schema into.
    ///
    /// If the index is
    pub to_index: u32,

    /// The new entries to add to the front matter schema, with their new values
    pub insertions: Vec<FrontMatterSchemaRow>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::front_matter_schemas")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterPagerDutyIncidentSchema {
    #[builder(default, setter(into))]
    pub display_name: String,

    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_name: Option<String>,
}

impl FrontMatterPagerDutyIncidentSchema {
    pub fn validate_value(
        &self,
        value: serde_json::Value,
    ) -> Result<FrontMatterValue, FrontMatterValidationError> {
        Ok(FrontMatterPagerDutyIncident::try_from(value)?.into())
    }

    pub fn validate_front_matter_value(
        &self,
        value: &FrontMatterValue,
    ) -> Result<(), FrontMatterValidationError> {
        match value {
            FrontMatterValue::PagerDutyIncident(_) => Ok(()),
            other => Err(FrontMatterValidationError::wrong_variant(
                other.get_type(),
                "pagerduty_incident",
            )),
        }
    }
}

impl From<FrontMatterPagerDutyIncidentSchema> for FrontMatterValueSchema {
    fn from(v: FrontMatterPagerDutyIncidentSchema) -> Self {
        Self::PagerDutyIncident(v)
    }
}
