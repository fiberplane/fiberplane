# fiberplane

> All the `fiberplane` crates in one place

This crate re-exports all the various fiberplane crates for convenience. Do note
the crates are placed behind Cargo features, so you can still select which
specific crates should be compiled.

## Features

- `api-client`
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