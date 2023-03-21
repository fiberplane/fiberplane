use super::fields::*;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines the fields that should be included in a provider's config.
///
/// Config data can be encoded as either JSON or YAML, so values must be
/// representable in both.
pub type ConfigSchema = Vec<ConfigField>;

#[derive(Debug, Deserialize, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ConfigField {
    Checkbox(CheckboxField),
    Integer(IntegerField),
    Select(SelectField),
    Text(TextField),
}

impl From<CheckboxField> for ConfigField {
    fn from(field: CheckboxField) -> Self {
        Self::Checkbox(field)
    }
}

impl From<IntegerField> for ConfigField {
    fn from(field: IntegerField) -> Self {
        Self::Integer(field)
    }
}

impl From<SelectField> for ConfigField {
    fn from(field: SelectField) -> Self {
        Self::Select(field)
    }
}

impl From<TextField> for ConfigField {
    fn from(field: TextField) -> Self {
        Self::Text(field)
    }
}
