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
pub struct Template {
    #[serde(rename = "id")]
    pub id: String,
    #[serde(rename = "title")]
    pub title: String,
    #[serde(rename = "description")]
    pub description: String,
    #[serde(rename = "body")]
    pub body: String,
    #[serde(rename = "parameters")]
    pub parameters: Vec<crate::models::TemplateParameter>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

impl Template {
    pub fn new(id: String, title: String, description: String, body: String, parameters: Vec<crate::models::TemplateParameter>, created_at: String, updated_at: String) -> Template {
        Template {
            id,
            title,
            description,
            body,
            parameters,
            created_at,
            updated_at,
        }
    }
}

