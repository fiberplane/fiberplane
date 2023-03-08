#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use strum_macros::IntoStaticStr;
use typed_builder::TypedBuilder;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct Sorting<T: SortField> {
    #[serde(default = "T::default_sort_field")]
    pub sort_by: T,

    #[serde(default = "T::default_sort_direction")]
    pub sort_direction: SortDirection,
}

impl<T: SortField> Default for Sorting<T> {
    fn default() -> Self {
        Self {
            sort_by: T::default_sort_field(),
            sort_direction: T::default_sort_direction(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[cfg_attr(
    feature = "sqlx",
    derive(sqlx::Type),
    sqlx(type_name = "sort_direction")
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum SortDirection {
    Ascending,
    Descending,
}

impl SortDirection {
    #[inline]
    pub fn to_sql(&self) -> &'static str {
        match self {
            SortDirection::Ascending => "ASC",
            SortDirection::Descending => "DESC",
        }
    }
}

pub trait SortField {
    fn default_sort_field() -> Self;

    #[inline]
    fn default_sort_direction() -> SortDirection {
        SortDirection::Ascending
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
pub struct Pagination {
    #[serde(
        default = "Pagination::default_page",
        deserialize_with = "crate::deserialize_u32"
    )]
    pub page: u32,

    #[serde(
        default = "Pagination::default_limit",
        deserialize_with = "crate::deserialize_u32"
    )]
    pub limit: u32,
}

impl Pagination {
    #[inline]
    fn default_page() -> u32 {
        0
    }

    #[inline]
    fn default_limit() -> u32 {
        200
    }

    pub fn limit(&self) -> i64 {
        self.limit as i64
    }

    pub fn offset(&self) -> i64 {
        self.page as i64 * self.limit as i64
    }

    /// Create a pagination that effectively fetches every item from the
    /// database (since limit is set to the max value).
    pub fn max() -> Self {
        Self {
            page: 0,
            limit: u32::MAX,
        }
    }
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            page: Pagination::default_page(),
            limit: Pagination::default_limit(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum TemplateListSortFields {
    Name,
    CreatedAt,
    UpdatedAt,
}

impl TemplateListSortFields {
    #[inline]
    pub fn to_sql(&self) -> &'static str {
        match self {
            TemplateListSortFields::Name => "name",
            TemplateListSortFields::UpdatedAt => "updated_at",
            TemplateListSortFields::CreatedAt => "created_at",
        }
    }
}

impl SortField for TemplateListSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Name
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum SnippetListSortFields {
    Name,
    CreatedAt,
    UpdatedAt,
}

impl SnippetListSortFields {
    #[inline]
    pub fn to_sql(&self) -> &'static str {
        match self {
            SnippetListSortFields::Name => "name",
            SnippetListSortFields::UpdatedAt => "updated_at",
            SnippetListSortFields::CreatedAt => "created_at",
        }
    }
}

impl SortField for SnippetListSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Name
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum EventSortFields {
    Title,
    OccurrenceTime,
    CreatedAt,
    UpdatedAt,
}

impl EventSortFields {
    #[inline]
    pub fn to_sql(&self) -> &'static str {
        match self {
            EventSortFields::Title => "title",
            EventSortFields::OccurrenceTime => "occurrence_time",
            EventSortFields::UpdatedAt => "updated_at",
            EventSortFields::CreatedAt => "created_at",
        }
    }
}

impl SortField for EventSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::OccurrenceTime
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum TokenListSortFields {
    Title,
    CreatedAt,
    ExpiresAt,
}

impl TokenListSortFields {
    #[inline]
    pub fn to_sql(&self) -> &'static str {
        match self {
            TokenListSortFields::Title => "title",
            TokenListSortFields::CreatedAt => "created_at",
            TokenListSortFields::ExpiresAt => "expires_at",
        }
    }
}

impl SortField for TokenListSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Title
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum WorkspaceMembershipSortFields {
    Name,
    Email,
    JoinedAt,
}

impl WorkspaceMembershipSortFields {
    pub fn to_sql(&self, users_table_alias: &'static str) -> Cow<str> {
        match self {
            WorkspaceMembershipSortFields::Name => format!("{users_table_alias}.name").into(),
            WorkspaceMembershipSortFields::Email => format!("{users_table_alias}.email").into(),
            WorkspaceMembershipSortFields::JoinedAt => "created_at".into(),
        }
    }
}

impl SortField for WorkspaceMembershipSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Name
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum WorkspaceListingSortFields {
    Name,
    Type,
    JoinedAt,
}

impl WorkspaceListingSortFields {
    pub fn to_sql(&self) -> &'static str {
        match self {
            WorkspaceListingSortFields::Name => "name",
            WorkspaceListingSortFields::Type => "ty",
            WorkspaceListingSortFields::JoinedAt => "created_at",
        }
    }
}

