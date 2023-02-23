use super::{Error, QuerySchema, ValidationError, FORM_ENCODED_MIME_TYPE};
use crate::blobs::Blob;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use typed_builder::TypedBuilder;

/// A request for a provider to provide auto-suggestions.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
pub struct AutoSuggestRequest {
    /// The query being typed by the user, up to the focus offset.
    pub query: String,

    /// The query type of the provider we're requesting suggestions for.
    pub query_type: String,

    /// The field in the query form we're requesting suggestions for.
    pub field: String,
}

impl AutoSuggestRequest {
    pub fn parse(query_data: Blob) -> Result<Self, Error> {
        if query_data.mime_type != FORM_ENCODED_MIME_TYPE {
            return Err(Error::UnsupportedRequest);
        }

        let mut query = String::new();
        let mut query_type = String::new();
        let mut field = String::new();
        for (key, value) in form_urlencoded::parse(&query_data.data) {
            match key.as_ref() {
                "query" => query = value.to_string(),
                "query_type" => query_type = value.to_string(),
                "field" => field = value.to_string(),
                _ => {}
            }
        }

        let mut errors = Vec::new();
        if field.is_empty() {
            errors.push(
                ValidationError::builder()
                    .field_name("field".to_owned())
                    .message("Missing field".to_owned())
                    .build(),
            );
        }
        if query_type.is_empty() {
            errors.push(
                ValidationError::builder()
                    .field_name("query_type".to_owned())
                    .message("Missing query_type".to_owned())
                    .build(),
            );
        }

        match errors.is_empty() {
            true => Ok(Self {
                query,
                query_type,
                field,
            }),
            false => Err(Error::ValidationError { errors }),
        }
    }

    pub fn schema() -> QuerySchema {
        // This returns an empty schema, because Studio doesn't use a schema
        // for auto-suggest requests anyway.
        QuerySchema::default()
    }
}

/// A suggestion for a provider's auto-suggest functionality.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Suggestion {
    /// The offset to start applying the suggestion,
    ///
    /// All text should be replaced from that offset up to the end of the
    /// query in AutoSuggestRequest.
    ///
    /// When missing, append the suggestion to the cursor
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from: Option<u32>,
    pub text: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}
