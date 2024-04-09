---
title: Provider Protocol Reference (v2)
---

All functions described here are bindings that are generated from our [provider protocol](https://github.com/fiberplane/fiberplane/tree/main/fiberplane-provider-protocol) and which are publish as our [provider bindings crate](https://docs.rs/fiberplane-provider-bindings/latest/fiberplane_provider_bindings/). Please refer to the crate for more details on any of the types mentioned below.

We use [`fp-bindgen`](https://github.com/fiberplane/fp-bindgen) for generating the bindings themselves.

## Exported functions

Exported functions are functions that your provider implements, and that the runtime will call. In order to make those exported functions usable in Fiberplane, they must be annotated with `#[pdk_export]`.

### `get_supported_query_types`

It is advised to use the [Provider Development Kit](https://docs.rs/fiberplane-pdk/latest/fiberplane_pdk/) rather than implementing this function manually. The [`pdk_query_types!`](https://docs.rs/fiberplane-pdk-macros/latest/fiberplane_pdk_macros/macro.pdk_query_types.html) macro can be used to generate this function for you. See the [tutorial](create-a-provider) for more information about using the PDK.

#### Signature

```rust
pub async fn get_supported_query_types(config: ProviderConfig) -> Vec<SupportedQueryType>;
```

#### Description

Returns the query types supported by this provider. This function allows Studio to know upfront which formats will be supported, and which providers (and their query types) are eligible to be selected for certain use cases.

### `invoke2`

It is advised to use the [Provider Development Kit](https://docs.rs/fiberplane-pdk/latest/fiberplane_pdk/) rather than implementing this function manually. The [`pdk_query_types!`](https://docs.rs/fiberplane-pdk-macros/latest/fiberplane_pdk_macros/macro.pdk_query_types.html) macro can be used to generate this function for you. See the [tutorial](create-a-provider) for more information about using the PDK.

#### Signature

```rust
pub async fn invoke2(request: ProviderRequest) -> Result<Blob>;
```

#### Description

Invokes the provider to perform a data request.

### `create_cells` (Optional)

#### Signature

```rust
pub fn create_cells(query_type: String, response: Blob) -> Result<Vec<Cell>>;
```

#### Description

Creates output cells based on the response (a `Blob` that the provider previously sent to answer an `invoke2` call). Studio would typically embed the created cells in the provider cell, but other actions could be desired.

When any created cells use a `data-links` field with the value `cell-data:<mime-type>,self` (such as Log cells or Graph cells), Studio will replace the value `self` with the ID of the cell for which the query was invoked. This allows the provider to create cells that reference its own data without knowing the context of the cell in which it was executed.

Note that implementing `create_cells` is optional. If `invoke2` returns a Blob with a MIME type of `application/vnd.fiberplane.cells` (suffixed with either `+json` or `+msgpack`), that response will be parsed into an array of cells, and the call to this function is elided. A consequence of this approach is that the blob with the response does not get stored on the provider cell -- only the parsed cells will be stored. This can make this approach less suitable for graph cells and log cells, for instance, but makes it more efficient when there is no need to refer to the data after the cells are instantiated.

### `extract_data` (Optional)

#### Signature

```rust
pub fn extract_data(response: Blob, mime_type: String, query: Option<String>) -> Result<Blob>;
```

#### Description

Takes the response data, and returns it in the given MIME type, optionally passing an additional query string to customize extraction behavior.

Returns `Err(Error::UnsupportedRequest)` if an unsupported MIME type is passed.

Please be aware that in order for Studio to parse response blobs, the MIME type has to specify the encoding format, using either the `+json` or `+msgpack` suffix. This applies to all the MIME types recognized by Studio, such as:

- `application/vnd.fiberplane.cells`
- `application/vnd.fiberplane.events`
- `application/vnd.fiberplane.timeseries`

While Blobs must specify the encoding suffix for their data to be correctly parsed, the `mime_type` that is _requested_ does not specify it. The implementation is then free to decide which encoding to use for the blob it returns.

When deriving the [`ProviderData` trait](https://docs.rs/fiberplane-pdk/latest/fiberplane_pdk/provider_data/trait.ProviderData.html), its `to_blob()` helper will automatically pick a suitable encoding for you.

Note: When the MIME type in the provider response is the same as the MIME type given as the second argument (sans encoding suffix), and the `query` is omitted, the return value is expected to be equivalent to the raw response data. This means Studio should be allowed to elide calls to this function if there is no query string and the MIME type is an exact match. This elision should not change the outcome.

### `get_config_schema` (Optional)

#### Signature

```rust
pub fn get_config_schema() -> ConfigSchema;
```

#### Description

Returns the schema for the config consumed by this provider.

Note this schema is only used by Studio to display a configuration form in case the provider is configured as a direct data source. The provider itself is responsible for validating the contents of its config. Assuming the provider uses Serde for parsing the config, validation is done at that stage.

This function only needs to be implemented by providers that are statically bundled with Studio. You should never have to implement it, it is mentioned here for the sake of completeness.

## Imported functions

These functions are usable as long as you import `fiberplane_pdk::prelude::*` in your library code. These functions allow you to access features provided to you by the runtime.

For the Fiberplane Daemon, these functions are implemented in the [Provider Runtime crate](https://docs.rs/fiberplane-provider-runtime/latest/fiberplane_provider_runtime/).

### `make_http_request`

#### Signature

```rust
pub async fn make_http_request(request: HttpRequest) -> Result<HttpResponse, HttpRequestError>;
```

#### Description

This is the most useful imported function, it allows the providers to make HTTP queries to remote hosts through the hosting runtime. A basic example of its usage can be seen in the tutorial to create a provider:

```rust
let base_url: Url = "https://jsonplaceholder.typicode.com".parse().unwrap();
let url = base_url
    .join("/users")
    .unwrap();

let request = HttpRequest::builder()
    .method(HttpRequestMethod::Get)
    .url(url.to_string())
    .body(None)
    .headers(None)
    .build();

let response = make_http_request(request).await?;

serde_json::from_slice(&response.body).map_err(|e| Error::Deserialization { message: format!("Could not deserialize payload: {e:?}") })
```

### `log`

#### Signature

```rust
pub fn log(message: String);
```

#### Description

This function asks the hosting runtime to log a message. This will make your log messages appear in Studio or in the standard output of the Fiberplane Daemon instance. Its usage is often as simple as:

```rust
let location = GeoLocation { latitude: 50.1234, longitude: 4.12084837 };
log(format!("Catnip: looking for the closest dispenser to {location:?} now..."));
```

### `random`

#### Signature

```rust
pub fn random(len: u32) -> Vec<u8>;
```

#### Description

Query the hosting runtime for a source of randomness. Note that there is no guarantee that the random values you obtain this way to be cryptographically secure: it is entirely dependent on the runtime implementation. You can see the implementation of randomness for the Fiberplane Daemon in the [Provider Runtime crate](https://github.com/fiberplane/fiberplane-rs/blob/6679fbd0f1cbdac7c57422ae699e12bb35bed71b/fiberplane-provider-protocol/fiberplane-provider-runtime/src/spec/mod.rs#L116) source code.

For example, you could create a [getrandom](https://docs.rs/getrandom/latest/getrandom/macro.register_custom_getrandom.html#writing-a-custom-getrandom-implementation) provider using it

```rust
// In a helper crate like getrandom_fp_provider
use getrandom::Error;

pub fn use_fp_bindings(buf: &mut [u8]) -> Result<(), Error> {
    let vals = random(buf.len());
    buf.copy_from_slice(&vals);
    Ok(())
}

// In your provider crate
use getrandom_fp_provider::use_fp_bindings;
use getrandom::register_custom_getrandom;

register_custom_getrandom!(use_fp_bindings);
```

> Note: this example snippet might prove generic and useful enough to be upstreamed
> by Fiberplane and available as a public helper crate. Stay tuned!

### `now`

#### Signature

```rust
pub fn now() -> Timestamp;
```

#### Description

Returns a timestamp of the current time of execution. The usefulness of this timestamp comes from what you want to do with timers, or signature creation/verification schemes.
