use crate::providers::QuerySchema;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines an array of composite fields.
///
/// This is commonly used for arbitrarily long list of (key, value) pairs,
/// or lists of (key, operator, value) filters.
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ArrayField {
    /// Suggested label to display along the form field.
    pub label: String,

    /// Name of the field as it will be included in the encoded query or config
    /// object.
    pub name: String,

    /// The minimum number of entries the array must have to be valid.
    ///
    /// Leaving the minimum_length to 0 makes the whole field optional.
    pub minimum_length: u32,

    /// The maximum number of entries the array can have and still be valid.
    ///
    /// It is None when there is no maximum number
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub maximum_length: Option<u32>,

    /// The schema of the elements inside a row of the array.
    ///
    /// ### Accessing row fields
    ///
    /// The name of each QueryField inside the element_schema can be used as
    /// an indexing key for a field. That means that if `element_schema` contains
    /// a [TextField](crate::providers::TextField) with the name `parameter_name`,
    /// then you will be able to access the value of that field using
    /// `ArrayField::get(i)::get("parameter_name")` for the i-th element.
    ///
    /// ### Serialization
    ///
    /// For example if an array field has this `element_schema`:
    /// ```rust,no_run
    /// # use fiberplane_models::providers::{ArrayField, TextField, SelectField, IntegerField};
    /// ArrayField::new()
    ///   .with_name("table")
    ///   .with_label("example".to_string())
    ///   .with_element_schema(vec![
    ///     TextField::new().with_name("key").into(),
    ///     SelectField::new().with_name("operator").with_options(&["<", ">", "<=", ">=", "=="]).into(),
    ///     IntegerField::new().with_name("value").into(),
    ///   ]);
    /// ```
    ///
    /// Then the URL-encoded serialization for the fields is expected to use
    /// the bracketed-notation. This means you _can_ encode all the
    /// keys in the array in any order you want. It can look like this
    /// (line breaks are only kept for legibility):
    /// ```txt
    ///  "table[0][key]=less+than&
    ///  table[2][operator]=%3E&
    ///  table[0][operator]=%3C&
    ///  table[2][key]=greater+than&
    ///  table[2][value]=10&
    ///  table[0][value]=12"
    /// ```
    ///
    /// or you can do the "logic" ordering too:
    /// ```txt
    ///  "table[0][key]=less+than&
    ///  table[0][operator]=%3C&
    ///  table[0][value]=12&
    ///  table[1][key]=greater+than&
    ///  table[1][operator]=%3E&
    ///  table[1][value]=10"
    /// ```
    ///
    /// Note that we are allowed to skip indices.
    /// Any of those 2 examples above will
    /// be read as:
    /// ```rust,no_run
    /// # #[derive(Debug, PartialEq)]
    /// # struct Row { key: String, operator: String, value: u32 }
    /// # let table: Vec<Row> = vec![];
    /// assert_eq!(table, vec![
    ///   Row {
    ///     key: "less than".to_string(),
    ///     operator: "<".to_string(),
    ///     value: 12,
    ///   },
    ///   Row {
    ///     key: "greater than".to_string(),
    ///     operator: ">".to_string(),
    ///     value: 10,
    ///   },
    /// ]);
    /// ```
    ///
    /// ### Required row fields
    ///
    /// Any field that is marked as `required` inside `element_schema` makes it
    /// mandatory to create a valid row to the Array Field.
    pub element_schema: QuerySchema,
}

impl ArrayField {
    /// Creates a new array field with all default values.
    pub fn new() -> Self {
        Default::default()
    }

    pub fn with_label(self, label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            ..self
        }
    }

    pub fn with_element_schema(self, schema: QuerySchema) -> Self {
        Self {
            element_schema: schema,
            ..self
        }
    }

    pub fn with_name(self, name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            ..self
        }
    }

    pub fn with_minimum_length(self, minimum_length: u32) -> Self {
        Self {
            minimum_length,
            ..self
        }
    }

    pub fn with_maximum_length(self, maximum_length: u32) -> Self {
        Self {
            maximum_length: Some(maximum_length),
            ..self
        }
    }
}
