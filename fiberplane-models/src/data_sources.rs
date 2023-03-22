use crate::{names::Name, providers::Error, timestamps::Timestamp};
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::collections::BTreeMap;
use strum_macros::Display;
use typed_builder::TypedBuilder;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct DataSource {
    /// Data source ID.
    #[builder(setter(into))]
    pub id: Base64Uuid,

    /// Name of the data source.
    ///
    /// Data source names do not need to be unique per workspace, but they are
    /// unique per proxy.
    pub name: Name,

    /// Optional name of the FPD instance through which requests to the data
    /// source should be proxied. This is `None` for direct data sources.
    #[builder(default, setter(strip_option))]
    pub proxy_name: Option<Name>,

    /// The type of provider used for querying the data source.
    #[builder(setter(into))]
    pub provider_type: String,

    /// Protocol version supported by the provider.
    #[builder(default)]
    #[serde(default)]
    pub protocol_version: u8,

    /// Optional human-friendly description of the data source.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Optional configuration for the data source. If the data source is
    /// proxied through an FPD instance, the config will not be exposed to
    /// outside clients.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub config: Option<Map<String, Value>>,

    /// The data source status as reported by the FPD instance. Will be `None`
    /// for direct data sources.
    #[builder(default, setter(strip_option))]
    #[serde(flatten, default, skip_serializing_if = "Option::is_none")]
    pub status: Option<DataSourceStatus>,

    /// Timestamp at which the data source was created.
    #[builder(setter(into))]
    pub created_at: Timestamp,

    /// Timestamp at which the data source or its config was last updated.
    #[builder(setter(into))]
    pub updated_at: Timestamp,
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

    #[serde(default)]
    pub protocol_version: u8,

    #[builder(default, setter(into, strip_option))]
    pub description: Option<String>,

    #[builder(default, setter(into))]
    pub config: Map<String, Value>,
}

#[derive(Debug, Default, Deserialize, Serialize, Clone, TypedBuilder)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateDataSource {
    #[builder(default, setter(into, strip_option))]
    pub description: Option<String>,

    #[builder(default, setter(into, strip_option))]
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
