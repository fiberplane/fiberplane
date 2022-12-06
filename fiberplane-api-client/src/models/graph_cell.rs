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
pub struct GraphCell {
    #[serde(rename = "type")]
    pub _type: crate::models::CellType,
    #[serde(rename = "id")]
    pub id: String,
    #[serde(rename = "dataLinks")]
    pub data_links: Vec<String>,
    #[serde(rename = "graphType")]
    pub graph_type: GraphType,
    #[serde(rename = "readOnly", skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
    #[serde(rename = "stackingType")]
    pub stacking_type: StackingType,
}

impl GraphCell {
    pub fn new(
        _type: crate::models::CellType,
        id: String,
        data_links: Vec<String>,
        graph_type: GraphType,
        stacking_type: StackingType,
    ) -> GraphCell {
        GraphCell {
            _type,
            id,
            data_links,
            graph_type,
            read_only: None,
            stacking_type,
        }
    }
}

///
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Serialize, Deserialize)]
pub enum GraphType {
    #[serde(rename = "bar")]
    Bar,
    #[serde(rename = "line")]
    Line,
}
///
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Serialize, Deserialize)]
pub enum StackingType {
    #[serde(rename = "none")]
    None,
    #[serde(rename = "stacked")]
    Stacked,
    #[serde(rename = "percentage")]
    Percentage,
}