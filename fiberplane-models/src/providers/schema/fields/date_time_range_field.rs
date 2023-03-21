#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a field that produces two `DateTime` values, a "from" and a "to"
/// value.
///
/// For JSON/YAML encoding, the value will be represented as an object with
/// `from` and `to` fields. In the case of "application/x-www-form-urlencoded",
/// it will be represented as a single string and the "from" and "to" parts will
/// be separated by a space.
#[derive(Debug, Default, Deserialize, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct DateTimeRangeField {
    /// Suggested label to display along the field.
    pub label: String,

    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// Suggested placeholder to display when there is no value.
    pub placeholder: String,

    /// Whether a value is required.
    pub required: bool,
}

impl DateTimeRangeField {
    /// Creates a new date-time range field with all default values.
    pub fn new() -> Self {
        Default::default()
    }

    /// Marks the field as required.
    pub fn required(self) -> Self {
        Self {
            required: true,
            ..self
        }
    }

    pub fn with_label(self, label: &str) -> Self {
        Self {
            label: label.to_owned(),
            ..self
        }
    }

    pub fn with_name(self, name: &str) -> Self {
        Self {
            name: name.to_owned(),
            ..self
        }
    }

    pub fn with_placeholder(self, placeholder: &str) -> Self {
        Self {
            placeholder: placeholder.to_owned(),
            ..self
        }
    }
}
