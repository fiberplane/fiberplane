#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a field that allows integer numbers to be entered.
#[derive(Debug, Default, Deserialize, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct IntegerField {
    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// Suggested label to display along the field.
    pub label: String,

    /// Optional maximum value to be entered.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max: Option<i32>,

    /// Optional minimal value to be entered.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub min: Option<i32>,

    /// Suggested placeholder to display when there is no value.
    pub placeholder: String,

    /// Whether a value is required.
    pub required: bool,

    /// Specifies the granularity that any specified numbers must adhere to.
    ///
    /// If omitted, `step` defaults to "1", meaning only integers are allowed.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub step: Option<i32>,
}

impl IntegerField {
    /// Creates a new integer field with all default values.
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

    /// Convenience method for setting `min` and `max` together.
    pub fn with_bounds(self, min: i32, max: i32) -> Self {
        Self {
            max: Some(max),
            min: Some(min),
            ..self
        }
    }

    pub fn with_label(self, label: &str) -> Self {
        Self {
            label: label.to_owned(),
            ..self
        }
    }

    pub fn with_max(self, max: i32) -> Self {
        Self {
            max: Some(max),
            ..self
        }
    }

    pub fn with_min(self, min: i32) -> Self {
        Self {
            min: Some(min),
            ..self
        }
    }

    pub fn with_name(self, name: &str) -> Self {
        Self {
            name: name.to_owned(),
            ..self
        }
    }

    pub fn with_step(self, step: i32) -> Self {
        Self {
            step: Some(step),
            ..self
        }
    }
}
