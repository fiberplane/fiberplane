use crate::timestamps::Timestamp;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumIter};
use typed_builder::TypedBuilder;

// this is not unused, it is used in the expansion of the `EnumIter` proc macro
#[allow(unused_imports)]
use strum::IntoEnumIterator;

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize, Display, EnumIter)]
#[cfg_attr(feature = "clap", derive(clap::ValueEnum))]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::webhooks")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
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

// required to be a specialized `impl TryInto` (cannot use the free impl using `From`)
// because only 0 and 1 are covered cases and std would have no idea how to handle that
#[allow(clippy::from_over_into)]
impl TryInto<WebhookCategory> for i16 {
    type Error = InvalidWebhookCategoryError;

    fn try_into(self) -> Result<WebhookCategory, Self::Error> {
        match self {
            0 => Ok(WebhookCategory::Ping),
            1 => Ok(WebhookCategory::FrontMatter),
            value => Err(InvalidWebhookCategoryError(value)),
        }
    }
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::webhooks")
)]
#[error("unknown value {0}, expected 0 (ping) or 1 (front_matter)")]
pub struct InvalidWebhookCategoryError(i16);

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

    /// Whether the last delivery was successful
    #[builder(default)]
    pub successful: bool,

    #[builder(default, setter(strip_option, into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub created_by: Option<Base64Uuid>,
    #[builder(setter(into))]
    pub created_at: Timestamp,
    #[builder(setter(into))]
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

    #[builder(default)]
    pub enabled: bool,
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
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status_text: Option<String>,

    #[builder(default, setter(into))]
    pub request_headers: String,
    #[builder(default, setter(into))]
    pub request_body: String,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub response_headers: Option<String>,
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub response_body: Option<String>,

    #[builder(setter(into))]
    pub sent_request_at: Timestamp,
    #[builder(default, setter(into, strip_option))]
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

    #[builder(setter(into))]
    pub timestamp: Timestamp,
}
