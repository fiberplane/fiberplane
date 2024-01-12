use crate::timestamps::Timestamp;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumIter};
use typed_builder::TypedBuilder;

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct IntegrationSummary {
    pub id: IntegrationId,
    pub status: IntegrationStatus,

    #[builder(setter(into))]
    pub created_at: Timestamp,
    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize, Display, EnumIter)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "lowercase")]
pub enum IntegrationId {
    GitHub,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Display, EnumIter)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::integrations")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum IntegrationStatus {
    Connected,
    Disconnected,
    AttentionRequired { reason: String },
}
