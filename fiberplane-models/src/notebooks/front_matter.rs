use crate::front_matter_schemas::SerializableEqFloat;
pub use crate::labels::Label;
use crate::timestamps::*;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;
use strum_macros::Display;
use thiserror::Error;
use typed_builder::TypedBuilder;

/// A JSON object which may or may not contain well known keys.
/// More information in the [RFC](https://www.notion.so/fiberplane/RFC-58-Front-matter-Specialization-Front-matter-a9b3b51614ee48a19ec416c02a9fd647)
///
/// The values stored in the FrontMatter can follow a schema to contain type information and be validated at
/// runtime by the corresponding [`FrontMatterSchemaEntry`](crate::front_matter_schemas::FrontMatterSchemaEntry).
///
/// See [`FrontMatterValue`] for more details on validation.
// this is on purpose a `Map<String, Value>` instead of a `Value` to disallow top level arrays
pub type FrontMatter = BTreeMap<String, Value>;

/// Known variants of front-matter values for runtime validation.
///
/// Front matter values can hold extra type information to allow the API and
/// the operational transform operations to validate values before storing them.
///
/// The usual pattern to use these values is to use the `validate_value` method
/// of `FrontMatterSchemaEntry` to check if the value has the expected type:
///
/// ```rust
/// # use fiberplane_models::front_matter_schemas::{FrontMatterSchemaEntry, FrontMatterNumberSchema};
/// # use serde_json::json;
/// // An existing schema to check values against
/// let schema = FrontMatterSchemaEntry::builder()
///     .key("foo")
///     .schema(FrontMatterNumberSchema::builder()
///         .display_name("A number field that accepts single numbers")
///         .build())
///     .build();
///     
/// // A value that came from an API boundary
/// let good_value_from_api = json!({
///     "type": "number",
///     "value": 42
/// });
/// assert!(schema.validate_value(good_value_from_api.clone()).is_ok());
///
/// // Another value (that has the wrong type)
/// let bad_value_from_api = json!({
///     "type": "date_time",
///     "value": "2022-10-08T13:29:00.78Z"
/// });
/// assert!(schema.validate_value(bad_value_from_api).is_err());
///
/// // A value can be inferred as well if it strictly matches the expected type
/// let inferred_value_from_api = json!(42);
/// assert!(schema.validate_value(inferred_value_from_api.clone()).is_ok());
/// assert_eq!(
///     schema.validate_value(inferred_value_from_api).unwrap(),
///     schema.validate_value(good_value_from_api).unwrap(),
/// );
///
/// // For example this will fail
/// let not_inferred_value_from_api = json!("42");
/// assert!(schema.validate_value(not_inferred_value_from_api).is_err());
/// ```
///
/// This can be used to validate the obtained value format.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Display)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum FrontMatterValue {
    /// A number front matter value
    Number(FrontMatterNumberValue),
    /// A list-of-numbers front matter value
    NumberList(FrontMatterNumberList),

    /// A string front matter value
    String(FrontMatterStringValue),
    /// A list-of-strings front matter value
    StringList(FrontMatterStringList),

    /// A timestamp front matter value
    DateTime(FrontMatterDateTimeValue),
    /// A list-of-timestamps front matter value
    DateTimeList(FrontMatterDateTimeList),

    /// A user front matter value
    User(FrontMatterUserValue),
    /// A list-of-users front matter value
    UserList(FrontMatterUserList),
}

/// Error from validating a JSON object as a correct front matter value
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum FrontMatterValidationError {
    /// Impossible to deserialize the data
    #[error("unexpected format: {0}")]
    Format(String),

    /// Obtained the wrong variant
    #[error("unexpected variant: expected {expected} but got {got}")]
    Variant { got: String, expected: String },
}

impl FrontMatterValidationError {
    pub(crate) fn wrong_variant(got: &str, expected: &str) -> Self {
        Self::Variant {
            got: got.to_string(),
            expected: expected.to_string(),
        }
    }
}

impl TryFrom<serde_json::Value> for FrontMatterValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        serde_json::from_value(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))
    }
}

impl TryFrom<&str> for FrontMatterValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))
    }
}

impl FrontMatterValue {
    /// Get a string description of the type of the value
    pub fn get_type(&self) -> &'static str {
        match self {
            FrontMatterValue::Number(_) => "number",
            FrontMatterValue::NumberList(_) => "number_list",
            FrontMatterValue::String(_) => "string",
            FrontMatterValue::StringList(_) => "string_list",
            FrontMatterValue::DateTime(_) => "date_time",
            FrontMatterValue::DateTimeList(_) => "date_time_list",
            FrontMatterValue::User(_) => "user",
            FrontMatterValue::UserList(_) => "user_list",
        }
    }
}