impl SortField for WorkspaceListingSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Name
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum WorkspaceInviteListingSortFields {
    Id,
    Sender,
    Receiver,
    CreatedAt,
    ExpiresAt,
}

impl WorkspaceInviteListingSortFields {
    pub fn to_sql(&self) -> &'static str {
        match self {
            WorkspaceInviteListingSortFields::Id => "id",
            WorkspaceInviteListingSortFields::Sender => "sender",
            WorkspaceInviteListingSortFields::Receiver => "receiver",
            WorkspaceInviteListingSortFields::CreatedAt => "created_at",
            WorkspaceInviteListingSortFields::ExpiresAt => "expires_at",
        }
    }
}

impl SortField for WorkspaceInviteListingSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Id
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum ProxyListingSortFields {
    Id,
    Name,
    CreatedAt,
    UpdatedAt,
    Status,
}

impl ProxyListingSortFields {
    pub fn to_sql(&self) -> &'static str {
        match self {
            ProxyListingSortFields::Id => "id",
            ProxyListingSortFields::Name => "name",
            ProxyListingSortFields::CreatedAt => "created_at",
            ProxyListingSortFields::UpdatedAt => "updated_at",
            ProxyListingSortFields::Status => "status",
        }
    }
}

impl SortField for ProxyListingSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Name
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum DataSourceListingSortFields {
    Id,
    Name,
    ProxyName,
    CreatedAt,
    UpdatedAt,
    Status,
}

impl DataSourceListingSortFields {
    pub fn to_sql(&self) -> &'static str {
        match self {
            DataSourceListingSortFields::Id => "id",
            DataSourceListingSortFields::Name => "name",
            DataSourceListingSortFields::ProxyName => "proxy_name",
            DataSourceListingSortFields::CreatedAt => "created_at",
            DataSourceListingSortFields::UpdatedAt => "updated_at",
            DataSourceListingSortFields::Status => "status",
        }
    }
}

impl SortField for DataSourceListingSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::Name
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum ViewSortFields {
    Name,
    DisplayName,
    Description,
    Labels,
    CreatedAt,
    UpdatedAt,
}

impl ViewSortFields {
    #[inline]
    pub fn to_sql(&self) -> &'static str {
        match self {
            ViewSortFields::Name => "name",
            ViewSortFields::DisplayName => "display_name",
            ViewSortFields::Description => "description",
            ViewSortFields::Labels => "labels",
            ViewSortFields::CreatedAt => "created_at",
            ViewSortFields::UpdatedAt => "updated_at",
        }
    }
}

impl SortField for ViewSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::DisplayName
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, IntoStaticStr)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::sorting")
)]
#[cfg_attr(
    feature = "sqlx",
    derive(sqlx::Type),
    sqlx(type_name = "notebook_sort_fields")
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum NotebookSortFields {
    Title,
    CreatedAt,
    UpdatedAt,
}

impl NotebookSortFields {
    #[inline]
    pub fn to_sql(&self) -> &'static str {
        match self {
            NotebookSortFields::Title => "title",
            NotebookSortFields::CreatedAt => "created_at",
            NotebookSortFields::UpdatedAt => "updated_at",
        }
    }
}

impl SortField for NotebookSortFields {
    #[inline]
    fn default_sort_field() -> Self {
        Self::UpdatedAt
    }
}
