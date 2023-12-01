#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a timestamp entry field.
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TimestampField {
    /// Suggested label to display along the form field.
    pub label: String,

    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// Whether a value is required.
    pub required: bool,
}

impl TimestampField {
    /// Creates a new timestamp field with all default values.
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
}
