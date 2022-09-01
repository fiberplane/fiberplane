/*
 * Fiberplane API
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 *
 * Generated by: https://openapi-generator.tech
 */

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct DataSourceSummary {
    #[serde(rename = "name")]
    pub name: String,
    #[serde(rename = "type")]
    pub _type: crate::models::DataSourceType,
    #[serde(rename = "status")]
    pub status: crate::models::DataSourceConnectionStatus,
    #[serde(rename = "errorMessage", skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
}

impl DataSourceSummary {
    pub fn new(
        name: String,
        _type: crate::models::DataSourceType,
        status: crate::models::DataSourceConnectionStatus,
    ) -> DataSourceSummary {
        DataSourceSummary {
            name,
            _type,
            status,
            error_message: None,
        }
    }
}