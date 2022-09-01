/*
 * Fiberplane API
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 *
 * Generated by: https://openapi-generator.tech
 */

///
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Serialize, Deserialize)]
pub enum TemplateParameterType {
    #[serde(rename = "string")]
    String,
    #[serde(rename = "number")]
    Number,
    #[serde(rename = "boolean")]
    Boolean,
    #[serde(rename = "object")]
    Object,
    #[serde(rename = "array")]
    Array,
    #[serde(rename = "unknown")]
    Unknown,
}

impl ToString for TemplateParameterType {
    fn to_string(&self) -> String {
        match self {
            Self::String => String::from("string"),
            Self::Number => String::from("number"),
            Self::Boolean => String::from("boolean"),
            Self::Object => String::from("object"),
            Self::Array => String::from("array"),
            Self::Unknown => String::from("unknown"),
        }
    }
}