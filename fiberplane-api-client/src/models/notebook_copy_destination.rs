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
pub struct NotebookCopyDestination {
    #[serde(rename = "title")]
    pub title: String,
    #[serde(rename = "workspaceId")]
    pub workspace_id: String,
}

impl NotebookCopyDestination {
    pub fn new(title: String, workspace_id: String) -> NotebookCopyDestination {
        NotebookCopyDestination {
            title,
            workspace_id,
        }
    }
}