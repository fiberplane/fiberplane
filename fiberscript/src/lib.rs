use deno_runtime::deno_cache::{deno_cache, SqliteBackedCache};
use deno_runtime::deno_console::deno_console;
use deno_runtime::deno_core::resolve_path;
use deno_runtime::deno_core::{error::AnyError, JsRuntime, RuntimeOptions};
use deno_runtime::deno_fetch::{deno_fetch, Options as FetchOptions};
use deno_runtime::deno_tls::deno_tls;
use deno_runtime::deno_url::deno_url;
use deno_runtime::deno_web::{deno_web, BlobStore};
use deno_runtime::deno_webidl::deno_webidl;
use deno_runtime::permissions::PermissionsContainer;
use deno_runtime::runtime;
use std::env::current_dir;
use std::sync::Arc;

pub async fn run_script(path: impl AsRef<str>) -> Result<(), AnyError> {
    let blob_store = BlobStore::default();

    let fetch_options = FetchOptions {
        user_agent: "FiberScript".to_owned(),
        ..Default::default()
    };

    let extensions = vec![
        deno_console::init_ops_and_esm(),
        deno_tls::init_ops_and_esm(),
        deno_webidl::init_ops_and_esm(),
        deno_url::init_ops_and_esm(),
        deno_web::init_ops_and_esm::<PermissionsContainer>(Arc::new(blob_store), None),
        deno_cache::init_ops_and_esm::<SqliteBackedCache>(None),
        deno_fetch::init_ops_and_esm::<PermissionsContainer>(fetch_options),
        runtime::init_ops_and_esm(),
    ];
    let mut js_runtime = JsRuntime::new(RuntimeOptions {
        extensions,
        ..Default::default()
    });

    let url = resolve_path(path.as_ref(), &current_dir()?)?;

    let module_id = js_runtime.load_main_module(&url, None).await?;

    js_runtime.mod_evaluate(module_id).await
}
