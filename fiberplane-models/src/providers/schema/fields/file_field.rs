#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a field that allows files to be uploaded as part of the query data.
///
/// Query data that includes files will be encoded using "multipart/form-data".
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FileField {
    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// Suggested label to display along the field.
    pub label: String,

    /// Whether multiple files may be uploaded.
    pub multiple: bool,

    /// Whether a file is required.
    pub required: bool,
}

impl FileField {
    /// Creates a new file field with all default values.
    pub fn new() -> Self {
        Default::default()
    }

    /// Marks the field as allowing multiple files to be uploaded.
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
}
