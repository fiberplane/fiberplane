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
pub struct ImageCell {
    #[serde(rename = "type")]
    pub _type: crate::models::CellType,
    #[serde(rename = "url", skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(rename = "id")]
    pub id: String,
    #[serde(rename = "fileId", skip_serializing_if = "Option::is_none")]
    pub file_id: Option<String>,
    #[serde(rename = "progress", skip_serializing_if = "Option::is_none")]
    pub progress: Option<f32>,
    #[serde(rename = "readOnly", skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
    #[serde(rename = "width", skip_serializing_if = "Option::is_none")]
    pub width: Option<i32>,
    #[serde(rename = "height", skip_serializing_if = "Option::is_none")]
    pub height: Option<i32>,
    #[serde(rename = "preview", skip_serializing_if = "Option::is_none")]
    pub preview: Option<String>,
}

impl ImageCell {
    pub fn new(_type: crate::models::CellType, id: String) -> ImageCell {
        ImageCell {
            _type,
            url: None,
            id,
            file_id: None,
            progress: None,
            read_only: None,
            width: None,
            height: None,
            preview: None,
        }
    }
}

