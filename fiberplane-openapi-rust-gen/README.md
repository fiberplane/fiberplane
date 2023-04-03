# Fiberplane OpenAPI Rust Client Generator

`fiberplane-openapi-rust-gen` is a tool to generate Rust client code from
OpenAPI 3.0 specifications. It was created as an in-house replacement for the
[OpenAPI Tools openapi-generator][0] with a feature set specifically tailored
(but not exclusive) to the needs of Fiberplane.

The main differences are:

* The generated code references pre-defined models from the `fiberplane` crates
instead of generating its own models. This allows us to use the same models in
the generated code as in the rest of our codebases, including our backend,
frontend and CLI.
* Support has been added for common Fiberplane-specific types such as
  `Base64Uuid` and `Timestamp`.
* There is first class support for `HashMap`, including in query parameters.

[0]: https://github.com/OpenAPITools/openapi-generator
