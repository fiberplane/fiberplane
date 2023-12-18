mod module_loader;

use deno_ast::{parse_module, EmitOptions, MediaType, ParseParams, SourceTextInfo};
use deno_runtime::deno_broadcast_channel::{deno_broadcast_channel, InMemoryBroadcastChannel};
use deno_runtime::deno_cache::{deno_cache, SqliteBackedCache};
use deno_runtime::deno_console::deno_console;
use deno_runtime::deno_core::resolve_path;
use deno_runtime::deno_core::{error::AnyError, JsRuntime, RuntimeOptions};
use deno_runtime::deno_crypto::deno_crypto;
use deno_runtime::deno_fetch::{deno_fetch, Options as FetchOptions};
use deno_runtime::deno_ffi::deno_ffi;
use deno_runtime::deno_fs::{deno_fs, RealFs};
use deno_runtime::deno_http::{deno_http, DefaultHttpPropertyExtractor};
use deno_runtime::deno_io::deno_io;
use deno_runtime::deno_napi::deno_napi;
use deno_runtime::deno_net::deno_net;
use deno_runtime::deno_node::deno_node;
use deno_runtime::deno_tls::deno_tls;
use deno_runtime::deno_url::deno_url;
use deno_runtime::deno_web::{deno_web, BlobStore};
use deno_runtime::deno_webidl::deno_webidl;
use deno_runtime::deno_websocket::deno_websocket;
use deno_runtime::deno_webstorage::deno_webstorage;
use deno_runtime::permissions::PermissionsContainer;
use deno_runtime::runtime;
use module_loader::FiberScriptModuleLoader;
use std::env::current_dir;
use std::sync::Arc;

pub async fn run_script(path: impl AsRef<str>) -> Result<(), AnyError> {
    let blob_store = BlobStore::default();
    let broadcast_channel = InMemoryBroadcastChannel::default();

    let fs = Arc::new(RealFs);

    let user_agent = "FiberScript".to_owned();
    let fetch_options = FetchOptions {
        user_agent: user_agent.clone(),
        ..Default::default()
    };

    let extensions = vec![
        deno_console::init_ops_and_esm(),
        deno_napi::init_ops_and_esm::<PermissionsContainer>(),
        deno_tls::init_ops_and_esm(),
        deno_webidl::init_ops_and_esm(),
        deno_url::init_ops_and_esm(),
        deno_web::init_ops_and_esm::<PermissionsContainer>(Arc::new(blob_store), None),
        deno_ffi::init_ops_and_esm::<PermissionsContainer>(),
        deno_io::init_ops_and_esm(None),
        deno_fs::init_ops_and_esm::<PermissionsContainer>(fs.clone()),
        deno_net::init_ops_and_esm::<PermissionsContainer>(None, None),
        deno_node::init_ops_and_esm::<PermissionsContainer>(None, fs),
        deno_broadcast_channel::init_ops_and_esm(broadcast_channel),
        deno_crypto::init_ops_and_esm(None),
        deno_fetch::init_ops_and_esm::<PermissionsContainer>(fetch_options),
        deno_cache::init_ops_and_esm::<SqliteBackedCache>(None),
        deno_websocket::init_ops_and_esm::<PermissionsContainer>(user_agent, None, None),
        deno_http::init_ops_and_esm::<DefaultHttpPropertyExtractor>(),
        deno_webstorage::init_ops_and_esm(None),
        runtime::init_ops_and_esm(),
    ];
    let mut js_runtime = JsRuntime::new(RuntimeOptions {
        extensions,
        module_loader: FiberScriptModuleLoader::new(),
        ..Default::default()
    });

    let url = resolve_path(path.as_ref(), &current_dir()?)?;

    let source_text = std::fs::read_to_string(path.as_ref())?;
    let text_info = SourceTextInfo::new(source_text.into());
    let parsed_source = parse_module(ParseParams {
        specifier: url.to_string(),
        media_type: MediaType::TypeScript,
        text_info,
        capture_tokens: true,
        maybe_syntax: None,
        scope_analysis: false,
    })?;
    let transpiled = parsed_source.transpile(&EmitOptions::default())?;

    let module_id = js_runtime
        .load_main_module(&url, Some(transpiled.text.into()))
        .await?;

    js_runtime.mod_evaluate(module_id).await
}
