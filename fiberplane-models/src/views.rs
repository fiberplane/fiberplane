use crate::labels::Label;
use crate::names::Name;
use crate::sorting::{NotebookSortFields, Pagination, SortDirection, Sorting, ViewSortFields};
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use typed_builder::TypedBuilder;

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::views")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct View {
    pub id: Base64Uuid,

    pub name: Name,
    pub display_name: String,
    pub description: String,
    pub color: i16,

    pub labels: Vec<Label>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relative_time: Option<RelativeTime>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sort_by: Option<NotebookSortFields>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sort_direction: Option<SortDirection>,

    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated_at: OffsetDateTime,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ViewQuery {
    #[serde(flatten)]
    pub sort: Sorting<ViewSortFields>,
    #[serde(flatten)]
    pub pagination: Pagination,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::views")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewView {
    pub name: Name,
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    #[builder(setter(into))]
    pub description: String,
    #[builder(default)]
    pub color: i16,
    #[builder(default)]
    pub labels: Vec<Label>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relative_time: Option<RelativeTime>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sort_by: Option<NotebookSortFields>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sort_direction: Option<SortDirection>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::views")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateView {
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    #[builder(default, setter(into))]
    #[serde(
        default,
        deserialize_with = "crate::deserialize_some",
        skip_serializing_if = "Option::is_none"
    )]
    pub description: Option<Option<String>>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<i16>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub labels: Option<Vec<Label>>,
    #[builder(default)]
    #[serde(
        default,
        deserialize_with = "crate::deserialize_some",
        skip_serializing_if = "Option::is_none"
    )]
    pub relative_time: Option<Option<RelativeTime>>,
    #[builder(default)]
    #[serde(
        default,
        deserialize_with = "crate::deserialize_some",
        skip_serializing_if = "Option::is_none"
    )]
    pub sort_by: Option<Option<NotebookSortFields>>,
    #[builder(default)]
    #[serde(
        default,
        deserialize_with = "crate::deserialize_some",
        skip_serializing_if = "Option::is_none"
    )]
    pub sort_direction: Option<Option<SortDirection>>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::views")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct PinnedView {
    pub name: Name,
}

#[derive(Debug, Deserialize, PartialEq, Eq, Serialize, Copy, Clone)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::views")
)]
#[cfg_attr(feature = "sqlx", derive(sqlx::Type), sqlx(type_name = "time_unit"))]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub enum TimeUnit {
    Seconds,
    Minutes,
    Hours,
    Days,
}

#[derive(Debug, Deserialize, PartialEq, Eq, Serialize, Copy, Clone, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::views")
)]
#[cfg_attr(
    feature = "sqlx",
    derive(sqlx::Type),
    sqlx(type_name = "relative_time")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct RelativeTime {
    pub unit: TimeUnit,
    pub value: i64,
}
