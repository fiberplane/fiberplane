// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

use deno_ast::parse_module;
use deno_ast::MediaType;
use deno_core::anyhow::Context;
use deno_core::error::custom_error;
use deno_core::error::AnyError;
use deno_core::futures::future::FutureExt;
use deno_core::futures::Future;
use deno_core::resolve_url;
use deno_core::ModuleLoader;
use deno_core::ModuleSource;
use deno_core::ModuleSpecifier;
use deno_core::ModuleType;
use deno_core::ResolutionKind;
use deno_core::SourceMapGetter;
use deno_runtime::deno_core;
use std::borrow::Cow;
use std::pin::Pin;
use std::sync::Arc;

pub struct FiberScriptModuleLoader {}

impl ModuleLoader for FiberScriptModuleLoader {
    fn resolve(
        &self,
        specifier: &str,
        referrer: &str,
        kind: ResolutionKind,
    ) -> Result<ModuleSpecifier, AnyError> {
        let permissions = if matches!(kind, ResolutionKind::DynamicImport) {
            &self.dynamic_permissions
        } else {
            &self.root_permissions
        };

        // TODO(bartlomieju): ideally we shouldn't need to call `current_dir()` on each
        // call - maybe it should be caller's responsibility to pass it as an arg?
        let cwd = std::env::current_dir().context("Unable to get CWD")?;
        let referrer = deno_core::resolve_url_or_path(referrer, &cwd)?;

        let graph = self.shared.graph_container.graph();
        let maybe_resolved = match graph.get(referrer) {
            Some(Module::Esm(module)) => module.dependencies.get(specifier).map(|d| &d.maybe_code),
            _ => None,
        };

        match maybe_resolved {
            Some(Resolution::Ok(resolved)) => {
                let specifier = &resolved.specifier;

                return match graph.get(specifier) {
                    Some(Module::Npm(module)) => {
                        let package_folder = self
                            .shared
                            .node_resolver
                            .npm_resolver
                            .as_managed()
                            .unwrap() // byonm won't create a Module::Npm
                            .resolve_pkg_folder_from_deno_module(module.nv_reference.nv())?;
                        self.shared
                            .node_resolver
                            .resolve_package_sub_path(
                                &package_folder,
                                module.nv_reference.sub_path(),
                                referrer,
                                permissions,
                            )
                            .with_context(|| {
                                format!("Could not resolve '{}'.", module.nv_reference)
                            })
                    }
                    Some(Module::Node(module)) => Ok(module.specifier.clone()),
                    Some(Module::Esm(module)) => Ok(module.specifier.clone()),
                    Some(Module::Json(module)) => Ok(module.specifier.clone()),
                    Some(Module::External(module)) => {
                        Ok(node::resolve_specifier_into_node_modules(&module.specifier))
                    }
                    None => Ok(specifier.clone()),
                };
            }
            Some(Resolution::Err(err)) => {
                return Err(custom_error(
                    "TypeError",
                    format!("{}\n", err.to_string_with_range()),
                ))
            }
            Some(Resolution::None) | None => {}
        }
    }

    fn load(
        &self,
        specifier: &ModuleSpecifier,
        maybe_referrer: Option<&ModuleSpecifier>,
        is_dynamic: bool,
    ) -> Pin<Box<deno_core::ModuleSourceFuture>> {
        // NOTE: this block is async only because of `deno_core` interface
        // requirements; module was already loaded when constructing module graph
        // during call to `prepare_load` so we can load it synchronously.
        Box::pin(deno_core::futures::future::ready(load_sync(
            specifier,
            maybe_referrer,
            is_dynamic,
        )))
    }

    fn prepare_load(
        &self,
        _specifier: &ModuleSpecifier,
        _maybe_referrer: Option<String>,
        _is_dynamic: bool,
    ) -> Pin<Box<dyn Future<Output = Result<(), AnyError>>>> {
        Box::pin(async { Ok(()) })
    }
}

fn load_sync(
    specifier: &ModuleSpecifier,
    _maybe_referrer: Option<&ModuleSpecifier>,
    _is_dynamic: bool,
) -> Result<ModuleSource, AnyError> {
    let source_text = std::fs::read_to_string(specifier.as_str())?;
    let text_info = SourceTextInfo::new(source_text.into());
    let parsed_source = parse_module(source_text.into())?;
    let transpiled_source = parsed_source.transpile(&self.emit_options)?;
    debug_assert!(transpiled_source.source_map.is_none());
    self.emit_cache
        .set_emit_code(specifier, source_hash, &transpiled_source.text);
    Ok(transpiled_source.text.into())
}
