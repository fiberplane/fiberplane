use crate::comments::UserSummary;
use crate::data_sources::SelectedDataSources;
pub use crate::labels::Label;
use crate::timestamps::*;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::collections::HashMap;
use strum_macros::Display;
use time::OffsetDateTime;
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
pub type FrontMatter = Map<String, Value>;

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
    #[builder(default)]
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
    pub id: Base64Uuid,
    pub title: String,
    pub template_id: Base64Uuid,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, Display)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum NotebookVisibility {
    Private,
    Public,
}

impl Default for NotebookVisibility {
    fn default() -> Self {
        Self::Private
    }
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
    pub notebook_id: Base64Uuid,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Trigger {
    pub id: Base64Uuid,
    #[builder(setter(into))]
    pub title: String,
    pub template_id: Base64Uuid,
    #[builder(default, setter(into, strip_option))]
    pub secret_key: Option<String>,
    #[builder(default, setter(strip_option))]
    pub default_arguments: Option<Map<String, Value>>,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated_at: OffsetDateTime,
}

pub type TemplateExpandPayload = Map<String, Value>;

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TriggerInvokeResponse {
    pub notebook_title: String,
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
    pub id: Base64Uuid,
    pub workspace_id: Base64Uuid,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated_at: OffsetDateTime,
    pub title: String,
    pub visibility: NotebookVisibility,
    pub created_by: CreatedBy,
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
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub labels: Option<HashMap<String, Option<String>>>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relative_time: Option<RelativeTime>,
    #[builder(default)]
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
    pub id: Base64Uuid,
    pub name: Name,
    pub description: String,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated_at: OffsetDateTime,
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
    #[builder(setter(into))]
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

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateTemplate {
    #[builder(default, setter(into))]
    pub description: Option<String>,
    #[builder(default, setter(into))]
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
    pub before: Option<String>,

    /// Append the provided cells after this cell.
    /// If the cell is not found it will return a 400. This parameter cannot
    /// be used together with `before`.
    pub after: Option<String>,
}
