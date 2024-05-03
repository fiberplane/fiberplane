use crate::types;
use crate::types::{
    map_type, reference_name_to_models_path, resolve, ResolveTarget, ResolvedReference,
};
use anyhow::{anyhow, bail, Context, Result};
use convert_case::{Case, Casing};
use okapi::openapi3::{
    Components, MediaType, Operation, Parameter, ParameterValue, PathItem, RefOr,
};
use okapi::Map;
use regex::Regex;
use schemars::schema::{Schema, SingleOrVec};
use serde_json::Value;
use std::borrow::Borrow;
use std::fs::{File, OpenOptions};
use std::io::{BufWriter, Write};
use std::ops::Deref;
use std::path::Path;

pub(crate) fn generate_routes(
    paths: &Map<String, PathItem>,
    src_path: &Path,
    components: &Components,
    models: &[String],
) -> Result<()> {
    let path = src_path.join("lib.rs");

    // https://stackoverflow.com/a/50691004/11494565
    let file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .append(false)
        .open(path)
        .context("Failed to open or create lib.rs file")?;

    let mut writer = BufWriter::new(file);

    writeln!(writer, "#![forbid(unsafe_code)]")?;
    writeln!(writer, "#![allow(clippy::too_many_arguments)]")?;
    writeln!(writer, "#![allow(unused_mut)]")?;
    writeln!(writer, "#![allow(unused_variables)]")?;
    writeln!(writer, "#![allow(unused_imports)]")?;
    writeln!(writer)?;
    writeln!(writer, "mod api_client;")?;
    writeln!(writer, "pub mod builder;")?;
    writeln!(writer, "pub mod clients;")?;
    writeln!(writer)?;
    writeln!(writer, "use anyhow::{{Context as _, Result}};")?;
    writeln!(writer, "pub use api_client::{{ApiClient, ApiClientError}};")?;
    writeln!(writer, "use reqwest::Method;")?;
    writeln!(writer)?;
    writeln!(writer, "pub(crate) mod models {{")?;

    for model in models {
        writeln!(writer, "    pub(crate) use {model};")?;
    }

    writeln!(writer, "}}\n")?;

    writeln!(writer, "impl ApiClient {{")?;

    for (path, item) in paths {
        if let Some(operation) = &item.get {
            generate_route(
                path,
                "GET",
                operation,
                &item.parameters,
                &mut writer,
                components,
            )?;
        }
        if let Some(operation) = &item.put {
            generate_route(
                path,
                "PUT",
                operation,
                &item.parameters,
                &mut writer,
                components,
            )?;
        }
        if let Some(operation) = &item.post {
            generate_route(
                path,
                "POST",
                operation,
                &item.parameters,
                &mut writer,
                components,
            )?;
        }
        if let Some(operation) = &item.delete {
            generate_route(
                path,
                "DELETE",
                operation,
                &item.parameters,
                &mut writer,
                components,
            )?;
        }
        if let Some(operation) = &item.patch {
            generate_route(
                path,
                "PATCH",
                operation,
                &item.parameters,
                &mut writer,
                components,
            )?;
        }

        // options, head, trace not yet supported

        writeln!(writer)?;
    }

    writeln!(writer, "}}")?;

    writer.flush().context("Failed to flush lib.rs")?;

    Ok(())
}

