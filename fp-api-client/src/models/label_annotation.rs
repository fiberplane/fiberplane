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
pub struct LabelAnnotation {
    #[serde(rename = "type")]
    pub _type: crate::models::AnnotationType,
    #[serde(rename = "offset")]
    pub offset: i32,
    #[serde(rename = "key")]
    pub key: String,
    #[serde(rename = "value", skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}

impl LabelAnnotation {
    pub fn new(_type: crate::models::AnnotationType, offset: i32, key: String) -> LabelAnnotation {
        LabelAnnotation {
            _type,
            offset,
            key,
            value: None,
        }
    }
}