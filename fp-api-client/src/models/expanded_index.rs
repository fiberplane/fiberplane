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
pub struct ExpandedIndex {
    #[serde(rename = "key")]
    pub key: String,
    #[serde(rename = "index")]
    pub index: f32,
}

impl ExpandedIndex {
    pub fn new(key: String, index: f32) -> ExpandedIndex {
        ExpandedIndex { key, index }
    }
}