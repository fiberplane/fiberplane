#![forbid(unsafe_code)]
#![allow(unused_mut)]
#![allow(unused_variables)]
#![allow(unused_imports)]

use crate::clients::ApiClient;
use anyhow::{Context as _, Result};
use reqwest::Method;
use time::format_description::well_known::Rfc3339;

pub mod builder;
pub mod clients;

pub(crate) mod models {
    pub(crate) use fiberplane_models::blobs::*;
    pub(crate) use fiberplane_models::comments::*;
    pub(crate) use fiberplane_models::data_sources::*;
    pub(crate) use fiberplane_models::events::*;
    pub(crate) use fiberplane_models::files::*;
    pub(crate) use fiberplane_models::formatting::*;
    pub(crate) use fiberplane_models::labels::*;
    pub(crate) use fiberplane_models::names::*;
    pub(crate) use fiberplane_models::notebooks::operations::*;
    pub(crate) use fiberplane_models::notebooks::*;
    pub(crate) use fiberplane_models::proxies::*;
    pub(crate) use fiberplane_models::query_data::*;
    pub(crate) use fiberplane_models::realtime::*;
    pub(crate) use fiberplane_models::snippets::*;
    pub(crate) use fiberplane_models::sorting::*;
    pub(crate) use fiberplane_models::templates::*;
    pub(crate) use fiberplane_models::timestamps::*;
    pub(crate) use fiberplane_models::tokens::*;
    pub(crate) use fiberplane_models::users::*;
    pub(crate) use fiberplane_models::views::*;
    pub(crate) use fiberplane_models::workspaces::*;
}

