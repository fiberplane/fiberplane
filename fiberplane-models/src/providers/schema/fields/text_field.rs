#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a free-form text entry field.
///
/// This is commonly used for filter text and query entry.
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TextField {
    /// Suggested label to display along the form field.
    pub label: String,

    /// Whether multi-line input is useful for this provider.
    pub multiline: bool,

    /// Whether multiple values may be inserted.
    pub multiple: bool,

    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// Suggested placeholder to display when there is no value.
    pub placeholder: String,

    /// An optional list of fields that should be filled in before allowing the
    /// user to fill in this field. This forces a certain ordering in the data
    /// entry, which enables richer auto-suggestions, since the filled in
    /// prerequisite fields can provide additional context.
    pub prerequisites: Vec<String>,

    /// Whether a value is required.
    pub required: bool,

    /// Whether the provider supports auto-suggestions for this field.
    pub supports_suggestions: bool,
}

impl TextField {
    /// Creates a new text field with all default values.
    pub fn new() -> Self {
        Default::default()
    }

    /// Marks the field as allowing multi-line entry.
    pub fn multiline(self) -> Self {
        Self {
            multiline: true,
            ..self
        }
    }

    /// Marks the field as allowing multiple values.
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

    pub fn with_placeholder(self, placeholder: impl Into<String>) -> Self {
        Self {
            placeholder: placeholder.into(),
            ..self
        }
    }

    pub fn with_prerequisites(self, prerequisites: impl Into<Vec<String>>) -> Self {
        Self {
            prerequisites: prerequisites.into(),
            ..self
        }
    }

    /// Marks the field as supporting auto-suggestions.
    pub fn with_suggestions(self) -> Self {
        Self {
            supports_suggestions: true,
            ..self
        }
    }
}