fn generate_route(
    path: &str,
    method: &str,
    operation: &Operation,
    shared_parameters: &[RefOr<Parameter>],
    writer: &mut BufWriter<File>,
    components: &Components,
) -> Result<()> {
    let use_new_style = operation
        .extensions
        .get("x-new-style")
        .map_or(false, |value| {
            if let Value::Bool(value) = value {
                *value
            } else {
                false
            }
        });

    if let Some(description) = &operation.description {
        writeln!(writer, "#[doc = r#\"{description}\"#]")?;
    }

    let method_name = operation
        .operation_id
        .as_ref()
        .ok_or_else(|| anyhow!("\"{} {}\" does not have operation_id", method, path))?;

    writeln!(writer, "pub async fn {method_name}(")?;
    writeln!(writer, "    &self,")?;

    for raw_param in shared_parameters.iter().chain(&operation.parameters) {
        match resolve(ResolveTarget::Parameter(&Some(raw_param)), components)? {
            Some(ResolvedReference::Parameter(parameter)) => {
                write!(writer, "    {}: ", &parameter.name.to_case(Case::Snake))?;

                if !parameter.required {
                    write!(writer, "Option<")?;
                }

                match &parameter.value {
                    ParameterValue::Schema { schema, .. } => {
                        let type_ = types::map_type(
                            schema.format.as_deref(),
                            schema.instance_type.as_ref(),
                            schema.reference.as_deref(),
                            true,
                        )
                        .with_context(|| {
                            format!(
                                "Failed to map type for parameter {}. Schema: {:?}",
                                &parameter.name, schema
                            )
                        })?;

                        let string: &str = type_.borrow();
                        write!(writer, "{string}")?;
                    }
                    ParameterValue::Content { .. } => {}
                }

                if !parameter.required {
                    write!(writer, ">")?;
                }

                writeln!(writer, ",")?;
            }
            Some(resolved) => bail!(
                "resolved to unexpected type {:?}, expected `Parameter`",
                resolved
            ),
            None => {}
        }
    }

    match resolve(
        ResolveTarget::RequestBody(&operation.request_body.as_ref()),
        components,
    )? {
        Some(ResolvedReference::RequestBody(body)) => {
            let media_types: Vec<&MediaType> = body
                .content
                .iter()
                .filter_map(|(content_type, media_type)| {
                    if content_type == "application/json"
                        || content_type == "multipart/form-data"
                        || content_type == "application/octet-stream"
                    {
                        Some(media_type)
                    } else {
                        eprintln!(
                            "warn: found \"{content_type}\", expected json, form data or octet stream"
                        );
                        None
                    }
                })
                .collect();
            let json_type = media_types
                .first()
                .ok_or_else(|| anyhow!("unknown media type"))?;
            let schema = json_type
                .schema
                .as_ref()
                .ok_or_else(|| anyhow!("need a schema"))?;

            if let Some(reference) = &schema.reference {
                let reference = reference_name_to_models_path(reference);
                writeln!(writer, "    payload: {reference}")?;
            } else if let Some(array) = &schema.array {
                let items = array
                    .items
                    .as_ref()
                    .ok_or_else(|| anyhow!("array but no items?"))?;

                match items {
                    SingleOrVec::Single(schema) => match &**schema {
                        Schema::Object(object) => {
                            let type_ = map_type(
                                object.format.as_deref(),
                                object.instance_type.as_ref(),
                                object.reference.as_deref(),
                                true,
                            )?;

                            writeln!(writer, "    payload: Vec<{type_}>")?;
                        }
                        Schema::Bool(_) => bail!("simple boolean Vec is unsupported"),
                    },
                    SingleOrVec::Vec(_) => bail!("Vec with Array as items is not supported"),
                }
            } else {
                // inline type
                let type_ = map_type(
                    schema.format.as_deref(),
                    schema.instance_type.as_ref(),
                    schema.reference.as_deref(),
                    true,
                )?;

                writeln!(writer, "    payload: {type_},")?;
            }
        }
        Some(resolved) => bail!(
            "resolved to unexpected type {:?}, expected `RequestBody`",
            resolved
        ),
        None => {}
    }

    write!(writer, ") -> Result<")?;

    let mut response_type = None;
    let mut array_response = false;

    match resolve(
        ResolveTarget::Response(&operation.responses.responses.get("200")),
        components,
    )? {
        Some(ResolvedReference::Responses(response)) => {
            if response.content.is_empty() {
                response_type = Some(ResponseType::None);
                write!(writer, "()")?;
            } else if let Some(json_media) = response.content.get("application/json") {
                let schema = json_media
                    .schema
                    .as_ref()
                    .ok_or_else(|| anyhow!("need a schema"))?;

                if let Some(reference) = &schema.reference {
                    if let Some((_, reference_name)) = reference.rsplit_once('/') {
                        write!(writer, "models::{}", reference_name.to_case(Case::Pascal))?;
                    } else {
                        write!(writer, "models::{}", reference.to_case(Case::Pascal))?;
                    }
                } else if let Some(array) = &schema.array {
                    array_response = true;
                    match &array.items {
                        Some(SingleOrVec::Single(single)) => match single.deref() {
                            Schema::Bool(_) => eprintln!("unsupported bool for array items"),
                            Schema::Object(schema) => {
                                let type_ = map_type(
                                    schema.format.as_deref(),
                                    schema.instance_type.as_ref(),
                                    schema.reference.as_deref(),
                                    false,
                                )?;

                                if use_new_style {
                                    // New styles requires list to be wrapped in
                                    // a `PagedVec`.
                                    write!(writer, "models::PagedVec<{type_}>")?;
                                } else {
                                    write!(writer, "Vec<{type_}>")?;
                                }
                            }
                        },
                        Some(SingleOrVec::Vec(vec)) => {
                            eprintln!("unsupported multiple items vec {vec:?}")
                        }
                        None => eprintln!("type is array but has no items? {schema:?}"),
                    }
                } else {
                    let type_ = map_type(
                        schema.format.as_deref(),
                        schema.instance_type.as_ref(),
                        schema.reference.as_deref(),
                        false,
                    )?;

                    if type_ == "()" {
                        response_type = Some(ResponseType::None);
                    }

                    write!(writer, "{type_}")?;
                }

                if response_type.is_none() {
                    response_type = Some(ResponseType::Json);
                }
            } else if response.content.contains_key("text/plain") {
                response_type = Some(ResponseType::Text);
                write!(writer, "String")?;
            } else {
                // octet-stream should be `bytes::Bytes` so don't warn about it when we reach this fallback
                if !response.content.contains_key("application/octet-stream") {
                    let keys: Vec<_> = response.content.keys().collect();
                    eprintln!(
                        "warn: unknown response mime type(s), falling back to `bytes::Bytes`: {keys:?}"
                    );
                }

                write!(writer, "bytes::Bytes")?;
            }
        }
        Some(resolved) => bail!(
            "resolved to unexpected type {:?}, expected `Response`",
            resolved
        ),
        None => {
            write!(writer, "()")?;
            response_type = Some(ResponseType::None);
        }
    }

    if use_new_style {
        if let Some(ResolvedReference::Responses(response)) = resolve(
            ResolveTarget::Response(&operation.responses.default.as_ref()),
            components,
        )? {
            let json_media = response.content.get("application/json").ok_or_else(|| {
                anyhow!(
                    "default error to have application/json content type (OperationID: {})",
                    method_name
                )
            })?;
            let schema = json_media.schema.as_ref().ok_or_else(|| {
                anyhow!(
                    "application/json media does not have a schema defined (OperationID: {})",
                    method_name
                )
            })?;

            if let Some(reference) = &schema.reference {
                if let Some((_, reference_name)) = reference.rsplit_once('/') {
                    write!(
                        writer,
                        ", ApiClientError<models::{}>",
                        reference_name.to_case(Case::Pascal)
                    )?;
                } else {
                    write!(
                        writer,
                        ", ApiClientError<models::{}>",
                        reference.to_case(Case::Pascal)
                    )?;
                }
            } else {
                bail!(
                    "Currently only responses with references are supported (OperationID: {})",
                    method_name
                )
            }
        }
    }

    // RETURN TYPE

    writeln!(writer, "> {{")?;

    if use_new_style {
        generate_function_body_new_style(
            path,
            method,
            operation,
            writer,
            components,
            response_type,
            array_response,
        )?;
    } else {
        generate_function_body(path, method, operation, writer, components, response_type)?;
    }

    writeln!(writer, "\n}}\n")?;

    Ok(())
}

