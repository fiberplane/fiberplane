use crate::timestamps::Timestamp;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use typed_builder::TypedBuilder;

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::webhooks")
)]
#[non_exhaustive]
#[serde(rename_all = "lowercase")]
pub enum WebhookCategories {
    Ping,
    FrontMatter,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::webhooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Webhook {
    pub id: Base64Uuid,
    pub workspace_id: Base64Uuid,
    pub endpoint: String,
    pub events: Vec<WebhookCategories>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub shared_secret: Option<String>,
    pub enabled: bool,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub created_by: Option<Base64Uuid>,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::webhooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewWebhook {
    pub endpoint: String,
    pub events: Vec<WebhookCategories>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::webhooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateWebhook {
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub endpoint: Option<String>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub events: Option<Vec<WebhookCategories>>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub regenerate_shared_secret: Option<bool>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}
