pub use crate::labels::Label;
use crate::names::Name;
use crate::timestamps::Timestamp;
use crate::{data_sources::SelectedDataSources, front_matter_schemas::FrontMatterSchema};
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use strum_macros::Display;
use typed_builder::TypedBuilder;

/// Workspace representation.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Workspace {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    pub name: Name,

    #[builder(setter(into))]
    pub display_name: String,

    #[serde(rename = "type")]
    pub ty: WorkspaceType,

    #[builder(setter(into))]
    pub owner_id: Base64Uuid,

    #[builder(default)]
    pub default_data_sources: SelectedDataSources,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,

    #[builder(default)]
    pub front_matter_schemas: BTreeMap<String, FrontMatterSchema>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Display)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceType {
    Personal,
    Organization,
}

/// Payload to be able to invite someone to a workspace.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewWorkspaceInvite {
    pub email: String,

    #[serde(default)]
    pub role: AuthRole,
}

impl NewWorkspaceInvite {
    pub fn new(email: impl Into<String>, role: AuthRole) -> Self {
        Self {
            email: email.into(),
            role,
        }
    }
}

/// Response received from create a new workspace endpoint.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceInviteResponse {
    #[builder(setter(into))]
    pub url: String,
}

/// Payload to create a new organization workspace.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewWorkspace {
    pub name: Name,

    /// The display name of the workspace. The `name` will be used if none is provided.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_data_sources: Option<SelectedDataSources>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub front_matter_schemas: Option<WorkspaceFrontMatterSchemas>,
}

impl NewWorkspace {
    pub fn new(name: Name) -> Self {
        Self {
            name,
            display_name: None,
            default_data_sources: None,
            front_matter_schemas: None,
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Default, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[serde(rename_all = "camelCase")]
#[non_exhaustive]
pub struct NewWorkspaceFrontMatterSchema {
    pub name: String,
    pub schema: FrontMatterSchema,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Default)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[repr(transparent)]
pub struct WorkspaceFrontMatterSchemas(pub BTreeMap<String, FrontMatterSchema>);

impl std::ops::Deref for WorkspaceFrontMatterSchemas {
    type Target = BTreeMap<String, FrontMatterSchema>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl std::ops::DerefMut for WorkspaceFrontMatterSchemas {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl From<BTreeMap<String, FrontMatterSchema>> for WorkspaceFrontMatterSchemas {
    fn from(value: BTreeMap<String, FrontMatterSchema>) -> Self {
        Self(value)
    }
}

impl FromIterator<(String, FrontMatterSchema)> for WorkspaceFrontMatterSchemas {
    fn from_iter<T: IntoIterator<Item = (String, FrontMatterSchema)>>(iter: T) -> Self {
        iter.into_iter()
            .collect::<BTreeMap<String, FrontMatterSchema>>()
            .into()
    }
}

/// Payload to update workspace settings
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateWorkspace {
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub owner: Option<Base64Uuid>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_data_sources: Option<SelectedDataSources>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub front_matter_schemas: Option<BTreeMap<String, FrontMatterSchema>>,
}

/// Payload to update a workspace members' role
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateWorkspaceUser {
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub role: Option<AuthRole>,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize, Display)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum AuthRole {
    #[strum(serialize = "Viewer")]
    Read,
    #[strum(serialize = "Editor")]
    Write,
    Admin,
}

impl Default for AuthRole {
    fn default() -> Self {
        Self::Write
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceInvite {
    /// ID of the invitation.
    #[builder(setter(into))]
    pub id: Base64Uuid,

    /// ID of the user who sent the invitation.
    #[builder(setter(into))]
    pub sender: Base64Uuid,

    /// Email address of the invitee.
    #[builder(setter(into))]
    pub receiver: String,

    /// Timestamp at which the invitation was created.
    #[builder(setter(into))]
    pub created_at: Timestamp,

    /// Timestamp at which the invitation expires.
    #[builder(setter(into))]
    pub expires_at: Timestamp,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::workspaces")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Membership {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    #[builder(setter(into))]
    pub email: String,

    #[builder(setter(into))]
    pub name: String,

    pub role: AuthRole,
}
