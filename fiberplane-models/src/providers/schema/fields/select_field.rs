#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a field that allows selection from a predefined list of options.
///
/// Values to be selected from can be either hard-coded in the schema, or
/// (only for query forms) fetched on-demand the same way as auto-suggestions.
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SelectField {
    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// Suggested label to display along the field.
    pub label: String,

    /// Whether multiple values may be selected.
    pub multiple: bool,

    /// A list of options to select from.
    ///
    /// In addition to the options in this list, the auto-suggest mechanism
    /// can also fetch options when the user starts typing in this field. In
    /// this case, `supports_suggestions` should be set to `true`.
    pub options: Vec<String>,

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

impl SelectField {
    /// Creates a new select field with all default values.
    pub fn new() -> Self {
        Default::default()
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

    pub fn with_options(self, options: &[&str]) -> Self {
        Self {
            options: options.iter().map(|&s| s.to_owned()).collect(),
            ..self
        }
    }

    pub fn with_placeholder(self, placeholder: &str) -> Self {
        Self {
            placeholder: placeholder.to_owned(),
            ..self
        }
    }

    pub fn with_prerequisites(self, prerequisites: &[&str]) -> Self {
        Self {
            prerequisites: prerequisites.iter().map(|&s| s.to_owned()).collect(),
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
