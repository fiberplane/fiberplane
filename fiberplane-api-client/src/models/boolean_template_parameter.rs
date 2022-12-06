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
pub struct BooleanTemplateParameter {
    #[serde(rename = "name")]
    pub name: String,
    #[serde(rename = "type")]
    pub _type: crate::models::TemplateParameterType,
    #[serde(rename = "defaultValue", skip_serializing_if = "Option::is_none")]
    pub default_value: Option<bool>,
}

impl BooleanTemplateParameter {
    pub fn new(
        name: String,
        _type: crate::models::TemplateParameterType,
    ) -> BooleanTemplateParameter {
        BooleanTemplateParameter {
            name,
            _type,
            default_value: None,
        }
    }
}