/// Retrieves a comment from a discussion thread by comment ID
pub async fn comment_get(
    client: &ApiClient,
    comment_id: base64uuid::Base64Uuid,
) -> Result<models::Comment> {
    let mut builder = client.request(
        Method::GET,
        &format!("/api/comments/{commentId}", commentId = comment_id,),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a comment in a discussion thread by comment ID
pub async fn comment_delete(client: &ApiClient, comment_id: base64uuid::Base64Uuid) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!("/api/comments/{commentId}", commentId = comment_id,),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Updates a comment in a discussion thread by comment ID
pub async fn comment_update(
    client: &ApiClient,
    comment_id: base64uuid::Base64Uuid,
    payload: models::UpdateComment,
) -> Result<models::Comment> {
    let mut builder = client.request(
        Method::PATCH,
        &format!("/api/comments/{commentId}", commentId = comment_id,),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a event
pub async fn event_delete(client: &ApiClient, event_id: base64uuid::Base64Uuid) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!("/api/events/{event_id}", event_id = event_id,),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Deletes a pending workspace invitation
pub async fn workspace_invite_delete(
    client: &ApiClient,
    invitation_id: base64uuid::Base64Uuid,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/invitations/{invitation_id}",
            invitation_id = invitation_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Accepts the workspace invitation
pub async fn workspace_invite_accept(
    client: &ApiClient,
    invitation_id: base64uuid::Base64Uuid,
    invitation_secret: &str,
) -> Result<models::Workspace> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/invitations/{invitation_id}/{invitation_secret}/accept",
            invitation_id = invitation_id,
            invitation_secret = invitation_secret,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Declines the workspace invitation
pub async fn workspace_invite_decline(
    client: &ApiClient,
    invitation_id: base64uuid::Base64Uuid,
    invitation_secret: &str,
) -> Result<()> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/invitations/{invitation_id}/{invitation_secret}/decline",
            invitation_id = invitation_id,
            invitation_secret = invitation_secret,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Log out of Fiberplane
pub async fn logout(client: &ApiClient) -> Result<()> {
    let mut builder = client.request(Method::POST, "/api/logout")?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Retrieves a single notebook (both its metadata and content)
pub async fn notebook_get(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
) -> Result<models::Notebook> {
    let mut builder = client.request(
        Method::GET,
        &format!("/api/notebooks/{notebookId}", notebookId = notebook_id,),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a notebook
pub async fn notebook_delete(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!("/api/notebooks/{notebookId}", notebookId = notebook_id,),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Modifies individual properties of a single notebook
pub async fn notebook_update(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    payload: models::NotebookPatch,
) -> Result<()> {
    let mut builder = client.request(
        Method::PATCH,
        &format!("/api/notebooks/{notebookId}", notebookId = notebook_id,),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Append the given cells to the notebook. Any cells that have their ID missing will be set on the server.
pub async fn notebook_cells_append(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    after: Option<&str>,
    before: Option<&str>,
    payload: Vec<models::Cell>,
) -> Result<Vec<models::Cell>> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/notebooks/{notebookId}/cells",
            notebookId = notebook_id,
        ),
    )?;
    if let Some(after) = after {
        builder = builder.query(&[("after", after)]);
    }
    if let Some(before) = before {
        builder = builder.query(&[("before", before)]);
    }
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Append the given text and optional formatting to the specified cell
pub async fn notebook_cell_append_text(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    cell_id: &str,
    payload: models::CellAppendText,
) -> Result<models::Cell> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/notebooks/{notebookId}/cells/{cellId}/append",
            notebookId = notebook_id,
            cellId = cell_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Replace some text and formatting in the specified cell
pub async fn notebook_cell_replace_text(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    cell_id: &str,
    payload: models::CellReplaceText,
) -> Result<models::Cell> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/notebooks/{notebookId}/cells/{cellId}/replaceText",
            notebookId = notebook_id,
            cellId = cell_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Creates a copy of the specified notebook
pub async fn notebook_duplicate(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    payload: models::NotebookCopyDestination,
) -> Result<models::Notebook> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/notebooks/{notebookId}/duplicate",
            notebookId = notebook_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// upload a file
pub async fn file_upload(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    payload: models::UploadData,
) -> Result<models::FileSummary> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/notebooks/{notebookId}/files",
            notebookId = notebook_id,
        ),
    )?;
    builder = builder.form(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Get a file from a notebook
pub async fn file_get(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    file_id: &str,
) -> Result<bytes::Bytes> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/notebooks/{notebookId}/files/{fileId}",
            notebookId = notebook_id,
            fileId = file_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Delete a file from a notebook
pub async fn file_delete(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    file_id: &str,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/notebooks/{notebookId}/files/{fileId}",
            notebookId = notebook_id,
            fileId = file_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Deletes *all* front matter data for notebook. If you wish to delete a single key instead of the whole object, use the `patch` endpoint with value: `null`

pub async fn front_matter_delete(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/notebooks/{notebookId}/front_matter",
            notebookId = notebook_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Updates front matter for a given notebook
pub async fn front_matter_update(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    payload: models::FrontMatter,
) -> Result<()> {
    let mut builder = client.request(
        Method::PATCH,
        &format!(
            "/api/notebooks/{notebookId}/front_matter",
            notebookId = notebook_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Expand the snippet and insert the cells into the notebook
pub async fn notebook_snippet_insert(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    snippet_name: &fiberplane_models::names::Name,
    cell_id: Option<&str>,
) -> Result<Vec<models::Cell>> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/notebooks/{notebookId}/insert_snippet/{snippet_name}",
            notebookId = notebook_id,
            snippet_name = snippet_name,
        ),
    )?;
    if let Some(cell_id) = cell_id {
        builder = builder.query(&[("cell_id", cell_id)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Convert the notebook cells to a snippet
pub async fn notebook_convert_to_snippet(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    start_cell_id: Option<&str>,
    end_cell_id: Option<&str>,
) -> Result<String> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/notebooks/{notebookId}/snippet.jsonnet",
            notebookId = notebook_id,
        ),
    )?;
    if let Some(start_cell_id) = start_cell_id {
        builder = builder.query(&[("start_cell_id", start_cell_id)]);
    }
    if let Some(end_cell_id) = end_cell_id {
        builder = builder.query(&[("end_cell_id", end_cell_id)]);
    }
    let response = builder.send().await?.error_for_status()?.text().await?;

    Ok(response)
}

/// Downloads the specified notebooks as a Jsonnet template.
pub async fn notebook_convert_to_template(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
) -> Result<String> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/notebooks/{notebookId}/template.jsonnet",
            notebookId = notebook_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.text().await?;

    Ok(response)
}

/// List the threads in the given notebook
pub async fn threads_list(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    status: Option<models::ThreadStatus>,
) -> Result<Vec<models::ThreadSummary>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/notebooks/{notebookId}/threads",
            notebookId = notebook_id,
        ),
    )?;
    if let Some(status) = status {
        builder = builder.query(&[("status", status)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Creates a new comment thread in a notebook
pub async fn thread_create(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
    payload: models::NewThread,
) -> Result<models::Thread> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/notebooks/{notebookId}/threads",
            notebookId = notebook_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Start the Google OAuth flow to authenticate a user (used only with the Studio) for authenticating with the API see the Authentication section in the docs
pub async fn oidc_authorize_google(
    client: &ApiClient,
    cli_redirect_port: Option<i32>,
    redirect: Option<&str>,
) -> Result<()> {
    let mut builder = client.request(Method::GET, "/api/oidc/authorize/google")?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Pins a notebook
pub async fn pinned_notebook_create(
    client: &ApiClient,
    payload: models::NewPinnedNotebook,
) -> Result<()> {
    let mut builder = client.request(Method::POST, "/api/pinnednotebooks")?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Unpins a notebook
pub async fn pinned_notebook_delete(
    client: &ApiClient,
    notebook_id: base64uuid::Base64Uuid,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/pinnednotebooks/{notebookId}",
            notebookId = notebook_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Fetch the profile of the authenticated user
pub async fn profile_get(client: &ApiClient) -> Result<models::Profile> {
    let mut builder = client.request(Method::GET, "/api/profile")?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieve profile image
pub async fn profile_picture_get(client: &ApiClient) -> Result<bytes::Bytes> {
    let mut builder = client.request(Method::GET, "/api/profile/picture")?;
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Upload profile image
pub async fn profile_picture_update(
    client: &ApiClient,
    payload: models::ProfileUploadData,
) -> Result<()> {
    let mut builder = client.request(Method::POST, "/api/profile/picture")?;
    builder = builder.form(&payload);
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Retrieves a discussion thread by ID
pub async fn thread_get(
    client: &ApiClient,
    thread_id: base64uuid::Base64Uuid,
) -> Result<models::Thread> {
    let mut builder = client.request(
        Method::GET,
        &format!("/api/threads/{threadId}", threadId = thread_id,),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a discussion thread by ID
pub async fn thread_delete(client: &ApiClient, thread_id: base64uuid::Base64Uuid) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!("/api/threads/{threadId}", threadId = thread_id,),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Creates a comment in a discussion thread by ID
pub async fn comment_create(
    client: &ApiClient,
    thread_id: base64uuid::Base64Uuid,
    payload: models::NewComment,
) -> Result<models::Comment> {
    let mut builder = client.request(
        Method::POST,
        &format!("/api/threads/{threadId}/comments", threadId = thread_id,),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Reopens a discussion thread by ID
pub async fn thread_reopen(
    client: &ApiClient,
    thread_id: base64uuid::Base64Uuid,
) -> Result<models::Thread> {
    let mut builder = client.request(
        Method::POST,
        &format!("/api/threads/{threadId}/reopen", threadId = thread_id,),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Resolves a discussion thread by ID
pub async fn thread_resolve(
    client: &ApiClient,
    thread_id: base64uuid::Base64Uuid,
) -> Result<models::Thread> {
    let mut builder = client.request(
        Method::POST,
        &format!("/api/threads/{threadId}/resolve", threadId = thread_id,),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieves a list of all API tokens
pub async fn token_list(
    client: &ApiClient,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
    page: Option<i32>,
    limit: Option<i32>,
) -> Result<Vec<models::TokenSummary>> {
    let mut builder = client.request(Method::GET, "/api/tokens")?;
    if let Some(sort_by) = sort_by {
        builder = builder.query(&[("sort_by", sort_by)]);
    }
    if let Some(sort_direction) = sort_direction {
        builder = builder.query(&[("sort_direction", sort_direction)]);
    }
    if let Some(page) = page {
        builder = builder.query(&[("page", page)]);
    }
    if let Some(limit) = limit {
        builder = builder.query(&[("limit", limit)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Creates a new token
pub async fn token_create(client: &ApiClient, payload: models::NewToken) -> Result<models::Token> {
    let mut builder = client.request(Method::POST, "/api/tokens")?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a token
pub async fn token_delete(client: &ApiClient, id: base64uuid::Base64Uuid) -> Result<()> {
    let mut builder = client.request(Method::DELETE, &format!("/api/tokens/{id}", id = id,))?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Retrieves a trigger from a workspace by its ID
pub async fn trigger_get(
    client: &ApiClient,
    trigger_id: base64uuid::Base64Uuid,
) -> Result<models::Trigger> {
    let mut builder = client.request(
        Method::GET,
        &format!("/api/triggers/{triggerId}", triggerId = trigger_id,),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a trigger from a workspace by its ID
pub async fn trigger_delete(client: &ApiClient, trigger_id: base64uuid::Base64Uuid) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!("/api/triggers/{triggerId}", triggerId = trigger_id,),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Invoke a trigger to create a notebook from the associated template
pub async fn trigger_invoke(
    client: &ApiClient,
    trigger_id: base64uuid::Base64Uuid,
    secret_key: &str,
    payload: models::TemplateExpandPayload,
) -> Result<models::TriggerInvokeResponse> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/triggers/{triggerId}/{secretKey}",
            triggerId = trigger_id,
            secretKey = secret_key,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// List all workspaces authenticated user has access to
pub async fn workspace_list(
    client: &ApiClient,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
) -> Result<Vec<models::Workspace>> {
    let mut builder = client.request(Method::GET, "/api/workspaces")?;
    if let Some(sort_by) = sort_by {
        builder = builder.query(&[("sort_by", sort_by)]);
    }
    if let Some(sort_direction) = sort_direction {
        builder = builder.query(&[("sort_direction", sort_direction)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Creates a new workspace
pub async fn workspace_create(
    client: &ApiClient,
    payload: models::NewWorkspace,
) -> Result<models::Workspace> {
    let mut builder = client.request(Method::POST, "/api/workspaces")?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Get the workspace details
pub async fn workspace_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<models::Workspace> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Permanently deletes a specified workspace
pub async fn workspace_delete(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/workspaces/{workspace_id}",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Update workspace settings
pub async fn workspace_update(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::UpdateWorkspace,
) -> Result<models::Workspace> {
    let mut builder = client.request(
        Method::PATCH,
        &format!(
            "/api/workspaces/{workspace_id}",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Get all workspace data sources
pub async fn data_source_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<Vec<models::DataSource>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/data_sources",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Creates a workspace data source
pub async fn data_source_create(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewDataSource,
) -> Result<models::DataSource> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/data_sources",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Get the data source's details
pub async fn data_source_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    data_source_name: &fiberplane_models::names::Name,
) -> Result<models::DataSource> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/data_sources/{data_source_name}",
            workspace_id = workspace_id,
            data_source_name = data_source_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Delete a data source
pub async fn data_source_delete(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    data_source_name: &fiberplane_models::names::Name,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/workspaces/{workspace_id}/data_sources/{data_source_name}",
            workspace_id = workspace_id,
            data_source_name = data_source_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Update a data source
pub async fn data_source_update(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    data_source_name: &fiberplane_models::names::Name,
    payload: models::UpdateDataSource,
) -> Result<models::DataSource> {
    let mut builder = client.request(
        Method::PATCH,
        &format!(
            "/api/workspaces/{workspace_id}/data_sources/{data_source_name}",
            workspace_id = workspace_id,
            data_source_name = data_source_name,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Get a list of all events matching the query
pub async fn event_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    occurrence_time_start: time::OffsetDateTime,
    occurrence_time_end: time::OffsetDateTime,
    labels: Option<std::collections::HashMap<String, String>>,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
    page: Option<i32>,
    limit: Option<i32>,
) -> Result<Vec<models::Event>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/events",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.query(&[(
        "occurrence_time_start",
        occurrence_time_start.format(&Rfc3339)?,
    )]);
    builder = builder.query(&[("occurrence_time_end", occurrence_time_end.format(&Rfc3339)?)]);
    if let Some(labels) = labels {
        builder = builder.query(&[("labels", serde_json::to_string(&labels)?)]);
    }
    if let Some(sort_by) = sort_by {
        builder = builder.query(&[("sort_by", sort_by)]);
    }
    if let Some(sort_direction) = sort_direction {
        builder = builder.query(&[("sort_direction", sort_direction)]);
    }
    if let Some(page) = page {
        builder = builder.query(&[("page", page)]);
    }
    if let Some(limit) = limit {
        builder = builder.query(&[("limit", limit)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Creates a new event
pub async fn event_create(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewEvent,
) -> Result<models::Event> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/events",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieves a list of pending workspace invitations
pub async fn workspace_invite_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
    page: Option<i32>,
    limit: Option<i32>,
) -> Result<Vec<models::WorkspaceInvite>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/invitations",
            workspace_id = workspace_id,
        ),
    )?;
    if let Some(sort_by) = sort_by {
        builder = builder.query(&[("sort_by", sort_by)]);
    }
    if let Some(sort_direction) = sort_direction {
        builder = builder.query(&[("sort_direction", sort_direction)]);
    }
    if let Some(page) = page {
        builder = builder.query(&[("page", page)]);
    }
    if let Some(limit) = limit {
        builder = builder.query(&[("limit", limit)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Invites a user to a workspace
pub async fn workspace_invite(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewWorkspaceInvite,
) -> Result<models::WorkspaceInviteResponse> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/invitations",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieve all label keys
pub async fn label_keys_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    prefix: Option<&str>,
) -> Result<Vec<String>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/labels/keys",
            workspace_id = workspace_id,
        ),
    )?;
    if let Some(prefix) = prefix {
        builder = builder.query(&[("prefix", prefix)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieve all label values
pub async fn label_values_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    label_key: &str,
    prefix: Option<&str>,
) -> Result<Vec<String>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/labels/values/{label_key}",
            workspace_id = workspace_id,
            label_key = label_key,
        ),
    )?;
    if let Some(prefix) = prefix {
        builder = builder.query(&[("prefix", prefix)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Leaves a workspace
pub async fn workspace_leave(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<()> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/leave",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Retrieves all Notebooks available to the workspace
pub async fn notebook_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<Vec<models::NotebookSummary>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/notebooks",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Create a new notebook
pub async fn notebook_create(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewNotebook,
) -> Result<models::Notebook> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/notebooks",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieves a workspace image
pub async fn workspace_picture_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<bytes::Bytes> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/picture",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Uploads a workspace image
pub async fn workspace_picture_update(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::ProfileUploadData,
) -> Result<()> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/picture",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.form(&payload);
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Get all pinned views for the current user
pub async fn pinned_views_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<Vec<models::PinnedView>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/pinned_views",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Add an existing view to the pinned views list
pub async fn pinned_view_add(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::PinnedView,
) -> Result<()> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/pinned_views",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Remove view from the pinned views list
pub async fn pinned_view_remove(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    view_name: &fiberplane_models::names::Name,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/workspaces/{workspace_id}/pinned_views/{view_name}",
            workspace_id = workspace_id,
            view_name = view_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// List all pinned notebooks for a specific workspace
pub async fn pinned_notebook_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<Vec<models::NotebookSummary>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/pinnednotebooks",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// List all proxies
pub async fn proxy_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<Vec<models::ProxySummary>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/proxies",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Create a new proxy
pub async fn proxy_create(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewProxy,
) -> Result<models::Proxy> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/proxies",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieve a single proxy
pub async fn proxy_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    proxy_name: &fiberplane_models::names::Name,
) -> Result<models::Proxy> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/proxies/{proxy_name}",
            workspace_id = workspace_id,
            proxy_name = proxy_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a single proxy
pub async fn proxy_delete(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    proxy_name: &fiberplane_models::names::Name,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/workspaces/{workspace_id}/proxies/{proxy_name}",
            workspace_id = workspace_id,
            proxy_name = proxy_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Relays a query to invoke a provider on a remote proxy
pub async fn proxy_relay(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    proxy_name: &fiberplane_models::names::Name,
    data_source_name: &fiberplane_models::names::Name,
    provider_protocol_version: &str,
    payload: Vec<u8>,
) -> Result<bytes::Bytes> {
    let mut builder = client.request(
        Method::POST,
        &format!("/api/workspaces/{workspace_id}/proxies/{proxy_name}/data_sources/{data_source_name}/relay", workspace_id = workspace_id, proxy_name = proxy_name, data_source_name = data_source_name, )
    )?;
    builder = builder.body(payload);
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Relay a query to call 'get_config_schema' from a provider on a remote proxy
pub async fn proxy_config_schema(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    proxy_name: &fiberplane_models::names::Name,
    data_source_name: &fiberplane_models::names::Name,
) -> Result<bytes::Bytes> {
    let mut builder = client.request(
        Method::GET,
        &format!("/api/workspaces/{workspace_id}/proxies/{proxy_name}/data_sources/{data_source_name}/relay/v2/config_schema", workspace_id = workspace_id, proxy_name = proxy_name, data_source_name = data_source_name, )
    )?;
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Relay a query to call 'create_cells' from a provider on a remote proxy
pub async fn proxy_create_cells(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    proxy_name: &fiberplane_models::names::Name,
    data_source_name: &fiberplane_models::names::Name,
    payload: Vec<u8>,
) -> Result<bytes::Bytes> {
    let mut builder = client.request(
        Method::POST,
        &format!("/api/workspaces/{workspace_id}/proxies/{proxy_name}/data_sources/{data_source_name}/relay/v2/create_cells", workspace_id = workspace_id, proxy_name = proxy_name, data_source_name = data_source_name, )
    )?;
    builder = builder.body(payload);
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Relay a query to call 'extract_data' from a provider on a remote proxy
pub async fn proxy_extract_data(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    proxy_name: &fiberplane_models::names::Name,
    data_source_name: &fiberplane_models::names::Name,
    payload: Vec<u8>,
) -> Result<bytes::Bytes> {
    let mut builder = client.request(
        Method::POST,
        &format!("/api/workspaces/{workspace_id}/proxies/{proxy_name}/data_sources/{data_source_name}/relay/v2/extract_data", workspace_id = workspace_id, proxy_name = proxy_name, data_source_name = data_source_name, )
    )?;
    builder = builder.body(payload);
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Relays a query to invoke a provider on a remote proxy
pub async fn proxy_invoke(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    proxy_name: &fiberplane_models::names::Name,
    data_source_name: &fiberplane_models::names::Name,
    payload: Vec<u8>,
) -> Result<bytes::Bytes> {
    let mut builder = client.request(
        Method::POST,
        &format!("/api/workspaces/{workspace_id}/proxies/{proxy_name}/data_sources/{data_source_name}/relay/v2/invoke", workspace_id = workspace_id, proxy_name = proxy_name, data_source_name = data_source_name, )
    )?;
    builder = builder.body(payload);
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Relay a query to call 'get_supported_query_types' from a provider on a remote proxy
pub async fn proxy_supported_query_types(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    proxy_name: &fiberplane_models::names::Name,
    data_source_name: &fiberplane_models::names::Name,
) -> Result<bytes::Bytes> {
    let mut builder = client.request(
        Method::GET,
        &format!("/api/workspaces/{workspace_id}/proxies/{proxy_name}/data_sources/{data_source_name}/relay/v2/supported_query_types", workspace_id = workspace_id, proxy_name = proxy_name, data_source_name = data_source_name, )
    )?;
    let response = builder.send().await?.error_for_status()?.bytes().await?;

    Ok(response)
}

/// Search for notebooks
pub async fn notebook_search(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NotebookSearch,
) -> Result<Vec<models::NotebookSummary>> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/search/notebooks",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// List the snippets that have been uploaded
pub async fn snippet_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
) -> Result<Vec<models::SnippetSummary>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/snippets",
            workspace_id = workspace_id,
        ),
    )?;
    if let Some(sort_by) = sort_by {
        builder = builder.query(&[("sort_by", sort_by)]);
    }
    if let Some(sort_direction) = sort_direction {
        builder = builder.query(&[("sort_direction", sort_direction)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Create a new snippet
pub async fn snippet_create(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewSnippet,
) -> Result<models::Snippet> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/snippets",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieves a specified snippet from a workspace
pub async fn snippet_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    snippet_name: &fiberplane_models::names::Name,
) -> Result<models::Snippet> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/snippets/{snippet_name}",
            workspace_id = workspace_id,
            snippet_name = snippet_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a specified snippet from a workspace
pub async fn snippet_delete(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    snippet_name: &fiberplane_models::names::Name,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/workspaces/{workspace_id}/snippets/{snippet_name}",
            workspace_id = workspace_id,
            snippet_name = snippet_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Updates a specified snippet from a workspace
pub async fn snippet_update(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    snippet_name: &fiberplane_models::names::Name,
    payload: models::UpdateSnippet,
) -> Result<models::Snippet> {
    let mut builder = client.request(
        Method::PATCH,
        &format!(
            "/api/workspaces/{workspace_id}/snippets/{snippet_name}",
            workspace_id = workspace_id,
            snippet_name = snippet_name,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Expand the snippet and return the array of cells (without inserting them into a specific notebook)
pub async fn snippet_expand(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    snippet_name: &fiberplane_models::names::Name,
) -> Result<Vec<models::Cell>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/snippets/{snippet_name}/expand",
            workspace_id = workspace_id,
            snippet_name = snippet_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieve all the templates that have been uploaded
pub async fn template_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
) -> Result<Vec<models::TemplateSummary>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/templates",
            workspace_id = workspace_id,
        ),
    )?;
    if let Some(sort_by) = sort_by {
        builder = builder.query(&[("sort_by", sort_by)]);
    }
    if let Some(sort_direction) = sort_direction {
        builder = builder.query(&[("sort_direction", sort_direction)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Create a new template
pub async fn template_create(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewTemplate,
) -> Result<models::Template> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/templates",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieves a specified template
pub async fn template_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    template_name: &fiberplane_models::names::Name,
) -> Result<models::Template> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/templates/{templateName}",
            workspace_id = workspace_id,
            templateName = template_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes a specified template
pub async fn template_delete(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    template_name: &fiberplane_models::names::Name,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/workspaces/{workspace_id}/templates/{templateName}",
            workspace_id = workspace_id,
            templateName = template_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Updates a specified template
pub async fn template_update(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    template_name: &fiberplane_models::names::Name,
    payload: models::UpdateTemplate,
) -> Result<models::Template> {
    let mut builder = client.request(
        Method::PATCH,
        &format!(
            "/api/workspaces/{workspace_id}/templates/{templateName}",
            workspace_id = workspace_id,
            templateName = template_name,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Expand the template into a notebook
pub async fn template_expand(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    template_name: &fiberplane_models::names::Name,
    payload: models::TemplateExpandPayload,
) -> Result<models::Notebook> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/templates/{templateName}/expand",
            workspace_id = workspace_id,
            templateName = template_name,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// List all created triggers in the workspace
pub async fn trigger_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
) -> Result<Vec<models::Trigger>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/triggers",
            workspace_id = workspace_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Creates a new trigger for a template
pub async fn trigger_create(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewTrigger,
) -> Result<models::Trigger> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/triggers",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// List all users for a workspace
pub async fn workspace_users_list(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
) -> Result<Vec<models::Membership>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/users",
            workspace_id = workspace_id,
        ),
    )?;
    if let Some(sort_by) = sort_by {
        builder = builder.query(&[("sort_by", sort_by)]);
    }
    if let Some(sort_direction) = sort_direction {
        builder = builder.query(&[("sort_direction", sort_direction)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Removes a user from the workspace
pub async fn workspace_user_remove(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    user_id: base64uuid::Base64Uuid,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/workspaces/{workspace_id}/users/{user_id}",
            workspace_id = workspace_id,
            user_id = user_id,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Updates the user within a workspace
pub async fn workspace_user_update(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    user_id: base64uuid::Base64Uuid,
    payload: models::WorkspaceUserUpdate,
) -> Result<models::User> {
    let mut builder = client.request(
        Method::PATCH,
        &format!(
            "/api/workspaces/{workspace_id}/users/{user_id}",
            workspace_id = workspace_id,
            user_id = user_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieves all views
pub async fn views_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
    page: Option<i32>,
    limit: Option<i32>,
) -> Result<Vec<models::View>> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/views",
            workspace_id = workspace_id,
        ),
    )?;
    if let Some(sort_by) = sort_by {
        builder = builder.query(&[("sort_by", sort_by)]);
    }
    if let Some(sort_direction) = sort_direction {
        builder = builder.query(&[("sort_direction", sort_direction)]);
    }
    if let Some(page) = page {
        builder = builder.query(&[("page", page)]);
    }
    if let Some(limit) = limit {
        builder = builder.query(&[("limit", limit)]);
    }
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Creates a new view
pub async fn views_create(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    payload: models::NewView,
) -> Result<models::View> {
    let mut builder = client.request(
        Method::POST,
        &format!(
            "/api/workspaces/{workspace_id}/views",
            workspace_id = workspace_id,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Retrieves a single view
pub async fn view_get(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    view_name: &fiberplane_models::names::Name,
) -> Result<models::View> {
    let mut builder = client.request(
        Method::GET,
        &format!(
            "/api/workspaces/{workspace_id}/views/{view_name}",
            workspace_id = workspace_id,
            view_name = view_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}

/// Deletes an existing view
pub async fn view_delete(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    view_name: &fiberplane_models::names::Name,
) -> Result<()> {
    let mut builder = client.request(
        Method::DELETE,
        &format!(
            "/api/workspaces/{workspace_id}/views/{view_name}",
            workspace_id = workspace_id,
            view_name = view_name,
        ),
    )?;
    let response = builder.send().await?.error_for_status()?;

    Ok(())
}

/// Updates an existing view
pub async fn view_update(
    client: &ApiClient,
    workspace_id: base64uuid::Base64Uuid,
    view_name: &fiberplane_models::names::Name,
    payload: models::UpdateView,
) -> Result<models::View> {
    let mut builder = client.request(
        Method::PATCH,
        &format!(
            "/api/workspaces/{workspace_id}/views/{view_name}",
            workspace_id = workspace_id,
            view_name = view_name,
        ),
    )?;
    builder = builder.json(&payload);
    let response = builder.send().await?.error_for_status()?.json().await?;

    Ok(response)
}
