use crate::names::Name;
use crate::workspaces::AuthRole;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use typed_builder::TypedBuilder;

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::users")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    #[builder(setter(into))]
    pub email: String,

    #[builder(setter(into))]
    pub name: String,

    #[builder(setter(into))]
    pub default_workspace_id: Base64Uuid,

    pub default_workspace_name: Name,

    #[builder(default, setter(into))]
    pub roles: HashMap<Base64Uuid, AuthRole>,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::users")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum OidProvider {
    Google,
    Github,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::users")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct OidConnection {
    pub provider: OidProvider,
    pub linked: bool,
    /// The unique ID on the providers' site for the user, if linked
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sub: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::users")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct OidLinkupLocation {
    #[builder(setter(into))]
    pub location: String,
}
