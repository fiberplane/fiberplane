#![allow(unused)]
use super::types::*;
use fp_bindgen_support::{
    common::{abi::WasmAbi, mem::FatPtr},
    wasmer2_host::{
        errors::{InvocationError, RuntimeError},
        mem::{
            deserialize_from_slice, export_to_guest, export_to_guest_raw, import_from_guest,
            import_from_guest_raw, serialize_to_vec,
        },
        r#async::{create_future_value, future::ModuleRawFuture, resolve_async_value},
        runtime::RuntimeInstanceData,
    },
};
use std::cell::RefCell;
use wasmer::{imports, Function, ImportObject, Instance, Module, Store, WasmerEnv};

#[derive(Clone)]
pub struct Runtime {
    instance: Instance,
    env: RuntimeInstanceData,
}

impl Runtime {
    pub fn new(wasm_module: impl AsRef<[u8]>) -> Result<Self, RuntimeError> {
        let store = Self::default_store();
        let module = Module::new(&store, wasm_module)?;
        let mut env = RuntimeInstanceData::default();
        let import_object = create_import_object(module.store(), &env);
        let instance = Instance::new(&module, &import_object).unwrap();
        env.init_with_instance(&instance).unwrap();
        Ok(Self { instance, env })
    }

    #[cfg(any(target_arch = "arm", target_arch = "aarch64"))]
    fn default_store() -> wasmer::Store {
        let compiler = wasmer::Cranelift::default();
        let engine = wasmer::Universal::new(compiler).engine();
        Store::new(&engine)
    }

    #[cfg(not(any(target_arch = "arm", target_arch = "aarch64")))]
    fn default_store() -> wasmer::Store {
        let compiler = wasmer::Singlepass::default();
        let engine = wasmer::Universal::new(compiler).engine();
        Store::new(&engine)
    }

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
    pub fn create_cells(
        &self,
        query_type: String,
        response: Blob,
    ) -> Result<Result<Vec<Cell>, Error>, InvocationError> {
        let query_type = serialize_to_vec(&query_type);
        let response = serialize_to_vec(&response);
        let result = self.create_cells_raw(query_type, response);
        let result = result.map(|ref data| deserialize_from_slice(data));
        result
    }
    pub fn create_cells_raw(
        &self,
        query_type: Vec<u8>,
        response: Vec<u8>,
    ) -> Result<Vec<u8>, InvocationError> {
        let query_type = export_to_guest_raw(&self.env, query_type);
        let response = export_to_guest_raw(&self.env, response);
        let function = self
            .instance
            .exports
            .get_native_function::<(FatPtr, FatPtr), FatPtr>("__fp_gen_create_cells")
            .map_err(|_| {
                InvocationError::FunctionNotExported("__fp_gen_create_cells".to_owned())
            })?;
        let result = function.call(query_type.to_abi(), response.to_abi())?;
        let result = import_from_guest_raw(&self.env, result);
        Ok(result)
    }

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
    pub fn extract_data(
        &self,
        response: Blob,
        mime_type: String,
        query: Option<String>,
    ) -> Result<Result<Blob, Error>, InvocationError> {
        let response = serialize_to_vec(&response);
        let mime_type = serialize_to_vec(&mime_type);
        let query = serialize_to_vec(&query);
        let result = self.extract_data_raw(response, mime_type, query);
        let result = result.map(|ref data| deserialize_from_slice(data));
        result
    }
    pub fn extract_data_raw(
        &self,
        response: Vec<u8>,
        mime_type: Vec<u8>,
        query: Vec<u8>,
    ) -> Result<Vec<u8>, InvocationError> {
        let response = export_to_guest_raw(&self.env, response);
        let mime_type = export_to_guest_raw(&self.env, mime_type);
        let query = export_to_guest_raw(&self.env, query);
        let function = self
            .instance
            .exports
            .get_native_function::<(FatPtr, FatPtr, FatPtr), FatPtr>("__fp_gen_extract_data")
            .map_err(|_| {
                InvocationError::FunctionNotExported("__fp_gen_extract_data".to_owned())
            })?;
        let result = function.call(response.to_abi(), mime_type.to_abi(), query.to_abi())?;
        let result = import_from_guest_raw(&self.env, result);
        Ok(result)
    }

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
    pub fn get_config_schema(&self) -> Result<ConfigSchema, InvocationError> {
        let result = self.get_config_schema_raw();
        let result = result.map(|ref data| deserialize_from_slice(data));
        result
    }
    pub fn get_config_schema_raw(&self) -> Result<Vec<u8>, InvocationError> {
        let function = self
            .instance
            .exports
            .get_native_function::<(), FatPtr>("__fp_gen_get_config_schema")
            .map_err(|_| {
                InvocationError::FunctionNotExported("__fp_gen_get_config_schema".to_owned())
            })?;
        let result = function.call()?;
        let result = import_from_guest_raw(&self.env, result);
        Ok(result)
    }

