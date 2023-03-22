#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a field that produces a boolean value.
///
/// For JSON/YAML encoding, the value will be represented as a native boolean.
/// In the case of "application/x-www-form-urlencoded", it will be represented
/// by the value defined in the `value` field, which will be either present or
/// not, similar to the encoding of HTML forms.
#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct CheckboxField {
    /// Whether the checkbox should be initially checked if no query data is
    /// present.
    pub checked: bool,

    /// Suggested label to display along the checkbox.
    pub label: String,

    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// Whether the checkbox must be checked.
    ///
    /// This allows for the use case of implementing Terms of Service checkboxes
    /// in config forms.
    pub required: bool,

    /// Value of the field as it will be included in the encoded query. Note
    /// that only checked checkboxes will be included.
    ///
    /// If the data is encoded using either JSON or YAML, the checkbox state is
    /// encoded as a boolean and this value will not be used.
    pub value: String,
}

impl CheckboxField {
    /// Creates a new checkbox with all default values.
    pub fn new() -> Self {
        Default::default()
    }

    /// Marks the checkbox as being checked by default.
    pub fn checked_by_default(self) -> Self {
        Self {
            checked: true,
            ..self
        }
    }

    /// Marks the field as required.
    pub fn required(self) -> Self {
        Self {
            required: true,
            ..self
        }
    }

    pub fn with_label(self, label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            ..self
        }
    }

    pub fn with_name(self, name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            ..self
        }
    }

    pub fn with_value(self, value: impl Into<String>) -> Self {
        Self {
            value: value.into(),
            ..self
        }
    }
}
