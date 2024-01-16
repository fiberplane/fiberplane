use crate::comments::UserSummary;
use crate::data_sources::SelectedDataSources;
use crate::front_matter_schemas::FrontMatterSchema;
pub use crate::labels::Label;
use crate::timestamps::*;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::collections::{BTreeMap, HashMap};
use strum_macros::Display;
use typed_builder::TypedBuilder;
use url::Url;

mod cells;
use crate::names::Name;
use crate::views::RelativeTime;
pub use cells::*;

pub mod operations;

/// A JSON object which may or may not contain well known keys.
/// More information in the [RFC](https://www.notion.so/fiberplane/RFC-58-Front-matter-Specialization-Front-matter-a9b3b51614ee48a19ec416c02a9fd647)
// this is on purpose a `Map<String, Value>` instead of a `Value` to disallow top level arrays
pub type FrontMatter = BTreeMap<String, Value>;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Notebook {
    #[builder(default, setter(into))]
    pub id: String,

    #[builder(default, setter(into))]
    pub workspace_id: Base64Uuid,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,

    pub time_range: TimeRange,

    #[builder(default, setter(into))]
    pub title: String,

    #[builder(default)]
    pub cells: Vec<Cell>,

    pub revision: u32,

    #[builder(default)]
    pub visibility: NotebookVisibility,

    #[builder(default)]
    pub read_only: bool,

    pub created_by: CreatedBy,

    #[builder(default)]
    #[serde(default)]
    pub selected_data_sources: SelectedDataSources,

    #[builder(default)]
    #[serde(default)]
    pub labels: Vec<Label>,

    #[builder(default)]
    #[serde(default)]
    pub front_matter: FrontMatter,

    #[builder(default)]
    #[serde(default)]
    pub front_matter_schema: FrontMatterSchema,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewNotebook {
    #[builder(setter(into))]
    pub title: String,

    #[builder(default)]
    pub cells: Vec<Cell>,

    #[builder(setter(into))]
    pub time_range: NewTimeRange,

    #[builder(default)]
    #[serde(default)]
    pub selected_data_sources: SelectedDataSources,

    #[builder(default)]
    #[serde(default)]
    pub labels: Vec<Label>,

    #[builder(default)]
    #[serde(default)]
    pub front_matter: FrontMatter,

    /// The "inline" front matter schema for the notebook.
    ///
    /// It will always be expanded first and have priority over anything defined in
    /// `front_matter_collections`. The keys in common will be ignored.
    #[builder(default)]
    #[serde(default)]
    pub front_matter_schema: FrontMatterSchema,

    /// A list of front matter schema names that exist in the target workspace.
    ///
    /// If `front_matter_collections` and `front_matter_schema` are both mentioned, then:
    /// - the `front_matter_schema` will be the first elements of the notebook front matter,
    /// - and keys from the named schema that already exist in `front_matter_schema` (or an earlier
    ///   entry in the list) will be ignored.
    #[builder(default)]
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub front_matter_collections: Vec<Name>,
}

impl From<Notebook> for NewNotebook {
    fn from(notebook: Notebook) -> Self {
        NewNotebook {
            title: notebook.title,
            cells: notebook.cells,
            time_range: notebook.time_range.into(),
            selected_data_sources: notebook.selected_data_sources,
            labels: notebook.labels,
            front_matter: notebook.front_matter,
            front_matter_schema: notebook.front_matter_schema,
            front_matter_collections: Vec::new(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum CreatedBy {
    User(UserSummary),
    Trigger(TriggerSummary),
    Onboarding,
    Unknown,
}

impl CreatedBy {
    pub fn name(&self) -> String {
        match self {
            CreatedBy::User(user) => user.name.clone(),
            CreatedBy::Trigger(trigger) => trigger.title.clone(),
            CreatedBy::Onboarding => "Onboarding".to_string(),
            CreatedBy::Unknown => String::from("Unknown"),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TriggerSummary {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    #[builder(setter(into))]
    pub title: String,

    #[builder(setter(into))]
    pub template_id: Base64Uuid,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, Deserialize, Serialize, Display)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum NotebookVisibility {
    #[default]
    Private,
    Public,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NotebookPatch {
    pub visibility: NotebookVisibility,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NotebookCopyDestination {
    #[builder(setter(into))]
    pub title: String,

    #[builder(setter(into))]
    pub workspace_id: Base64Uuid,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewPinnedNotebook {
    /// The ID of the notebook that is being pinned.
    #[builder(setter(into))]
    pub notebook_id: Base64Uuid,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Trigger {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    #[builder(setter(into))]
    pub title: String,

    #[builder(setter(into))]
    pub template_id: Base64Uuid,

    #[builder(default, setter(into, strip_option))]
    pub secret_key: Option<String>,

    #[builder(default, setter(into, strip_option))]
    pub default_arguments: Option<Map<String, Value>>,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

pub type TemplateExpandPayload = Map<String, Value>;

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TriggerInvokeResponse {
    #[builder(setter(into))]
    pub notebook_title: String,

    #[builder(setter(into))]
    pub notebook_id: Base64Uuid,

    pub notebook_url: Url,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NotebookSummary {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    #[builder(setter(into))]
    pub workspace_id: Base64Uuid,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,

    #[builder(setter(into))]
    pub title: String,

    pub visibility: NotebookVisibility,

    pub created_by: CreatedBy,

    #[builder(default)]
    pub labels: Vec<Label>,
}

/// Notebook search parameters
#[derive(Debug, Clone, Default, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NotebookSearch {
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub labels: Option<HashMap<String, Option<String>>>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relative_time: Option<RelativeTime>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub view: Option<Name>,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TemplateSummary {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    pub name: Name,

    #[builder(default, setter(into))]
    pub description: String,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewTemplate {
    pub name: Name,

    #[builder(default, setter(into))]
    pub description: String,

    #[builder(setter(into))]
    pub body: String,
}

impl NewTemplate {
    pub fn new(name: Name, description: impl Into<String>, body: impl Into<String>) -> Self {
        Self {
            name,
            description: description.into(),
            body: body.into(),
        }
    }
}

#[derive(Clone, Debug, Default, Eq, PartialEq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateTemplate {
    #[builder(default, setter(into, strip_option))]
    pub description: Option<String>,

    #[builder(default, setter(into, strip_option))]
    pub body: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewTrigger {
    #[builder(setter(into))]
    pub title: String,

    pub template_name: Name,

    #[builder(default, setter(into, strip_option))]
    pub default_arguments: Option<Map<String, Value>>,
}

#[derive(Debug, Default, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
/// The query string values that are associated with the notebook_cells_append
/// endpoint.
pub struct NotebookCellsAppendQuery {
    /// Append the provided cells before this cell.
    /// If the cell is not found it will return a 400. This parameter cannot
    /// be used together with `after`.
    #[builder(default, setter(into, strip_option))]
    pub before: Option<String>,

    /// Append the provided cells after this cell.
    /// If the cell is not found it will return a 400. This parameter cannot
    /// be used together with `before`.
    #[builder(default, setter(into, strip_option))]
    pub after: Option<String>,
}
