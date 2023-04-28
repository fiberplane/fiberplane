use fiberplane_models::notebooks::Cell;
use fiberplane_models::timestamps::Timestamp;
use fiberplane_models::{blobs::Blob, providers::*};
use fp_bindgen::{prelude::*, types::CargoDependency};
use std::collections::{BTreeMap, BTreeSet};

fp_import! {
    /// Logs a message to the (development) console.
    fn log(message: String);

    /// Performs an HTTP request.
    async fn make_http_request(request: HttpRequest) -> Result<HttpResponse, HttpRequestError>;

    /// Returns the current timestamp.
    fn now() -> Timestamp;

    /// Generates random bytes.
    fn random(len: u32) -> Vec<u8>;
}

fp_export! {
    type ConfigSchema = Vec<ConfigField>;
    type Formatting = Vec<AnnotationWithOffset>;
    type ProviderConfig = Value;
    type QuerySchema = Vec<QueryField>;
    type TableRowData = BTreeMap<String, TableCellValue>;

    // Standardized types that are used for provider data. These should only
    // be needed when trying to construct or parse blobs of certain MIME types.
    //
    // NOTE: Don't use these within FPD to make sure its proxy functionality
    //       can treat all data as opaque.
    use AutoSuggestRequest;
    use Metric;
    use OtelMetadata;
    use OtelSeverityNumber;
    use OtelSpanId;
    use OtelTraceId;
    use ProviderEvent;
    use ProviderStatus;
    use Suggestion;
    // TODO FP-2920: Enable `Timeline` once the `Event` type is unified.
    // See: https://linear.app/fiberplane/issue/FP-2920/merge-event-structs-from-the-provider-and-api-module
    //use Timeline;
    use Timeseries;

    /// Returns the schema for the config consumed by this provider.
    ///
    /// Note this schema is only used by Studio to display a configuration form
    /// in case the provider is configured as a direct data source. The provider
    /// itself is responsible for validating the contents of its config.
    /// Assuming the provider uses Serde for parsing the config, validation is
    /// done at that stage.
    ///
    /// This function only needs to be implemented by providers that are
    /// statically bundled with Studio.
    fn get_config_schema() -> ConfigSchema;

    /// Returns the query types supported by this provider.
    /// This function allows Studio to know upfront which formats will be
    /// supported, and which providers (and their query types) are eligible to
    /// be selected for certain use cases.
    async fn get_supported_query_types(config: ProviderConfig) -> Vec<SupportedQueryType>;

    /// Invokes the provider to perform a data request.
    async fn invoke2(request: ProviderRequest) -> Result<Blob, Error>;

    /// Creates output cells based on the response.
    /// Studio would typically embed the created cells in the provider cell,
    /// but other actions could be desired.
    ///
    /// When any created cells use a `data` field with the value
    /// `cell-data:<mime-type>,self`, Studio will replace the value `self` with
    /// the ID of the cell for which the query was invoked. This allows the
    /// provider to create cells that reference its own data without knowing the
    /// context of the cell in which it was executed.
    ///
    /// Note: When the MIME type in the provider response is
    /// `application/vnd.fiberplane.cells` (suffixed with either `+json` or
    /// `+msgpack`), Studio will elide the call to `create_cells()` and simply
    /// parse the data directly to a `Vec<Cell>`.
    fn create_cells(query_type: String, response: Blob) -> Result<Vec<Cell>, Error>;

    /// Takes the response data, and returns it in the given MIME type,
    /// optionally passing an additional query string to customize extraction
    /// behavior.
    ///
    /// Returns `Err(Error::UnsupportedRequest)` if an unsupported MIME type is
    /// passed.
    ///
    /// Note: When the MIME type in the provider response is the same as the
    /// MIME type given as the second argument, and the `query` is omitted, the
    /// return value is expected to be equivalent to the raw response data. This
    /// means Studio should be allowed to elide calls to this function if there
    /// is no query string and the MIME type is an exact match. This elision
    /// should not change the outcome.
    fn extract_data(response: Blob, mime_type: String, query: Option<String>) -> Result<Blob, Error>;
}

fn main() {
    {
        let dependencies = BTreeMap::from([
            ("bytes", CargoDependency::with_version("1")),
            ("fiberplane-models", CargoDependency::from_workspace()),
            (
                "fp-bindgen-support",
                CargoDependency::from_workspace_with_features(BTreeSet::from(["async", "guest"])),
            ),
            ("once_cell", CargoDependency::from_workspace()),
            (
                "rmpv",
                CargoDependency::with_version_and_features("1.0.0", BTreeSet::from(["with-serde"])),
            ),
        ]);

        let path = "./fiberplane-provider-bindings";
        fp_bindgen!(BindingConfig {
            bindings_type: BindingsType::RustPlugin(
                RustPluginConfig::builder()
                    .name("fiberplane-provider-bindings")
                    .description("Fiberplane Provider protocol bindings")
                    .readme("README.md")
                    .version("2.0.0-beta.2")
                    .authors(RustPluginConfigValue::Workspace)
                    .license(RustPluginConfigValue::Workspace)
                    .dependencies(dependencies)
                    .build()
            ),
            path,
        });
        println!("Rust plugin bindings written to `{path}/`.");
    }

    {
        let path = "./fiberplane-provider-runtime/src/spec";
        fp_bindgen!(BindingConfig {
            bindings_type: BindingsType::RustWasmer2Runtime,
            path,
        });
        println!("Rust Wasmer runtime bindings written to `{path}/`.");
    }

    {
        let path = "./ts-runtime";
        fp_bindgen!(BindingConfig {
            bindings_type: BindingsType::TsRuntime(
                TsRuntimeConfig::new().with_raw_export_wrappers()
            ),
            path,
        });
        println!("TypeScript runtime bindings written to `{path}/`.");
    }
}
