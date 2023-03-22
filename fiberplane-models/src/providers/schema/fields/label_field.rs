#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a field that allows labels to be selected.
///
/// For JSON/YAML encoding, the value will be represented as a string or an
/// array of strings, depending on the value of the `multiple` field. In the
/// case of "application/x-www-form-urlencoded", the value is always a single
/// string and multiple labels will be space-separated.
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct LabelField {
    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// Suggested label to display along the field (not to be confused with
    /// labels to be selected).
    pub label: String,

    /// Whether multiple labels may be selected.
    pub multiple: bool,

    /// Suggested placeholder to display when there is no value.
    pub placeholder: String,

    /// Whether a value is required.
    pub required: bool,
}

impl LabelField {
    /// Creates a new label field with all default values.
    pub fn new() -> Self {
        Default::default()
    }

    /// Marks the field as allowing multiple labels to be selected.
    pub fn multiple(self) -> Self {
        Self {
            multiple: true,
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
