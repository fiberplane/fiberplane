use crate::types::*;

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
#[fp_bindgen_support::fp_export_signature]
pub fn create_cells(query_type: String, response: Blob) -> Result<Vec<Cell>, Error>;

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
#[fp_bindgen_support::fp_export_signature]
pub fn extract_data(response: Blob, mime_type: String, query: Option<String>) -> Result<Blob, Error>;

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
#[fp_bindgen_support::fp_export_signature]
pub fn get_config_schema() -> ConfigSchema;

/// Returns the query types supported by this provider.
/// This function allows Studio to know upfront which formats will be
/// supported, and which providers (and their query types) are eligible to
/// be selected for certain use cases.
#[fp_bindgen_support::fp_export_signature]
pub async fn get_supported_query_types(config: ProviderConfig) -> Vec<SupportedQueryType>;

/// Invokes the provider to perform a data request.
#[fp_bindgen_support::fp_export_signature]
pub async fn invoke2(request: ProviderRequest) -> Result<Blob, Error>;