impl TryFrom<serde_json::Value> for FrontMatterNumberValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Ok(value) = FrontMatterValue::try_from(value.clone()) {
            match value {
                FrontMatterValue::Number(num) => Ok(num),
                _ => Err(FrontMatterValidationError::wrong_variant(
                    value.get_type(),
                    "number",
                )),
            }
        } else {
            if let Value::Number(num) = value {
                return Ok(Self::builder()
                    .value(num.as_f64().ok_or_else(|| {
                        FrontMatterValidationError::Format("invalid number".to_string())
                    })?)
                    .build());
            }

            Err(FrontMatterValidationError::wrong_variant(
                "untyped", "number",
            ))
        }
    }
}

impl TryFrom<&str> for FrontMatterNumberValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value: serde_json::Value = serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))?;
        Self::try_from(value)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterNumberList {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Ok(value) = FrontMatterValue::try_from(value.clone()) {
            match value {
                FrontMatterValue::NumberList(num_list) => Ok(num_list),
                _ => Err(FrontMatterValidationError::wrong_variant(
                    value.get_type(),
                    "number_list",
                )),
            }
        } else {
            if let Value::Array(array) = value {
                return Ok(Self::builder()
                    .values(
                        array
                            .into_iter()
                            .map(FrontMatterNumberValue::try_from)
                            .collect::<Result<Vec<_>, _>>()?,
                    )
                    .build());
            }

            Err(FrontMatterValidationError::wrong_variant(
                "'not a list'",
                "number_list",
            ))
        }
    }
}

impl TryFrom<&str> for FrontMatterNumberList {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value: serde_json::Value = serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))?;
        Self::try_from(value)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterStringValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Ok(value) = FrontMatterValue::try_from(value.clone()) {
            match value {
                FrontMatterValue::String(st) => Ok(st),
                _ => Err(FrontMatterValidationError::wrong_variant(
                    value.get_type(),
                    "string",
                )),
            }
        } else {
            if let Value::String(strr) = value {
                return Ok(Self::builder().value(strr).build());
            }

            Err(FrontMatterValidationError::wrong_variant(
                "untyped", "string",
            ))
        }
    }
}

impl TryFrom<&str> for FrontMatterStringValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value: serde_json::Value = serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))?;
        Self::try_from(value)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterStringList {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Ok(value) = FrontMatterValue::try_from(value.clone()) {
            match value {
                FrontMatterValue::StringList(str_list) => Ok(str_list),
                _ => Err(FrontMatterValidationError::wrong_variant(
                    value.get_type(),
                    "string_list",
                )),
            }
        } else {
            if let Value::Array(array) = value {
                return Ok(Self::builder()
                    .values(
                        array
                            .into_iter()
                            .map(FrontMatterStringValue::try_from)
                            .collect::<Result<Vec<_>, _>>()?,
                    )
                    .build());
            }

            Err(FrontMatterValidationError::wrong_variant(
                "'not a list'",
                "string_list",
            ))
        }
    }
}

impl TryFrom<&str> for FrontMatterStringList {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value: serde_json::Value = serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))?;
        Self::try_from(value)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterDateTimeValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Ok(value) = FrontMatterValue::try_from(value.clone()) {
            match value {
                FrontMatterValue::DateTime(dt) => Ok(dt),
                _ => Err(FrontMatterValidationError::wrong_variant(
                    value.get_type(),
                    "date_time",
                )),
            }
        } else {
            if let Value::String(strr) = value {
                return Ok(Self::builder()
                    .value(
                        strr.parse::<Timestamp>()
                            .map_err(|err| Self::Error::Format(err.to_string()))?,
                    )
                    .build());
            }

            Err(FrontMatterValidationError::wrong_variant(
                "untyped",
                "date_time",
            ))
        }
    }
}

impl TryFrom<&str> for FrontMatterDateTimeValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value: serde_json::Value = serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))?;
        Self::try_from(value)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterDateTimeList {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Ok(value) = FrontMatterValue::try_from(value.clone()) {
            match value {
                FrontMatterValue::DateTimeList(dt_list) => Ok(dt_list),
                _ => Err(FrontMatterValidationError::wrong_variant(
                    value.get_type(),
                    "date_time_list",
                )),
            }
        } else {
            if let Value::Array(array) = value {
                return Ok(Self::builder()
                    .values(
                        array
                            .into_iter()
                            .map(FrontMatterDateTimeValue::try_from)
                            .collect::<Result<Vec<_>, _>>()?,
                    )
                    .build());
            }

            Err(FrontMatterValidationError::wrong_variant(
                "'not a list'",
                "date_time_list",
            ))
        }
    }
}

