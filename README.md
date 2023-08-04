# `fiberplane`

This repository is a monorepo for code that is used throughout Fiberplane's
products. Most of the modules below are Rust crates, but some TypeScript
packages may be found as well.

## Overview

- [base64uuid](base64uuid/) - A utility for working with base64url-encoded
  UUIDs. We use them throughout Fiberplane products, though the crate is usable
  on its own.
- [fiberplane](fiberplane/) - A convenient umbrella crate that re-exports all
  the `fiberplane-*` crates.
- [fiberplane-api-client](fiberplane-api-client/) - API client to interact with
  the Fiberplane REST API. Is generated from the OpenAPI schema located in
  `schemas/openapi_v1.yaml` and uses the models from `fiberplane-models`, so the
  client is based on the same models we use internally.
- [fiberplane-charts](fiberplane-charts/) - A React/TypeScript package for
  rendering metric charts.
- [fiberplane-markdown](fiberplane-markdown/) - Utilities to convert Fiberplane
  Notebooks to and from Markdown.
- [fiberplane-models](fiberplane-models/) - Our core data models, ranging from
  notebook and cell definitions, to types used in the provider protocol as well
  as those for our real-time operations.
- [fiberplane-openapi-rust-gen](fiberplane-openapi-rust-gen/) - Our custom
  generator for generating the [fiberplane-api-client](fiberplane-api-client/)
  crate.
- [fiberplane-prometheus-query](fiberplane-prometheus-query/) - TypeScript
  package for querying Prometheus.
- [fiberplane-provider-protocol](fiberplane-provider-protocol/) - The definition
  for our low-level provider protocol and the bindings that are generated from
  it.
- [fiberplane-templates](fiberplane-templates/) - Our Jsonnet template engine.

## Getting Help

Please see [COMMUNITY.md](COMMUNITY.md) for ways to reach out to us.

## Contributing

Please be advised that even though many of our repositories are open for outside
contributions, `fiberplane` is primarily a **read-only** repository for our
community. Fiberplane uses this repository to develop new features out in the
open, and you are encouraged to build custom solutions on top of the source code
we provide here. Our [issue tracker](https://github.com/fiberplane/fiberplane/issues)
and [discussions forum](https://github.com/fiberplane/fiberplane/discussions)
are open to all in case you have issues or questions/suggestions.

For more information, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

All code within the `fiberplane` repository is distributed under the terms of
both the MIT license and the Apache License (Version 2.0).

See [LICENSE-APACHE](LICENSE-APACHE) and [LICENSE-MIT](LICENSE-MIT).
