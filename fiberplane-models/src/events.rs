use crate::timestamps::Timestamp;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
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
    /// Unique identifier associated with this event.
    #[builder(setter(into))]
    pub id: Base64Uuid,

    /// The title describing the event.
    #[builder(setter(into))]
    pub title: String,

    /// Labels associated with the event.
    #[builder(default, setter(into))]
    pub labels: HashMap<String, Option<String>>,

    /// The moment the event occurred.
    #[builder(setter(into))]
    pub occurrence_time: Timestamp,

    #[builder(setter(into))]
    pub created_at: Timestamp,

    #[builder(setter(into))]
    pub updated_at: Timestamp,
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

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub time: Option<Timestamp>,
}
