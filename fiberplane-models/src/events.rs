use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use time::OffsetDateTime;
use typed_builder::TypedBuilder;

#[derive(Clone, Deserialize, Eq, PartialEq, Serialize, Debug, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::events")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Event {
    /// Unique identifier associated with this event
    pub id: Base64Uuid,

    /// The title describing the event
    pub title: String,

    /// Labels associated with the event
    pub labels: HashMap<String, Option<String>>,

    /// The moment the event occurred
    #[serde(with = "time::serde::rfc3339")]
    pub occurrence_time: OffsetDateTime,

    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated_at: OffsetDateTime,
}

#[derive(Clone, Default, Deserialize, Eq, PartialEq, Serialize, Debug, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::events")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewEvent {
    #[builder(setter(into))]
    pub title: String,

    #[builder(default, setter(into, strip_option))]
    #[serde(default)]
    pub labels: Option<HashMap<String, Option<String>>>,

    #[builder(default, setter(into))]
    #[serde(default, with = "time::serde::rfc3339::option")]
    pub time: Option<OffsetDateTime>,
}
