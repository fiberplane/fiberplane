/*!
# Fiberplane Models

> Core Models used across Fiberplane

This crate contains a collection of models that are used across the Fiberplane
products, including but not limited to:

- Notebooks
  - Notebook Cells
  - Notebook Operations
- Providers
  - Provider Schemas
- Comments
- Rich-Text Formatting
- Templates
- Views
- Workspaces

*/

use serde::de::{Error, Unexpected, Visitor};
use serde::Deserializer;
use std::fmt;

pub mod blobs;
pub mod comments;
pub mod data_sources;
pub mod events;
pub mod files;
pub mod formatting;
pub mod labels;
pub mod names;
pub mod notebooks;
pub mod providers;
pub mod proxies;
pub mod query_data;
pub mod realtime;
pub mod snippets;
pub mod sorting;
pub mod templates;
pub mod timestamps;
pub mod tokens;
pub mod users;
pub mod utils;
pub mod views;
pub mod workspaces;

fn debug_print_bytes(bytes: impl AsRef<[u8]>) -> String {
    let bytes = bytes.as_ref();
    if bytes.len() > 100 {
        format!("{}...", String::from_utf8_lossy(&bytes[..100]))
    } else {
        String::from_utf8_lossy(bytes).to_string()
    }
}

// workaround for "invalid type: string "1", expected u32" bug in query string:
// - https://linear.app/fiberplane/issue/FP-3066#comment-59e010ae
// - https://github.com/tokio-rs/axum/discussions/1359
// use on struct like this: #[serde(deserialize_with = "crate::deserialize_u32")]
pub(crate) fn deserialize_u32<'de, D: Deserializer<'de>>(deserializer: D) -> Result<u32, D::Error> {
    deserializer.deserialize_str(U32Visitor)
}

struct U32Visitor;

impl<'de> Visitor<'de> for U32Visitor {
    type Value = u32;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an u32")
    }

    fn visit_u32<E>(self, v: u32) -> Result<Self::Value, E>
    where
        E: Error,
    {
        Ok(v)
    }

    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
    where
        E: Error,
    {
        v.parse()
            .map_err(|_| Error::invalid_type(Unexpected::Str(v), &self))
    }

    fn visit_borrowed_str<E>(self, v: &'de str) -> Result<Self::Value, E>
    where
        E: Error,
    {
        v.parse()
            .map_err(|_| Error::invalid_type(Unexpected::Str(v), &self))
    }

    fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
    where
        E: Error,
    {
        v.parse()
            .map_err(|_| Error::invalid_type(Unexpected::Str(&v), &self))
    }
}