fn generate_function_body(
    endpoint: &str,
    method: &str,
    operation: &Operation,
    writer: &mut BufWriter<File>,
    components: &Components,
    response_type: Option<ResponseType>,
) -> Result<()> {
    writeln!(writer, "    let mut builder = self.request(",)?;
    writeln!(writer, "        Method::{method},")?;

    // https://stackoverflow.com/a/413077/11494565
    let regex = Regex::new(r"\{(.*?)\}").context("Failed to build regex")?;
    let mut arguments = vec![];

    for captures in regex.captures_iter(endpoint) {
        let capture = captures
            .get(1)
            .ok_or_else(|| anyhow!("unreachable: always two capture groups (0 + 1)"))?;

        arguments.push(capture.as_str());
    }

    if !arguments.is_empty() {
        write!(writer, "        &format!(\"{endpoint}\", ")?;

        for arg in arguments {
            write!(writer, "{} = {}, ", arg, arg.to_case(Case::Snake))?;
        }

        write!(writer, ")")?;
    } else {
        write!(writer, "        \"{endpoint}\"")?;
    }

    writeln!(writer, "\n    )?;")?;

    // Query strings as parameters
    for ref_or in &operation.parameters {
        let option = Some(ref_or);
        let option = resolve(ResolveTarget::Parameter(&option), components)?;

        if let Some(ResolvedReference::Parameter(parameter)) = option {
            match parameter.location.as_str() {
                "path" => continue,
                "query" => {
                    let mut parameter_name = parameter.name.to_case(Case::Snake);

                    if !parameter.required {
                        writeln!(
                            writer,
                            "    if let Some({parameter_name}) = {parameter_name} {{",
                        )?;
                    }

                    if let ParameterValue::Schema { schema, .. } = &parameter.value {
                        let type_ = map_type(
                            schema.format.as_deref(),
                            schema.instance_type.as_ref(),
                            schema.reference.as_deref(),
                            true,
                        )
                        .with_context(|| {
                            format!(
                                "Failed to map type for parameter {}. Schema: {:?}",
                                &parameter.name, schema
                            )
                        })?;

                        // special handling for types that need to be converted to strings
                        if type_ == "fiberplane_models::timestamps::Timestamp" {
                            parameter_name = format!("{parameter_name}.to_string()")
                        } else if type_ == "std::collections::HashMap<String, String>" {
                            parameter_name = format!("serde_json::to_string(&{parameter_name})?")
                        }
                    }

                    writeln!(
                        writer,
                        "        builder = builder.query(&[(\"{}\", {})]);",
                        parameter.name, parameter_name
                    )?;

                    if !parameter.required {
                        writeln!(writer, "    }}")?;
                    }
                }
                location => eprintln!("unknown `in`: {location}"),
            }
        }
    }

    // Request body
    if let Some(request_body) = &operation.request_body {
        match resolve(ResolveTarget::RequestBody(&Some(request_body)), components)? {
            Some(ResolvedReference::RequestBody(body)) => {
                if body.content.contains_key("application/json") {
                    writeln!(writer, "    builder = builder.json(&payload);")?;
                } else if body.content.contains_key("multipart/form-data") {
                    writeln!(writer, "    builder = builder.form(&payload);")?;
                } else if body.content.contains_key("application/octet-stream") {
                    writeln!(writer, "    builder = builder.body(payload);")?;
                } else {
                    eprintln!("Unsupported type(s): {:?}", body.content);
                }
            }
            Some(resolved) => bail!(
                "resolved to unexpected type {:?}, expected `RequestBody`",
                resolved
            ),
            None => write!(writer, "()")?,
        }
    }

    writeln!(writer, "    let response = builder.send()")?;
    writeln!(writer, "        .await?")?;
    write!(writer, "        .error_for_status()?")?;

    // Response
    write!(
        writer,
        "{}",
        match response_type {
            Some(response_type) => response_type.generate_response_part(),
            None => ResponseType::fallback_response_part(),
        }
    )?;

    Ok(())
}

