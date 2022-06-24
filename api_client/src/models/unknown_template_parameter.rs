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
pub struct UnknownTemplateParameter {
    #[serde(rename = "name")]
    pub name: String,
    #[serde(rename = "type")]
    pub _type: crate::models::TemplateParameterType,
}

impl UnknownTemplateParameter {
    pub fn new(name: String, _type: crate::models::TemplateParameterType) -> UnknownTemplateParameter {
        UnknownTemplateParameter {
            name,
            _type,
        }
    }
}