impl TryFrom<&str> for FrontMatterDateTimeList {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value: serde_json::Value = serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))?;
        Self::try_from(value)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterUserValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Ok(value) = FrontMatterValue::try_from(value.clone()) {
            match value {
                FrontMatterValue::User(user) => Ok(user),
                _ => Err(FrontMatterValidationError::wrong_variant(
                    value.get_type(),
                    "user",
                )),
            }
        } else {
            if let Value::String(strr) = value {
                return Ok(Self::builder()
                    .value(
                        strr.parse::<Base64Uuid>()
                            .map_err(|err| Self::Error::Format(err.to_string()))?,
                    )
                    .build());
            }

            Err(FrontMatterValidationError::wrong_variant("untyped", "user"))
        }
    }
}

impl TryFrom<&str> for FrontMatterUserValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value: serde_json::Value = serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))?;
        Self::try_from(value)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterUserList {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Ok(value) = FrontMatterValue::try_from(value.clone()) {
            match value {
                FrontMatterValue::UserList(user_list) => Ok(user_list),
                _ => Err(FrontMatterValidationError::wrong_variant(
                    value.get_type(),
                    "user_list",
                )),
            }
        } else {
            if let Value::Array(array) = value {
                return Ok(Self::builder()
                    .values(
                        array
                            .into_iter()
                            .map(FrontMatterUserValue::try_from)
                            .collect::<Result<Vec<_>, _>>()?,
                    )
                    .build());
            }

            Err(FrontMatterValidationError::wrong_variant(
                "'not a list'",
                "user_list",
            ))
        }
    }
}

impl TryFrom<&str> for FrontMatterUserList {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value: serde_json::Value = serde_json::from_str(value)
            .map_err(|err| FrontMatterValidationError::Format(err.to_string()))?;
        Self::try_from(value)
    }
}

impl From<FrontMatterUserValue> for FrontMatterValue {
    fn from(v: FrontMatterUserValue) -> Self {
        Self::User(v)
    }
}

impl From<FrontMatterDateTimeValue> for FrontMatterValue {
    fn from(v: FrontMatterDateTimeValue) -> Self {
        Self::DateTime(v)
    }
}

impl From<FrontMatterStringValue> for FrontMatterValue {
    fn from(v: FrontMatterStringValue) -> Self {
        Self::String(v)
    }
}

impl From<FrontMatterNumberValue> for FrontMatterValue {
    fn from(v: FrontMatterNumberValue) -> Self {
        Self::Number(v)
    }
}

impl From<FrontMatterUserList> for FrontMatterValue {
    fn from(v: FrontMatterUserList) -> Self {
        Self::UserList(v)
    }
}

impl From<FrontMatterDateTimeList> for FrontMatterValue {
    fn from(v: FrontMatterDateTimeList) -> Self {
        Self::DateTimeList(v)
    }
}

impl From<FrontMatterStringList> for FrontMatterValue {
    fn from(v: FrontMatterStringList) -> Self {
        Self::StringList(v)
    }
}

impl From<FrontMatterNumberList> for FrontMatterValue {
    fn from(v: FrontMatterNumberList) -> Self {
        Self::NumberList(v)
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterNumberValue {
    #[builder(setter(into))]
    pub value: SerializableEqFloat,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterNumberList {
    #[builder(setter(into))]
    pub values: Vec<FrontMatterNumberValue>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterStringValue {
    #[builder(setter(into))]
    pub value: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterStringList {
    #[builder(setter(into))]
    pub values: Vec<FrontMatterStringValue>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterDateTimeValue {
    #[builder(setter(into))]
    pub value: Timestamp,
}

impl<T: Into<Timestamp>> From<T> for FrontMatterDateTimeValue {
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
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterDateTimeList {
    #[builder(setter(into))]
    pub values: Vec<FrontMatterDateTimeValue>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterUserValue {
    #[builder(setter(into))]
    pub value: Base64Uuid,
}

impl From<Base64Uuid> for FrontMatterUserValue {
    fn from(value: Base64Uuid) -> Self {
        Self { value }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterUserList {
    #[builder(setter(into))]
    pub values: Vec<FrontMatterUserValue>,
}
