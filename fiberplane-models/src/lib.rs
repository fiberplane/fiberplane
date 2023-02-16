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
