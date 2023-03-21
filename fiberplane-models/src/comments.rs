use crate::{formatting::Formatting, timestamps::Timestamp};
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
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Thread {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    #[builder(default)]
    pub items: Vec<ThreadItem>,
    pub status: ThreadStatus,
    pub created_by: UserSummary,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum ThreadStatus {
    Open,
    Resolved,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ThreadSummary {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    pub item_count: u32,

    #[builder(default, setter(strip_option))]
    pub first_item: Option<ThreadItem>,

    /// These are sorted in chronological order so the last one is the most recent.
    #[builder(default)]
    #[serde(default)]
    pub recent_items: Vec<ThreadItem>,

    pub status: ThreadStatus,

    pub created_by: UserSummary,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ThreadItem {
    Comment(Comment),
    StatusChange(ThreadStatusChange),
    CommentDelete(CommentDelete),
}

impl ThreadItem {
    pub fn id(&self) -> Base64Uuid {
        match self {
            ThreadItem::Comment(item) => item.id,
            ThreadItem::StatusChange(item) => item.id,
            ThreadItem::CommentDelete(item) => item.id,
        }
    }

    pub fn created_at(&self) -> &OffsetDateTime {
        match self {
            ThreadItem::Comment(item) => &item.created_at,
            ThreadItem::StatusChange(item) => &item.created_at,
            ThreadItem::CommentDelete(item) => &item.created_at,
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ThreadStatusChange {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    pub status: ThreadStatus,

    pub created_by: UserSummary,

    #[builder(setter(into))]
    pub created_at: Timestamp,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct CommentDelete {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    pub created_by: UserSummary,

    /// Timestamp when the original comment was created.
    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub deleted_at: Timestamp,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Comment {
    #[builder(setter(into))]
    pub id: Base64Uuid,

    pub created_by: UserSummary,

    #[builder(setter(into))]
    pub content: String, // limit of 2048 characters

    #[builder(default)]
    pub formatting: Formatting,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UserSummary {
    #[builder(setter(into))]
    pub id: String,

    #[builder(setter(into))]
    pub name: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewComment {
    #[builder(default, setter(into, strip_option))]
    pub id: Option<Base64Uuid>,

    #[builder(setter(into))]
    pub content: String,

    #[builder(default)]
    #[serde(default)]
    pub formatting: Formatting,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateComment {
    #[builder(setter(into))]
    pub content: String,

    #[builder(default)]
    #[serde(default)]
    pub formatting: Formatting,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::comments")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewThread {
    #[builder(default, setter(into, strip_option))]
    pub id: Option<Base64Uuid>,

    #[builder(default, setter(into, strip_option))]
    pub referenced_cell_id: Option<Base64Uuid>,

    #[builder(default, setter(strip_option))]
    pub comment: Option<NewComment>,
}
