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
pub enum WebhookCategory {
    Ping,
    FrontMatter,
}

impl From<&WebhookCategory> for i16 {
    fn from(value: &WebhookCategory) -> Self {
        match value {
            WebhookCategory::Ping => 0,
            WebhookCategory::FrontMatter => 1,
        }
    }
}

impl From<WebhookCategory> for i16 {
    fn from(value: WebhookCategory) -> Self {
        (&value).into()
    }
}

// required to be a specialized `impl` because only 0 and 1 are covered cases
impl Into<WebhookCategory> for i16 {
    fn into(self) -> WebhookCategory {
        match self {
            0 => WebhookCategory::Ping,
            1 => WebhookCategory::FrontMatter,
            value => panic!("unknown value {value}, expected 0 (ping) or 1 (frontmatter)"),
        }
    }
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
    #[builder(setter(into))]
    pub id: Base64Uuid,
    #[builder(setter(into))]
    pub workspace_id: Base64Uuid,
    #[builder(setter(into))]
    pub endpoint: String,
    pub events: Vec<WebhookCategory>,
    #[builder(default, setter(strip_option, into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub shared_secret: Option<String>,
    #[builder(default)]
    pub enabled: bool,
    #[builder(default, setter(strip_option, into))]
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
    #[builder(setter(into))]
    pub endpoint: String,
    pub events: Vec<WebhookCategory>,
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
    #[builder(default, setter(strip_option, into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub endpoint: Option<String>,
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub events: Option<Vec<WebhookCategory>>,
    #[builder(default)]
    #[serde(default)]
    pub regenerate_shared_secret: bool,
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::webhooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct WebhookDelivery {
    #[builder(setter(into))]
    pub id: Base64Uuid,
    #[builder(setter(into))]
    pub webhook_id: Base64Uuid,
    #[builder(setter(into))]
    pub event: String,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status_code: Option<i32>,
    #[builder(default, setter(strip_option, into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status_text: Option<String>,

    #[builder(default, setter(into))]
    pub request_headers: String,
    #[builder(default, setter(into))]
    pub request_body: String,

    #[builder(default, setter(strip_option, into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub response_headers: Option<String>,
    #[builder(default, setter(strip_option, into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub response_body: Option<String>,

    pub sent_request_at: Timestamp,
    #[builder(default, setter(strip_option, into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub received_response_at: Option<Timestamp>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::webhooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct WebhookDeliverySummary {
    #[builder(setter(into))]
    pub id: Base64Uuid,
    #[builder(setter(into))]
    pub event: String,
    pub successful: bool,
    pub timestamp: Timestamp,
}
