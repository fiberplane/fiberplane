use anyhow::{anyhow, bail, Result};
use convert_case::{Case, Casing};
use okapi::openapi3::{Components, Parameter, RefOr, RequestBody, Response};
use schemars::schema::{InstanceType, SchemaObject, SingleOrVec};
use std::borrow::Cow;

pub(crate) fn map_type<'a>(
    format: Option<&str>,
    instance_type: Option<&'a SingleOrVec<InstanceType>>,
    reference: Option<&'a str>,
    as_ref: bool,
) -> Result<Cow<'a, str>> {
    Ok(match format {
        Some("base64uuid") => "base64uuid::Base64Uuid".into(),
        Some("name") => {
            if as_ref {
                "&fiberplane_models::names::Name".into()
            } else {
                "fiberplane_models::names::Name".into()
            }
        }
        Some("int32") => "i32".into(),
        Some("int64") => "i64".into(),
        Some("float") => "f32".into(),
        Some("double") => "f64".into(),
        Some("byte") => "Vec<u8>".into(), // TODO: Deserialize from Base64
        Some("binary") => "Vec<u8>".into(),
        Some("date") | Some("date-time") => "fiberplane_models::timestamps::Timestamp".into(),
        Some("password") => "secrecy::SecretString".into(),
        Some(_) | None => {
            if let Some(SingleOrVec::Single(instance_type)) = &instance_type {
                match **instance_type {
                    InstanceType::Null => "()".into(),
                    InstanceType::Boolean => "bool".into(),
                    InstanceType::Object => "std::collections::HashMap<String, String>".into(),
                    InstanceType::Array => {
                        if let Some(reference) = reference {
                            format!("Vec<{}>", reference_name_to_models_path(reference)).into()
                        } else {
                            "Vec<serde_json::Value>".into()
                        }
                    }
                    InstanceType::Number => "i64".into(),
                    InstanceType::String => {
                        if as_ref {
                            "&str".into()
                        } else {
                            "String".into()
                        }
                    }
                    InstanceType::Integer => "i32".into(),
                }
            } else if let Some(reference) = reference {
                reference_name_to_models_path(reference).into()
            } else {
                bail!("Failed to write field. Unsupported instance_type and reference is None");
            }
        }
    })
}

pub(crate) fn reference_name_to_models_path(input: &str) -> String {
    if let Some((_, reference_name)) = input.rsplit_once('/') {
        format!("models::{}", reference_name.to_case(Case::Pascal))
    } else {
        format!("models::{}", input.to_case(Case::Pascal))
    }
}

pub(crate) enum ResolveTarget<'a> {
    Parameter(&'a Option<&'a RefOr<Parameter>>),
    Response(&'a Option<&'a RefOr<Response>>),
    RequestBody(&'a Option<&'a RefOr<RequestBody>>),
}

impl ResolveTarget<'_> {
    fn type_erase<T>(input: &RefOr<T>) -> RefOr<()> {
        match input {
            RefOr::Ref(reference) => RefOr::Ref(reference.clone()),
            RefOr::Object(_) => RefOr::Object(()),
        }
    }

    /// Returns inner type of this object, erasing the inner type of `RefOr`
    fn inner(&self) -> Option<RefOr<()>> {
        match self {
            ResolveTarget::Parameter(inner) => (*inner).map(Self::type_erase),
            ResolveTarget::Response(inner) => (*inner).map(Self::type_erase),
            ResolveTarget::RequestBody(inner) => (*inner).map(Self::type_erase),
        }
    }

    /// Clones the inner Parameter. Panics if `self` is not `Some(Parameter)`
    fn unpack_parameter(&self) -> Parameter {
        match self {
            ResolveTarget::Parameter(parameter) => {
                match parameter.expect("called `unpack_parameter` on Parameter(None)") {
                    RefOr::Ref(_) => panic!("called `unpack_parameter` on Parameter(Ref(..))"),
                    RefOr::Object(object) => object.clone(),
                }
            }
            ResolveTarget::Response(_) => panic!("called `unpack_parameter` on Response(..)"),
            ResolveTarget::RequestBody(_) => panic!("called `unpack_parameter` on RequestBody(..)"),
        }
    }

    /// Clones the inner Response. Panics if `self` is not `Some(Response)`
    fn unpack_responses(&self) -> Response {
        match self {
            ResolveTarget::Parameter(_) => panic!("called `unpack_responses` on Parameter(..)"),
            ResolveTarget::Response(responses) => {
                match responses.expect("called `unpack_responses` on Responses(None)") {
                    RefOr::Ref(_) => panic!("called `unpack_responses` on Responses(Ref(..))"),
                    RefOr::Object(object) => object.clone(),
                }
            }
            ResolveTarget::RequestBody(_) => panic!("called `unpack_responses` on RequestBody(..)"),
        }
    }

    /// Clones the inner RequestBody. Panics if `self` is not `Some(RequestBody)`
    fn unpack_request_body(&self) -> RequestBody {
        match self {
            ResolveTarget::Parameter(_) => panic!("called `unpack_request_body` on Parameter(..)"),
            ResolveTarget::Response(_) => panic!("called `unpack_request_body` on Response(..)"),
            ResolveTarget::RequestBody(request_body) => {
                match request_body.expect("called `unpack_request_body` on RequestBody(None)") {
                    RefOr::Ref(_) => panic!("called `unpack_request_body` on RequestBody(Ref(..))"),
                    RefOr::Object(object) => object.clone(),
                }
            }
        }
    }
}