    /// Returns the query types supported by this provider.
    /// This function allows Studio to know upfront which formats will be
    /// supported, and which providers (and their query types) are eligible to
    /// be selected for certain use cases.
    pub async fn get_supported_query_types(
        &self,
        config: ProviderConfig,
    ) -> Result<Vec<SupportedQueryType>, InvocationError> {
        let config = serialize_to_vec(&config);
        let result = self.get_supported_query_types_raw(config);
        let result = result.await;
        let result = result.map(|ref data| deserialize_from_slice(data));
        result
    }
    pub async fn get_supported_query_types_raw(
        &self,
        config: Vec<u8>,
    ) -> Result<Vec<u8>, InvocationError> {
        let config = export_to_guest_raw(&self.env, config);
        let function = self
            .instance
            .exports
            .get_native_function::<FatPtr, FatPtr>("__fp_gen_get_supported_query_types")
            .map_err(|_| {
                InvocationError::FunctionNotExported(
                    "__fp_gen_get_supported_query_types".to_owned(),
                )
            })?;
        let result = function.call(config.to_abi())?;
        let result = ModuleRawFuture::new(self.env.clone(), result).await;
        Ok(result)
    }

    /// Invokes the provider to perform a data request.
    pub async fn invoke2(
        &self,
        request: ProviderRequest,
    ) -> Result<Result<Blob, Error>, InvocationError> {
        let request = serialize_to_vec(&request);
        let result = self.invoke2_raw(request);
        let result = result.await;
        let result = result.map(|ref data| deserialize_from_slice(data));
        result
    }
    pub async fn invoke2_raw(&self, request: Vec<u8>) -> Result<Vec<u8>, InvocationError> {
        let request = export_to_guest_raw(&self.env, request);
        let function = self
            .instance
            .exports
            .get_native_function::<FatPtr, FatPtr>("__fp_gen_invoke2")
            .map_err(|_| InvocationError::FunctionNotExported("__fp_gen_invoke2".to_owned()))?;
        let result = function.call(request.to_abi())?;
        let result = ModuleRawFuture::new(self.env.clone(), result).await;
        Ok(result)
    }
}

fn create_import_object(store: &Store, env: &RuntimeInstanceData) -> ImportObject {
    imports! {
        "fp" => {
            "__fp_host_resolve_async_value" => Function::new_native_with_env(store, env.clone(), resolve_async_value),
            "__fp_gen_log" => Function::new_native_with_env(store, env.clone(), _log),
            "__fp_gen_make_http_request" => Function::new_native_with_env(store, env.clone(), _make_http_request),
            "__fp_gen_now" => Function::new_native_with_env(store, env.clone(), _now),
            "__fp_gen_random" => Function::new_native_with_env(store, env.clone(), _random),
        }
    }
}

pub fn _log(env: &RuntimeInstanceData, message: FatPtr) {
    let message = import_from_guest::<String>(env, message);
    super::log(message)
}

pub fn _make_http_request(env: &RuntimeInstanceData, request: FatPtr) -> FatPtr {
    let request = import_from_guest::<HttpRequest>(env, request);
    let env = env.clone();
    let async_ptr = create_future_value(&env);
    let handle = tokio::runtime::Handle::current();
    handle.spawn(async move {
        let result = super::make_http_request(request).await;
        let result_ptr = export_to_guest(&env, &result);
        env.guest_resolve_async_value(async_ptr, result_ptr);
    });
    async_ptr
}

pub fn _now(env: &RuntimeInstanceData) -> FatPtr {
    export_to_guest(env, &super::now())
}

pub fn _random(env: &RuntimeInstanceData, len: <u32 as WasmAbi>::AbiType) -> FatPtr {
    let len = WasmAbi::from_abi(len);
    export_to_guest(env, &super::random(len))
}
