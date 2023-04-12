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

impl From<&WebhookCategories> for i16 {
    fn from(value: &WebhookCategories) -> Self {
        match value {
            WebhookCategories::Ping => 0,
            WebhookCategories::FrontMatter => 1,
        }
    }
}

impl From<WebhookCategories> for i16 {
    fn from(value: WebhookCategories) -> Self {
        (&value).into()
    }
}

// required to be a specialized `impl` because only 0 and 1 are covered cases
impl Into<WebhookCategories> for i16 {
    fn into(self) -> WebhookCategories {
        match self {
            0 => WebhookCategories::Ping,
            1 => WebhookCategories::FrontMatter,
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
    pub events: Vec<WebhookCategories>,
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
    #[builder(default, setter(strip_option, into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub endpoint: Option<String>,
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub events: Option<Vec<WebhookCategories>>,
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub regenerate_shared_secret: Option<bool>,
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}
