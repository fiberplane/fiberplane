use super::QuerySchema;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};

/// Defines a query type supported by a provider.
#[derive(Debug, Default, Deserialize, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SupportedQueryType {
    /// User-friendly label to use for the query type.
    pub label: String,

    /// The query type supported by the provider.
    ///
    /// There are predefined query types, such as "table" and "log", but
    /// providers may also implement custom query types, which it should prefix
    /// with "x-".
    pub query_type: String,

    /// The query schema defining the format of the `query_data` to be submitted
    /// with queries of this type.
    pub schema: QuerySchema,

    /// MIME types supported for extraction. Any MIME type specified here should
    /// be valid as an argument to `extract_data()` when passed a response from
    /// queries of this type.
    ///
    /// E.g.:
    /// ```
    /// vec![
    ///     "application/vnd.fiberplane.events",
    ///     "application/vnd.fiberplane.metrics"
    /// ];
    /// ```
    pub mime_types: Vec<String>,
}

impl SupportedQueryType {
    /// Creates a new query type with all default values.
    pub fn new(query_type: &str) -> Self {
        Self {
            query_type: query_type.to_owned(),
            ..Default::default()
        }
    }

    pub fn supporting_mime_types(self, mime_types: &[&str]) -> Self {
        Self {
            mime_types: mime_types.iter().map(|&s| s.to_owned()).collect(),
            ..self
        }
    }

    pub fn with_label(self, label: &str) -> Self {
        Self {
            label: label.to_owned(),
            ..self
        }
    }

    pub fn with_schema(self, schema: QuerySchema) -> Self {
        Self { schema, ..self }
    }
}
