/*!
# fiberplane

> All the `fiberplane` crates in one place

This crate re-exports all the various fiberplane crates for convenience. Do note
the crates are placed behind Cargo features, so you can still select which
specific crates should be compiled.

## Features

- `api-client`
- `axum` - Enable support for axum's `IntoResponse` for some error models.
- `base64uuid`
- `base64uuid-creation` - Enables support for generating UUIDs in the
  `base64uuid` crate.
- `clap` - Enables [`clap`](https://docs.rs/clap/latest/clap/) support for
  exported models.
- `fp-bindgen` - Enables
  [`fp-bindgen`](https://github.com/fiberplane/fp-bindgen) support for exported
  models.
- `markdown`
- `models`
- `provider-bindings`
- `provider-runtime`
- `sqlx` - Enables [`sqlx`](https://docs.rs/sqlx/latest/sqlx/) support for
  exported models.
- `templates`

*/

#[cfg(feature = "base64uuid")]
pub mod base64uuid {
    pub use base64uuid::*;
}

#[cfg(feature = "api-client")]
pub mod api_client {
    pub use fiberplane_api_client::*;
}

#[cfg(feature = "markdown")]
pub mod markdown {
    pub use fiberplane_markdown::*;
}

#[cfg(feature = "models")]
pub mod models {
    pub use fiberplane_models::*;
}

#[cfg(feature = "provider-bindings")]
pub mod provider_bindings {
    pub use fiberplane_provider_bindings::*;
}

#[cfg(feature = "provider-runtime")]
pub mod provider_runtime {
    pub use fiberplane_provider_runtime::*;
}

#[cfg(feature = "templates")]
pub mod templates {
    pub use fiberplane_templates::*;
}
