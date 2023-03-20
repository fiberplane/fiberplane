#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

use super::fields::*;

/// Defines the fields that should be included in the query data.
///
/// Query data is encoded as "application/x-www-form-urlencoded", unless a
/// `File` field is present in the schema, in which case "multipart/form-data"
/// may be used.
pub type QuerySchema = Vec<QueryField>;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum QueryField {
    Checkbox(CheckboxField),
    DateTimeRange(DateTimeRangeField),
    File(FileField),
    Label(LabelField),
    Integer(IntegerField),
    Select(SelectField),
    Text(TextField),
    Array(ArrayField),
}

impl From<CheckboxField> for QueryField {
    fn from(field: CheckboxField) -> Self {
        Self::Checkbox(field)
    }
}

impl From<DateTimeRangeField> for QueryField {
    fn from(field: DateTimeRangeField) -> Self {
        Self::DateTimeRange(field)
    }
}

impl From<FileField> for QueryField {
    fn from(field: FileField) -> Self {
        Self::File(field)
    }
}

impl From<LabelField> for QueryField {
    fn from(field: LabelField) -> Self {
        Self::Label(field)
    }
}

impl From<IntegerField> for QueryField {
    fn from(field: IntegerField) -> Self {
        Self::Integer(field)
    }
}

impl From<SelectField> for QueryField {
    fn from(field: SelectField) -> Self {
        Self::Select(field)
    }
}

impl From<TextField> for QueryField {
    fn from(field: TextField) -> Self {
        Self::Text(field)
    }
}

impl From<ArrayField> for QueryField {
    fn from(field: ArrayField) -> Self {
        Self::Array(field)
    }
}
