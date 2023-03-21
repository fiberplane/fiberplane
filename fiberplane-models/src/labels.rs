#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::fmt::{self, Display, Formatter};
use thiserror::Error;

const MAX_LABEL_VALUE_LENGTH: usize = 63;
const MAX_LABEL_NAME_LENGTH: usize = 63;
const MAX_LABEL_PREFIX_LENGTH: usize = 253;

/// Labels that are associated with a Notebook.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::labels")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Label {
    /// The key of the label. Should be unique for a single Notebook.
    pub key: String,

    /// The value of the label. Can be left empty.
    pub value: String,
}

impl Label {
    pub fn new(key: impl Into<String>, value: impl Into<String>) -> Self {
        Self {
            key: key.into(),
            value: value.into(),
        }
    }

    /// Validates the key and value.
    pub fn validate(&self) -> Result<(), LabelValidationError> {
        Label::validate_key(&self.key)?;
        Label::validate_value(&self.value)?;

        Ok(())
    }

    /// A key is considered valid if it adheres to the following criteria:
    /// It can contain two segments, a prefix and a name, the name segment has
    /// the following criteria:
    /// - must be 63 characters or less (cannot be empty)
    /// - must begin and end with an alphanumeric character ([a-z0-9A-Z])
    /// - could contain dashes (-), underscores (_), dots (.), and alphanumerics between
    ///
    /// The prefix is optional, if specified must follow the following criteria:
    /// - must be 253 characters or less
    /// - must be a valid DNS subdomain
    pub fn validate_key(key: &str) -> Result<(), LabelValidationError> {
        if key.is_empty() {
            return Err(LabelValidationError::EmptyKey);
        }

        let (prefix, name) = match key.split_once('/') {
            Some((prefix, name)) => (Some(prefix), name),
            None => (None, key),
        };

        // Validation of the name portion
        if name.is_empty() {
            return Err(LabelValidationError::EmptyName);
        }

        if name.len() > MAX_LABEL_NAME_LENGTH {
            return Err(LabelValidationError::NameTooLong);
        }

        // Check the first and last characters
        let first = name.chars().next().unwrap();
        let last = name.chars().last().unwrap();
        if !first.is_ascii_alphanumeric() || !last.is_ascii_alphanumeric() {
            return Err(LabelValidationError::NameInvalidCharacters);
        }

        if name.chars().any(|c| !is_valid_label_char(c)) {
            return Err(LabelValidationError::NameInvalidCharacters);
        }

        match prefix {
            Some(prefix) => validate_prefix(prefix),
            None => Ok(()),
        }
    }

    /// A value is considered valid if it adheres to the following criteria:
    /// - must be 63 characters or less (can be empty)
    /// - unless empty, must begin and end with an alphanumeric character ([a-z0-9A-Z])
    /// - could contain dashes (-), underscores (_), dots (.), and alphanumerics between
    pub fn validate_value(value: &str) -> Result<(), LabelValidationError> {
        // Validation of the value (only if it contains something)
        if !value.is_empty() {
            if value.len() > MAX_LABEL_VALUE_LENGTH {
                return Err(LabelValidationError::ValueTooLong);
            }

            // Check the first and last characters
            let first = value.chars().next().unwrap();
            let last = value.chars().last().unwrap();
            if !first.is_ascii_alphanumeric() || !last.is_ascii_alphanumeric() {
                return Err(LabelValidationError::ValueInvalidCharacters);
            }

            if value.chars().any(|c| !is_valid_label_char(c)) {
                return Err(LabelValidationError::ValueInvalidCharacters);
            }
        }
        Ok(())
    }
}

impl Display for Label {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.write_str(&self.key)?;
        if !self.value.is_empty() {
            f.write_str(&format!("={}", &self.value))?;
        }
        Ok(())
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::labels")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum LabelValidationError {
    #[error("The key in the label was empty")]
    EmptyKey,

    #[error("The name portion of the key was empty")]
    EmptyName,

    #[error("The name portion of the key was too long")]
    NameTooLong,

    #[error("The name portion of the key contains invalid characters")]
    NameInvalidCharacters,

    #[error("The prefix portion of the key was empty")]
    EmptyPrefix,

    #[error("The prefix portion of the key was too long")]
    PrefixTooLong,

    #[error("The prefix portion of the key contains invalid characters")]
    PrefixInvalidCharacters,

    #[error("The value is too long")]
    ValueTooLong,

    #[error("The value contains invalid characters")]
    ValueInvalidCharacters,
}

/// Returns whether the given character is valid to be used in a label.
///
/// Note that additional restrictions apply to a label's first and last
/// characters.
fn is_valid_label_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_' || c == '-' || c == '.'
}

fn validate_prefix(prefix: &str) -> Result<(), LabelValidationError> {
    if prefix.is_empty() {
        return Err(LabelValidationError::EmptyPrefix);
    }

    if prefix.len() > MAX_LABEL_PREFIX_LENGTH {
        return Err(LabelValidationError::PrefixTooLong);
    }

    for subdomain in prefix.split('.') {
        if subdomain.is_empty() {
            return Err(LabelValidationError::PrefixInvalidCharacters);
        }

        // Check the first and last characters
        let first = subdomain.chars().next().unwrap();
        let last = subdomain.chars().last().unwrap();
        if !first.is_ascii_alphanumeric() || !last.is_ascii_alphanumeric() {
            return Err(LabelValidationError::PrefixInvalidCharacters);
        }

        if subdomain
            .chars()
            .any(|c| !c.is_ascii_alphanumeric() && c != '-')
        {
            return Err(LabelValidationError::ValueInvalidCharacters);
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn label_key_valid() {
        let keys = vec![
            "key",
            "key.with.dot",
            "key_with_underscore",
            "key-with-dash",
            "key..with..double..dot",
            "fiberplane.io/key",
            "fiberplane.io/key.with.dot",
            "fiberplane.io/key_with_underscore",
            "fiberplane.io/key-with-dash",
        ];
        for key in keys.into_iter() {
            assert!(
                Label::validate_key(key).is_ok(),
                "Key \"{key}\" should have passed validation"
            );
        }
    }

    #[test]
    fn label_key_invalid() {
        let keys = vec![
            "",
            "too_long_name_too_long_name_too_long_name_too_long_name_too_long_name_",
            "fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.fiberplane.com/name",
            "-name_start_with_non_alpha_numeric",
            "name_end_with_non_alpha_numeric-",
            "fiberplane..com/name",
            "fiberplane.com/invalid/name",
            "/name",
        ];
        for key in keys.into_iter() {
            assert!(
                Label::validate_key(key).is_err(),
                "Key \"{key}\" should have failed validation"
            );
        }
    }

    #[test]
    fn label_value_valid() {
        let values = vec![
            "",
            "value",
            "value.with.dot",
            "value_with_underscore",
            "value-with-dash",
        ];
        for value in values.into_iter() {
            assert!(
                Label::validate_value(value).is_ok(),
                "Value \"{value}\" should have passed validation"
            );
        }
    }

    #[test]
    fn label_value_invalid() {
        let values = vec![
            "too_long_name_too_long_name_too_long_name_too_long_name_too_long_name_",
            "-value_starting_with_a_dash",
            "value_ending_with_a_dash-",
        ];
        for value in values.into_iter() {
            assert!(
                Label::validate_key(value).is_err(),
                "Value \"{value}\" should have failed validation"
            );
        }
    }
}