fn generate_function_body_new_style(
    endpoint: &str,
    method: &str,
    operation: &Operation,
    writer: &mut BufWriter<File>,
    components: &Components,
    _response_type: Option<ResponseType>,
    array_response: bool,
) -> Result<()> {
    writeln!(writer, "    let path = ")?;

    // https://stackoverflow.com/a/413077/11494565
    let regex = Regex::new(r"\{(.*?)\}").context("Failed to build regex")?;
    let mut arguments = vec![];

    for captures in regex.captures_iter(endpoint) {
        let capture = captures
            .get(1)
            .ok_or_else(|| anyhow!("unreachable: always two capture groups (0 + 1)"))?;

        arguments.push(capture.as_str());
    }

    if !arguments.is_empty() {
        write!(writer, "        &format!(\"{endpoint}\", ")?;

        for arg in arguments {
            write!(writer, "{} = {}, ", arg, arg.to_case(Case::Snake))?;
        }

        write!(writer, ");")?;
    } else {
        write!(writer, "        \"{endpoint};\"")?;
    }
    writeln!(writer)?;

    writeln!(
        writer,
        "let mut req = self.request(Method::{method}, path)?;"
    )?;

    writeln!(writer)?;

    // Query strings as parameters
    for ref_or in &operation.parameters {
        let option = Some(ref_or);
        let option = resolve(ResolveTarget::Parameter(&option), components)?;

        if let Some(ResolvedReference::Parameter(parameter)) = option {
            match parameter.location.as_str() {
                "path" => continue,
                "query" => {
                    let mut parameter_name = parameter.name.to_case(Case::Snake);

                    if !parameter.required {
                        writeln!(
                            writer,
                            "    if let Some({parameter_name}) = {parameter_name} {{",
                        )?;
                    }

                    if let ParameterValue::Schema { schema, .. } = &parameter.value {
                        let type_ = map_type(
                            schema.format.as_deref(),
                            schema.instance_type.as_ref(),
                            schema.reference.as_deref(),
                            true,
                        )
                        .with_context(|| {
                            format!(
                                "Failed to map type for parameter {}. Schema: {:?}",
                                &parameter.name, schema
                            )
                        })?;

                        // special handling for types that need to be converted to strings
                        if type_ == "fiberplane_models::timestamps::Timestamp" {
                            parameter_name = format!("{parameter_name}.to_string()")
                        } else if type_ == "std::collections::HashMap<String, String>" {
                            parameter_name = format!("serde_json::to_string(&{parameter_name})?")
                        }
                    }

                    writeln!(
                        writer,
                        "        req = req.query(&[(\"{}\", {})]);",
                        parameter.name, parameter_name
                    )?;

                    if !parameter.required {
                        writeln!(writer, "    }}")?;
                    }
                }
                location => eprintln!("unknown `in`: {location}"),
            }
        }
    }

    writeln!(writer)?;
    // Request body
    if let Some(request_body) = &operation.request_body {
        match resolve(ResolveTarget::RequestBody(&Some(request_body)), components)? {
            Some(ResolvedReference::RequestBody(body)) => {
                if body.content.contains_key("application/json") {
                    writeln!(writer, "let req = req.json(&payload);")?;
                } else if body.content.contains_key("multipart/form-data") {
                    writeln!(writer, "let req = req.form(&payload);")?;
                } else if body.content.contains_key("application/octet-stream") {
                    writeln!(writer, "let req = req.body(payload);")?;
                } else {
                    eprintln!("Unsupported type(s): {:?}", body.content);
                }
            }
            Some(resolved) => bail!(
                "resolved to unexpected type {:?}, expected `RequestBody`",
                resolved
            ),
            None => write!(writer, "()")?,
        }
    }
    write!(writer, "")?;
    writeln!(writer)?;

    writeln!(writer)?;
    if array_response {
        write!(writer, "self.do_req_paged(req).await")?;
    } else {
        write!(writer, "self.do_req(req).await")?;
    }
    writeln!(writer)?;

    Ok(())
}

#[derive(Debug)]
enum ResponseType {
    Json,
    Text,
    None,
}

impl ResponseType {
    fn generate_response_part(&self) -> &'static str {
        match self {
            ResponseType::Json => {
                // newline, 8 intend, newline, 8 intend, 2x newline, 4 intend
                "\n        .json()\n        .await?;\n\n    Ok(response)"
            }
            ResponseType::Text => {
                // newline, 8 intend, newline, 8 intend, 2x newline, 4 intend
                "\n        .text()\n        .await?;\n\n    Ok(response)"
            }
            ResponseType::None => {
                // semicolon, 2x newline, 4 intend
                ";\n\n    Ok(())"
            }
        }
    }

    fn fallback_response_part() -> &'static str {
        // newline, 8 intend, newline, 8 intend, 2x newline, 4 intend
        "\n        .bytes()\n        .await?;\n\n    Ok(response)"
    }
}
