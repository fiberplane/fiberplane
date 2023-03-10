use crate::{names::Name, providers::Error};
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::collections::BTreeMap;
use strum_macros::Display;
use time::{serde::rfc3339, OffsetDateTime};
use typed_builder::TypedBuilder;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct DataSource {
    pub name: Name,
    #[builder(default)]
    pub proxy_name: Option<Name>,
    pub id: Base64Uuid,
    pub provider_type: String,
    #[builder(default)]
    #[serde(default)]
    pub protocol_version: u8,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub config: Option<Map<String, Value>>,
    #[builder(default)]
    #[serde(flatten, default, skip_serializing_if = "Option::is_none")]
    pub status: Option<DataSourceStatus>,
    #[builder(setter(into))]
    #[serde(with = "rfc3339")]
    pub created_at: OffsetDateTime,
    #[builder(setter(into))]
    #[serde(with = "rfc3339")]
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Display)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::data_sources")
)]
#[non_exhaustive]
#[serde(tag = "status", content = "error", rename_all = "snake_case")]
pub enum DataSourceStatus {
    Connected,
    Error(Error),
}

#[derive(Debug, Deserialize, Serialize, Clone, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct NewDataSource {
    pub name: Name,
    #[builder(setter(into))]
    pub provider_type: String,
    #[builder(default)]
    #[serde(default)]
    pub protocol_version: u8,
    #[builder(default, setter(into))]
    pub description: Option<String>,
    #[builder(default, setter(into))]
    pub config: Map<String, Value>,
}

#[derive(Debug, Deserialize, Serialize, Clone, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateDataSource {
    pub description: Option<String>,
    pub config: Option<Map<String, Value>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::data_sources")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SelectedDataSource {
    /// The name of the selected data source
    pub name: Name,

    /// If this is a proxy data source, the name of the proxy
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub proxy_name: Option<Name>,
}

pub type ProviderType = String;

/// This is a map from provider type to the selected data source for that type.
pub type SelectedDataSources = BTreeMap<ProviderType, SelectedDataSource>;

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;
    use serde_json::json;

    #[test]
    fn status_serialization() {
        let serialized = serde_json::to_value(&DataSourceStatus::Connected).unwrap();
        assert_eq!(serialized, json!({"status":"connected"}));

        assert_eq!(
            serde_json::to_value(&DataSourceStatus::Error(Error::NotFound)).unwrap(),
            json!({
                "status": "error",
                "error": {
                    "type": "not_found",
                }
            })
        );
    }
}
