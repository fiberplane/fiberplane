use crate::providers::QuerySchema;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use typed_builder::TypedBuilder;

/// Defines an array of composite fields.
///
/// This is commonly used for arbitrarily long list of (key, value) pairs,
/// or lists of (key, operator, value) filters.
#[derive(Clone, Debug, Default, Deserialize, Serialize, TypedBuilder, PartialEq)]
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
    #[builder(default = 0)]
    pub minimum_length: u32,
    /// The maximum number of entries the array can have and still be valid.
    ///
    /// It is None when there is no maximum number
    #[builder(default, setter(strip_option))]
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
    /// ```rust,no_compile
    /// ArrayField {
    ///   name: "table".to_string(),
    ///   element_schema: vec![
    ///     TextField::new().with_name("key"),
    ///     SelectField::new().with_name("operator").with_options(&["<", ">", "<=", ">=", "=="]),
    ///     IntegerField::new().with_name("value"),
    ///   ],
    /// ..Default::default()
    /// }
    /// ```
    ///
    /// Then the URL-encoded serialization for the fields is expected to look like this
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
    /// Note that we are allowed to skip indices, this serialization is expected to
    /// be read as:
    /// ```rust,no_compile
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
    /// ])
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

    pub fn with_label(self, label: &str) -> Self {
        Self {
            label: label.to_owned(),
            ..self
        }
    }

    pub fn with_element_schema(self, schema: QuerySchema) -> Self {
        Self {
            element_schema: schema,
            ..self
        }
    }

    pub fn with_name(self, name: &str) -> Self {
        Self {
            name: name.to_owned(),
            ..self
        }
    }

    pub fn with_minimum_length(self, minimum_length: u32) -> Self {
        Self {
            minimum_length,
            ..self
        }
    }

    pub fn with_maximum_length(self, maximum_length: Option<u32>) -> Self {
        Self {
            maximum_length,
            ..self
        }
    }
}