pub(crate) fn resolve<'a>(
    input: ResolveTarget<'a>,
    components: &'a Components,
) -> Result<Option<ResolvedReference<'a>>> {
    Ok(match input.inner() {
        Some(RefOr::Ref(reference)) => resolve_reference(&reference.reference, components)?,
        Some(RefOr::Object(_)) => match input {
            ResolveTarget::Parameter(_) => Some(ResolvedReference::Parameter(Cow::Owned(
                input.unpack_parameter(),
            ))),
            ResolveTarget::Response(_) => Some(ResolvedReference::Responses(Cow::Owned(
                input.unpack_responses(),
            ))),
            ResolveTarget::RequestBody(_) => Some(ResolvedReference::RequestBody(Cow::Owned(
                input.unpack_request_body(),
            ))),
        },
        None => None,
    })
}

#[derive(Debug, Clone)]
pub(crate) enum ResolvedReference<'a> {
    Schema(Cow<'a, SchemaObject>),
    Parameter(Cow<'a, Parameter>),
    Responses(Cow<'a, Response>),
    RequestBody(Cow<'a, RequestBody>),
}

pub(crate) fn resolve_reference<'a>(
    reference: &str,
    components: &'a Components,
) -> Result<Option<ResolvedReference<'a>>> {
    // The first one is #, the second one is components
    let mut split = reference.split('/').skip(2);
    let component = split
        .next()
        .ok_or_else(|| anyhow!("no component name found in \"{}\"", reference))?;
    let name = split
        .next()
        .ok_or_else(|| anyhow!("no model name found in \"{}\"", reference))?;

    use ResolvedReference::*;
    match component {
        "schemas" => Ok(components
            .schemas
            .get(name)
            .map(|schema| Schema(Cow::Borrowed(schema)))),
        "parameters" => components.parameters.get(name).map_or_else(
            || Ok(None),
            |ref_or| match ref_or {
                RefOr::Ref(reference) => resolve_reference(&reference.reference, components),
                RefOr::Object(object) => Ok(Some(Parameter(Cow::Borrowed(object)))),
            },
        ),
        "responses" => components.responses.get(name).map_or_else(
            || Ok(None),
            |ref_or| match ref_or {
                RefOr::Ref(reference) => resolve_reference(&reference.reference, components),
                RefOr::Object(object) => Ok(Some(Responses(Cow::Borrowed(object)))),
            },
        ),
        "requestBody" => components.request_bodies.get(name).map_or_else(
            || Ok(None),
            |ref_or| match ref_or {
                RefOr::Ref(reference) => resolve_reference(&reference.reference, components),
                RefOr::Object(object) => Ok(Some(RequestBody(Cow::Borrowed(object)))),
            },
        ),
        _ => {
            println!("Unsupported component type {}", component);
            Ok(None)
        }
    }
}
