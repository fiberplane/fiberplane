#![forbid(unsafe_code)]
#![allow(clippy::too_many_arguments)]
#![allow(unused_mut)]
#![allow(unused_variables)]
#![allow(unused_imports)]

mod api_client;
pub mod builder;
pub mod clients;

use anyhow::{Context as _, Result};
pub use api_client::{ApiClient, ApiClientError};
use reqwest::Method;

pub(crate) mod models {
    pub(crate) use fiberplane_models::blobs::*;
    pub(crate) use fiberplane_models::comments::*;
    pub(crate) use fiberplane_models::data_sources::*;
    pub(crate) use fiberplane_models::errors::*;
    pub(crate) use fiberplane_models::events::*;
    pub(crate) use fiberplane_models::files::*;
    pub(crate) use fiberplane_models::formatting::*;
    pub(crate) use fiberplane_models::front_matter_schemas::*;
    pub(crate) use fiberplane_models::integrations::*;
    pub(crate) use fiberplane_models::labels::*;
    pub(crate) use fiberplane_models::names::*;
    pub(crate) use fiberplane_models::notebooks::front_matter::*;
    pub(crate) use fiberplane_models::notebooks::operations::*;
    pub(crate) use fiberplane_models::notebooks::*;
    pub(crate) use fiberplane_models::pagerduty::*;
    pub(crate) use fiberplane_models::paging::*;
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
    pub(crate) use fiberplane_models::webhooks::*;
    pub(crate) use fiberplane_models::workspaces::*;
}

impl ApiClient {
    #[doc = r#"Retrieves a comment from a discussion thread by comment ID"#]
    pub async fn comment_get(&self, comment_id: base64uuid::Base64Uuid) -> Result<models::Comment> {
        let mut builder = self.request(
            Method::GET,
            &format!("/api/comments/{commentId}", commentId = comment_id,),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a comment in a discussion thread by comment ID"#]
    pub async fn comment_delete(&self, comment_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!("/api/comments/{commentId}", commentId = comment_id,),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Updates a comment in a discussion thread by comment ID"#]
    pub async fn comment_update(
        &self,
        comment_id: base64uuid::Base64Uuid,
        payload: models::UpdateComment,
    ) -> Result<models::Comment> {
        let mut builder = self.request(
            Method::PATCH,
            &format!("/api/comments/{commentId}", commentId = comment_id,),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a event"#]
    pub async fn event_delete(&self, event_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!("/api/events/{eventId}", eventId = event_id,),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Deletes a pending workspace invitation"#]
    pub async fn workspace_invite_delete(
        &self,
        invitation_id: base64uuid::Base64Uuid,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/invitations/{invitationId}",
                invitationId = invitation_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Accepts the workspace invitation"#]
    pub async fn workspace_invite_accept(
        &self,
        invitation_id: base64uuid::Base64Uuid,
        invitation_secret: &str,
    ) -> Result<models::Workspace> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/invitations/{invitationId}/{invitationSecret}/accept",
                invitationId = invitation_id,
                invitationSecret = invitation_secret,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Declines the workspace invitation"#]
    pub async fn workspace_invite_decline(
        &self,
        invitation_id: base64uuid::Base64Uuid,
        invitation_secret: &str,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/invitations/{invitationId}/{invitationSecret}/decline",
                invitationId = invitation_id,
                invitationSecret = invitation_secret,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Log out of Fiberplane"#]
    pub async fn logout(&self) -> Result<()> {
        let mut builder = self.request(Method::POST, "/api/logout")?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Retrieves a single notebook (both its metadata and content)"#]
    pub async fn notebook_get(
        &self,
        notebook_id: base64uuid::Base64Uuid,
    ) -> Result<models::Notebook> {
        let mut builder = self.request(
            Method::GET,
            &format!("/api/notebooks/{notebookId}", notebookId = notebook_id,),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a notebook"#]
    pub async fn notebook_delete(&self, notebook_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!("/api/notebooks/{notebookId}", notebookId = notebook_id,),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Modifies individual properties of a single notebook"#]
    pub async fn notebook_update(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        payload: models::UpdateNotebook,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::PATCH,
            &format!("/api/notebooks/{notebookId}", notebookId = notebook_id,),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Append the given cells to the notebook. Any cells that have their ID missing will be set on the server."#]
    pub async fn notebook_cells_append(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        after: Option<&str>,
        before: Option<&str>,
        payload: Vec<models::Cell>,
    ) -> Result<Vec<models::Cell>> {
        let mut builder = self.request(
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

    #[doc = r#"Append the given text and optional formatting to the specified cell"#]
    pub async fn notebook_cell_append_text(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        cell_id: &str,
        payload: models::CellAppendText,
    ) -> Result<models::Cell> {
        let mut builder = self.request(
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

    #[doc = r#"Replace some text and formatting in the specified cell"#]
    pub async fn notebook_cell_replace_text(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        cell_id: &str,
        payload: models::CellReplaceText,
    ) -> Result<models::Cell> {
        let mut builder = self.request(
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

    #[doc = r#"Creates a copy of the specified notebook"#]
    pub async fn notebook_duplicate(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        payload: models::NotebookCopyDestination,
    ) -> Result<models::Notebook> {
        let mut builder = self.request(
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

    #[doc = r#"upload a file"#]
    pub async fn notebook_upload_file(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        payload: models::UploadData,
    ) -> Result<models::FileSummary> {
        let mut builder = self.request(
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

    #[doc = r#"Get a file from a notebook"#]
    pub async fn notebook_get_file(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        file_id: &str,
    ) -> Result<bytes::Bytes> {
        let mut builder = self.request(
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

    #[doc = r#"Delete a file from a notebook"#]
    pub async fn notebook_delete_file(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        file_id: &str,
    ) -> Result<()> {
        let mut builder = self.request(
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

    #[doc = r#"Adds rows to the front matter of a notebook.
If the requested position is out of bounds or is not specified, will append the rows to the existing front matter.
"#]
    pub async fn front_matter_add_keys(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        payload: models::FrontMatterAddRows,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/notebooks/{notebookId}/front_matter",
                notebookId = notebook_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Deletes *all* front matter data for notebook.
If you wish to delete a single key instead of the whole object, use the `patch` endpoint with value: `null`
"#]
    pub async fn front_matter_delete(&self, notebook_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/notebooks/{notebookId}/front_matter",
                notebookId = notebook_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Updates front matter for a given notebook"#]
    pub async fn front_matter_update(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        payload: models::FrontMatter,
    ) -> Result<()> {
        let mut builder = self.request(
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

    #[doc = r#"Deletes a row of the front matter for a notebook.
"#]
    pub async fn front_matter_delete_key(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        front_matter_key: &str,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/notebooks/{notebookId}/front_matter/{frontMatterKey}",
                notebookId = notebook_id,
                frontMatterKey = front_matter_key,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Updates a front matter row of a given notebook"#]
    pub async fn front_matter_update_key(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        front_matter_key: &str,
        payload: models::FrontMatterUpdateRow,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::PATCH,
            &format!(
                "/api/notebooks/{notebookId}/front_matter/{frontMatterKey}",
                notebookId = notebook_id,
                frontMatterKey = front_matter_key,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Expand the snippet and insert the cells into the notebook"#]
    pub async fn notebook_snippet_insert(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        snippet_name: &fiberplane_models::names::Name,
        cell_id: Option<&str>,
    ) -> Result<Vec<models::Cell>> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/notebooks/{notebookId}/insert_snippet/{snippetName}",
                notebookId = notebook_id,
                snippetName = snippet_name,
            ),
        )?;
        if let Some(cell_id) = cell_id {
            builder = builder.query(&[("cell_id", cell_id)]);
        }
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Convert the notebook cells to a snippet"#]
    pub async fn notebook_convert_to_snippet(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        start_cell_id: Option<&str>,
        end_cell_id: Option<&str>,
    ) -> Result<String> {
        let mut builder = self.request(
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

    #[doc = r#"Downloads the specified notebooks as a Jsonnet template."#]
    pub async fn notebook_convert_to_template(
        &self,
        notebook_id: base64uuid::Base64Uuid,
    ) -> Result<String> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/notebooks/{notebookId}/template.jsonnet",
                notebookId = notebook_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.text().await?;

        Ok(response)
    }

    #[doc = r#"List the threads in the given notebook"#]
    pub async fn threads_list(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        status: Option<models::ThreadStatus>,
    ) -> Result<Vec<models::ThreadSummary>> {
        let mut builder = self.request(
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

    #[doc = r#"Creates a new comment thread in a notebook"#]
    pub async fn thread_create(
        &self,
        notebook_id: base64uuid::Base64Uuid,
        payload: models::NewThread,
    ) -> Result<models::Thread> {
        let mut builder = self.request(
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

    #[doc = r#"Start the auth flow to authenticate a user (used only with the Studio).
For authenticating with the API see the Authentication section in the docs
"#]
    pub async fn oidc_authorize(
        &self,
        provider: &str,
        cli_redirect_port: Option<i32>,
        redirect: Option<&str>,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::GET,
            &format!("/api/oidc/authorize/{provider}", provider = provider,),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Start the auth flow for linking an existing Fiberplane account with a new OID identity (used only with the Studio).
For authenticating with the API see the Authentication section in the docs
"#]
    pub async fn oid_linkup(
        &self,
        provider: &str,
        cli_redirect_port: Option<i32>,
        redirect: Option<&str>,
    ) -> Result<models::OidLinkupLocation> {
        let mut builder = self.request(
            Method::POST,
            &format!("/api/oidc/linkup/{provider}", provider = provider,),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Pins a notebook"#]
    pub async fn pinned_notebook_create(&self, payload: models::NewPinnedNotebook) -> Result<()> {
        let mut builder = self.request(Method::POST, "/api/pinnednotebooks")?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Unpins a notebook"#]
    pub async fn pinned_notebook_delete(&self, notebook_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/pinnednotebooks/{notebookId}",
                notebookId = notebook_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Fetch the profile of the authenticated user"#]
    pub async fn profile_get(&self) -> Result<models::Profile> {
        let mut builder = self.request(Method::GET, "/api/profile")?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"List of all available providers and if they're linked to the current user"#]
    pub async fn oid_connections_list(&self) -> Result<Vec<models::OidConnection>> {
        let mut builder = self.request(Method::GET, "/api/profile/connections")?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Get a list of all integrations and their status for the current user"#]
    pub async fn integrations_get_by_user(
        &self,
    ) -> Result<Vec<models::PersonalIntegrationSummary>> {
        let mut builder = self.request(Method::GET, "/api/profile/integrations")?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve profile image"#]
    pub async fn profile_picture_get(&self) -> Result<bytes::Bytes> {
        let mut builder = self.request(Method::GET, "/api/profile/picture")?;
        let response = builder.send().await?.error_for_status()?.bytes().await?;

        Ok(response)
    }

    #[doc = r#"Upload profile image"#]
    pub async fn profile_picture_update(&self, payload: models::ProfileUploadData) -> Result<()> {
        let mut builder = self.request(Method::POST, "/api/profile/picture")?;
        builder = builder.form(&payload);
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Retrieves a discussion thread by ID"#]
    pub async fn thread_get(&self, thread_id: base64uuid::Base64Uuid) -> Result<models::Thread> {
        let mut builder = self.request(
            Method::GET,
            &format!("/api/threads/{threadId}", threadId = thread_id,),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a discussion thread by ID"#]
    pub async fn thread_delete(&self, thread_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!("/api/threads/{threadId}", threadId = thread_id,),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Creates a comment in a discussion thread by ID"#]
    pub async fn comment_create(
        &self,
        thread_id: base64uuid::Base64Uuid,
        payload: models::NewComment,
    ) -> Result<models::Comment> {
        let mut builder = self.request(
            Method::POST,
            &format!("/api/threads/{threadId}/comments", threadId = thread_id,),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Reopens a discussion thread by ID"#]
    pub async fn thread_reopen(&self, thread_id: base64uuid::Base64Uuid) -> Result<models::Thread> {
        let mut builder = self.request(
            Method::POST,
            &format!("/api/threads/{threadId}/reopen", threadId = thread_id,),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Resolves a discussion thread by ID"#]
    pub async fn thread_resolve(
        &self,
        thread_id: base64uuid::Base64Uuid,
    ) -> Result<models::Thread> {
        let mut builder = self.request(
            Method::POST,
            &format!("/api/threads/{threadId}/resolve", threadId = thread_id,),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieves a list of all API tokens"#]
    pub async fn token_list(
        &self,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
        page: Option<i32>,
        limit: Option<i32>,
    ) -> Result<Vec<models::TokenSummary>> {
        let mut builder = self.request(Method::GET, "/api/tokens")?;
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

    #[doc = r#"Creates a new token"#]
    pub async fn token_create(&self, payload: models::NewToken) -> Result<models::Token> {
        let mut builder = self.request(Method::POST, "/api/tokens")?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a token"#]
    pub async fn token_delete(&self, id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(Method::DELETE, &format!("/api/tokens/{id}", id = id,))?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Retrieves a trigger from a workspace by its ID"#]
    pub async fn trigger_get(&self, trigger_id: base64uuid::Base64Uuid) -> Result<models::Trigger> {
        let mut builder = self.request(
            Method::GET,
            &format!("/api/triggers/{triggerId}", triggerId = trigger_id,),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a trigger from a workspace by its ID"#]
    pub async fn trigger_delete(&self, trigger_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!("/api/triggers/{triggerId}", triggerId = trigger_id,),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Invoke a trigger to create a notebook from the associated template"#]
    pub async fn trigger_invoke(
        &self,
        trigger_id: base64uuid::Base64Uuid,
        secret_key: &str,
        payload: models::TemplateExpandPayload,
    ) -> Result<models::TriggerInvokeResponse> {
        let mut builder = self.request(
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

    #[doc = r#"List all workspaces authenticated user has access to"#]
    pub async fn workspace_list(
        &self,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
    ) -> Result<Vec<models::Workspace>> {
        let mut builder = self.request(Method::GET, "/api/workspaces")?;
        if let Some(sort_by) = sort_by {
            builder = builder.query(&[("sort_by", sort_by)]);
        }
        if let Some(sort_direction) = sort_direction {
            builder = builder.query(&[("sort_direction", sort_direction)]);
        }
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Creates a new workspace"#]
    pub async fn workspace_create(
        &self,
        payload: models::NewWorkspace,
    ) -> Result<models::Workspace> {
        let mut builder = self.request(Method::POST, "/api/workspaces")?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Get the workspace details"#]
    pub async fn workspace_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<models::Workspace> {
        let mut builder = self.request(
            Method::GET,
            &format!("/api/workspaces/{workspaceId}", workspaceId = workspace_id,),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Permanently deletes a specified workspace"#]
    pub async fn workspace_delete(&self, workspace_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!("/api/workspaces/{workspaceId}", workspaceId = workspace_id,),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Update workspace settings"#]
    pub async fn workspace_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::UpdateWorkspace,
    ) -> Result<models::Workspace> {
        let mut builder = self.request(
            Method::PATCH,
            &format!("/api/workspaces/{workspaceId}", workspaceId = workspace_id,),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Get all workspace data sources"#]
    pub async fn data_source_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<Vec<models::DataSource>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/data_sources",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Creates a workspace data source"#]
    pub async fn data_source_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewDataSource,
    ) -> Result<models::DataSource> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/data_sources",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Get the data source's details"#]
    pub async fn data_source_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        data_source_name: &fiberplane_models::names::Name,
    ) -> Result<models::DataSource> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/data_sources/{dataSourceName}",
                workspaceId = workspace_id,
                dataSourceName = data_source_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Delete a data source"#]
    pub async fn data_source_delete(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        data_source_name: &fiberplane_models::names::Name,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/data_sources/{dataSourceName}",
                workspaceId = workspace_id,
                dataSourceName = data_source_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Update a data source"#]
    pub async fn data_source_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        data_source_name: &fiberplane_models::names::Name,
        payload: models::UpdateDataSource,
    ) -> Result<models::DataSource> {
        let mut builder = self.request(
            Method::PATCH,
            &format!(
                "/api/workspaces/{workspaceId}/data_sources/{dataSourceName}",
                workspaceId = workspace_id,
                dataSourceName = data_source_name,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Get a list of all events matching the query"#]
    pub async fn event_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        occurrence_time_start: fiberplane_models::timestamps::Timestamp,
        occurrence_time_end: fiberplane_models::timestamps::Timestamp,
        labels: Option<std::collections::HashMap<String, String>>,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
        page: Option<i32>,
        limit: Option<i32>,
    ) -> Result<Vec<models::Event>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/events",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.query(&[("occurrence_time_start", occurrence_time_start.to_string())]);
        builder = builder.query(&[("occurrence_time_end", occurrence_time_end.to_string())]);
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

    #[doc = r#"Creates a new event"#]
    pub async fn event_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewEvent,
    ) -> Result<models::Event> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/events",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve all front matter schemas defined in the workspace"#]
    pub async fn workspace_front_matter_schema_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<models::WorkspaceFrontMatterSchemas> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/front_matter_schemas",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve a front matter schema defined in the workspace"#]
    pub async fn workspace_front_matter_schema_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewWorkspaceFrontMatterSchema,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/front_matter_schemas",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Retrieve a front matter schema defined in the workspace"#]
    pub async fn workspace_front_matter_schema_get_by_name(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        front_matter_schema_name: &str,
    ) -> Result<models::FrontMatterSchema> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/front_matter_schemas/{frontMatterSchemaName}",
                workspaceId = workspace_id,
                frontMatterSchemaName = front_matter_schema_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Delete a front matter schema defined in the workspace"#]
    pub async fn workspace_front_matter_schema_delete(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        front_matter_schema_name: &str,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/front_matter_schemas/{frontMatterSchemaName}",
                workspaceId = workspace_id,
                frontMatterSchemaName = front_matter_schema_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Get a list of al integrations and their status for the specified workspace"#]
    pub async fn integrations_get_by_workspace(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<Vec<models::WorkspaceIntegrationSummary>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/integrations",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Get details about the GitHub app integration"#]
    pub async fn integrations_github_app_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<models::GitHubAppDetails, ApiClientError<models::GitHubAppDetailsError>> {
        let path = &format!(
            "/api/workspaces/{workspaceId}/integrations/github",
            workspaceId = workspace_id,
        );
        let mut req = self.request(Method::GET, path)?;

        self.do_req(req).await
    }

    #[doc = r#"Install GitHub app to the current workspace"#]
    pub async fn integrations_github_app_install(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<(), ApiClientError<models::GitHubAppInstallFlowError>> {
        let path = &format!(
            "/api/workspaces/{workspaceId}/integrations/github/install",
            workspaceId = workspace_id,
        );
        let mut req = self.request(Method::GET, path)?;

        self.do_req(req).await
    }

    #[doc = r#"Uninstall GitHub app on the current workspace"#]
    pub async fn integrations_github_app_uninstall(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<(), ApiClientError<models::GitHubAppUninstallError>> {
        let path = &format!(
            "/api/workspaces/{workspaceId}/integrations/github/uninstall",
            workspaceId = workspace_id,
        );
        let mut req = self.request(Method::GET, path)?;

        self.do_req(req).await
    }

    #[doc = r#"Retrieves a list of pending workspace invitations"#]
    pub async fn workspace_invite_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
        page: Option<i32>,
        limit: Option<i32>,
    ) -> Result<Vec<models::WorkspaceInvite>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/invitations",
                workspaceId = workspace_id,
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

    #[doc = r#"Invites a user to a workspace"#]
    pub async fn workspace_invite_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewWorkspaceInvite,
    ) -> Result<models::WorkspaceInviteResponse> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/invitations",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve all label keys"#]
    pub async fn label_keys_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        prefix: Option<&str>,
    ) -> Result<Vec<String>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/labels/keys",
                workspaceId = workspace_id,
            ),
        )?;
        if let Some(prefix) = prefix {
            builder = builder.query(&[("prefix", prefix)]);
        }
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve all label values"#]
    pub async fn label_values_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        label_key: &str,
        prefix: Option<&str>,
    ) -> Result<Vec<String>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/labels/values/{labelKey}",
                workspaceId = workspace_id,
                labelKey = label_key,
            ),
        )?;
        if let Some(prefix) = prefix {
            builder = builder.query(&[("prefix", prefix)]);
        }
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Leaves a workspace"#]
    pub async fn workspace_leave(&self, workspace_id: base64uuid::Base64Uuid) -> Result<()> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/leave",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Retrieves all Notebooks available to the workspace"#]
    pub async fn notebook_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<Vec<models::NotebookSummary>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/notebooks",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Create a new notebook"#]
    pub async fn notebook_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewNotebook,
    ) -> Result<models::Notebook> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/notebooks",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"TODO"#]
    pub async fn pagerduty_receiver_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        page: Option<i32>,
        limit: Option<i32>,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
    ) -> Result<
        models::PagedVec<models::PagerDutyReceiver>,
        ApiClientError<models::PagerDutyReceiverListError>,
    > {
        let path = &format!(
            "/api/workspaces/{workspaceId}/pagerduty/receivers",
            workspaceId = workspace_id,
        );
        let mut req = self.request(Method::GET, path)?;

        if let Some(page) = page {
            req = req.query(&[("page", page)]);
        }
        if let Some(limit) = limit {
            req = req.query(&[("limit", limit)]);
        }
        if let Some(sort_by) = sort_by {
            req = req.query(&[("sort_by", sort_by)]);
        }
        if let Some(sort_direction) = sort_direction {
            req = req.query(&[("sort_direction", sort_direction)]);
        }

        self.do_req_paged(req).await
    }

    #[doc = r#"TODO"#]
    pub async fn pagerduty_receiver_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        pager_duty_receiver_name: &fiberplane_models::names::Name,
    ) -> Result<models::PagerDutyReceiver, ApiClientError<models::PagerDutyReceiverGetError>> {
        let path = &format!(
            "/api/workspaces/{workspaceId}/pagerduty/receivers/{pagerDutyReceiverName}",
            workspaceId = workspace_id,
            pagerDutyReceiverName = pager_duty_receiver_name,
        );
        let mut req = self.request(Method::GET, path)?;

        self.do_req(req).await
    }

    #[doc = r#"TODO"#]
    pub async fn pagerduty_receiver_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        pager_duty_receiver_name: &fiberplane_models::names::Name,
        payload: models::NewPagerDutyReceiver,
    ) -> Result<models::PagerDutyReceiver, ApiClientError<models::PagerDutyReceiverCreateError>>
    {
        let path = &format!(
            "/api/workspaces/{workspaceId}/pagerduty/receivers/{pagerDutyReceiverName}",
            workspaceId = workspace_id,
            pagerDutyReceiverName = pager_duty_receiver_name,
        );
        let mut req = self.request(Method::POST, path)?;

        let req = req.json(&payload);

        self.do_req(req).await
    }

    #[doc = r#"TODO"#]
    pub async fn pagerduty_receiver_delete(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        pager_duty_receiver_name: &fiberplane_models::names::Name,
    ) -> Result<(), ApiClientError<models::PagerDutyReceiverDeleteError>> {
        let path = &format!(
            "/api/workspaces/{workspaceId}/pagerduty/receivers/{pagerDutyReceiverName}",
            workspaceId = workspace_id,
            pagerDutyReceiverName = pager_duty_receiver_name,
        );
        let mut req = self.request(Method::DELETE, path)?;

        self.do_req(req).await
    }

    #[doc = r#"TODO"#]
    pub async fn pagerduty_receiver_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        pager_duty_receiver_name: &fiberplane_models::names::Name,
        payload: models::UpdatePagerDutyReceiver,
    ) -> Result<models::PagerDutyReceiver, ApiClientError<models::PagerDutyReceiverUpdateError>>
    {
        let path = &format!(
            "/api/workspaces/{workspaceId}/pagerduty/receivers/{pagerDutyReceiverName}",
            workspaceId = workspace_id,
            pagerDutyReceiverName = pager_duty_receiver_name,
        );
        let mut req = self.request(Method::PATCH, path)?;

        let req = req.json(&payload);

        self.do_req(req).await
    }

    #[doc = r#"Retrieves a workspace image"#]
    pub async fn workspace_picture_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<bytes::Bytes> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/picture",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.bytes().await?;

        Ok(response)
    }

    #[doc = r#"Uploads a workspace image"#]
    pub async fn workspace_picture_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::ProfileUploadData,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/picture",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.form(&payload);
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Get all pinned views for the current user"#]
    pub async fn pinned_view_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<Vec<models::View>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/pinned_views",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Add an existing view to the pinned views list"#]
    pub async fn pinned_view_add(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::PinnedView,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/pinned_views",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Remove view from the pinned views list"#]
    pub async fn pinned_view_remove(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        view_name: &fiberplane_models::names::Name,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/pinned_views/{viewName}",
                workspaceId = workspace_id,
                viewName = view_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"List all pinned notebooks for a specific workspace"#]
    pub async fn pinned_notebook_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<Vec<models::NotebookSummary>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/pinnednotebooks",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"List all proxies"#]
    pub async fn proxy_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<Vec<models::ProxySummary>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/proxies",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Create a new proxy"#]
    pub async fn proxy_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewProxy,
    ) -> Result<models::Proxy> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/proxies",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve a single proxy"#]
    pub async fn proxy_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        proxy_name: &fiberplane_models::names::Name,
    ) -> Result<models::Proxy> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/proxies/{proxyName}",
                workspaceId = workspace_id,
                proxyName = proxy_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a single proxy"#]
    pub async fn proxy_delete(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        proxy_name: &fiberplane_models::names::Name,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/proxies/{proxyName}",
                workspaceId = workspace_id,
                proxyName = proxy_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Relays a query to invoke a provider on a remote proxy"#]
    pub async fn proxy_relay(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        proxy_name: &fiberplane_models::names::Name,
        data_source_name: &fiberplane_models::names::Name,
        provider_protocol_version: &str,
        payload: Vec<u8>,
    ) -> Result<bytes::Bytes> {
        let mut builder = self.request(
        Method::POST,
        &format!("/api/workspaces/{workspaceId}/proxies/{proxyName}/data_sources/{dataSourceName}/relay", workspaceId = workspace_id, proxyName = proxy_name, dataSourceName = data_source_name, )
    )?;
        builder = builder.body(payload);
        let response = builder.send().await?.error_for_status()?.bytes().await?;

        Ok(response)
    }

    #[doc = r#"Relay a query to call 'get_config_schema' from a provider on a remote proxy"#]
    pub async fn proxy_config_schema(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        proxy_name: &fiberplane_models::names::Name,
        data_source_name: &fiberplane_models::names::Name,
    ) -> Result<bytes::Bytes> {
        let mut builder = self.request(
        Method::GET,
        &format!("/api/workspaces/{workspaceId}/proxies/{proxyName}/data_sources/{dataSourceName}/relay/v2/config_schema", workspaceId = workspace_id, proxyName = proxy_name, dataSourceName = data_source_name, )
    )?;
        let response = builder.send().await?.error_for_status()?.bytes().await?;

        Ok(response)
    }

    #[doc = r#"Relay a query to call 'create_cells' from a provider on a remote proxy"#]
    pub async fn proxy_create_cells(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        proxy_name: &fiberplane_models::names::Name,
        data_source_name: &fiberplane_models::names::Name,
        payload: Vec<u8>,
    ) -> Result<bytes::Bytes> {
        let mut builder = self.request(
        Method::POST,
        &format!("/api/workspaces/{workspaceId}/proxies/{proxyName}/data_sources/{dataSourceName}/relay/v2/create_cells", workspaceId = workspace_id, proxyName = proxy_name, dataSourceName = data_source_name, )
    )?;
        builder = builder.body(payload);
        let response = builder.send().await?.error_for_status()?.bytes().await?;

        Ok(response)
    }

    #[doc = r#"Relay a query to call 'extract_data' from a provider on a remote proxy"#]
    pub async fn proxy_extract_data(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        proxy_name: &fiberplane_models::names::Name,
        data_source_name: &fiberplane_models::names::Name,
        payload: Vec<u8>,
    ) -> Result<bytes::Bytes> {
        let mut builder = self.request(
        Method::POST,
        &format!("/api/workspaces/{workspaceId}/proxies/{proxyName}/data_sources/{dataSourceName}/relay/v2/extract_data", workspaceId = workspace_id, proxyName = proxy_name, dataSourceName = data_source_name, )
    )?;
        builder = builder.body(payload);
        let response = builder.send().await?.error_for_status()?.bytes().await?;

        Ok(response)
    }

    #[doc = r#"Relays a query to invoke a provider on a remote proxy"#]
    pub async fn proxy_invoke(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        proxy_name: &fiberplane_models::names::Name,
        data_source_name: &fiberplane_models::names::Name,
        payload: Vec<u8>,
    ) -> Result<bytes::Bytes> {
        let mut builder = self.request(
        Method::POST,
        &format!("/api/workspaces/{workspaceId}/proxies/{proxyName}/data_sources/{dataSourceName}/relay/v2/invoke", workspaceId = workspace_id, proxyName = proxy_name, dataSourceName = data_source_name, )
    )?;
        builder = builder.body(payload);
        let response = builder.send().await?.error_for_status()?.bytes().await?;

        Ok(response)
    }

    #[doc = r#"Relay a query to call 'get_supported_query_types' from a provider on a remote proxy"#]
    pub async fn proxy_supported_query_types(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        proxy_name: &fiberplane_models::names::Name,
        data_source_name: &fiberplane_models::names::Name,
    ) -> Result<bytes::Bytes> {
        let mut builder = self.request(
        Method::GET,
        &format!("/api/workspaces/{workspaceId}/proxies/{proxyName}/data_sources/{dataSourceName}/relay/v2/supported_query_types", workspaceId = workspace_id, proxyName = proxy_name, dataSourceName = data_source_name, )
    )?;
        let response = builder.send().await?.error_for_status()?.bytes().await?;

        Ok(response)
    }

    #[doc = r#"Search for notebooks"#]
    pub async fn notebook_search(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
        payload: models::NotebookSearch,
    ) -> Result<Vec<models::NotebookSummary>> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/search/notebooks",
                workspaceId = workspace_id,
            ),
        )?;
        if let Some(sort_by) = sort_by {
            builder = builder.query(&[("sort_by", sort_by)]);
        }
        if let Some(sort_direction) = sort_direction {
            builder = builder.query(&[("sort_direction", sort_direction)]);
        }
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"List the snippets that have been uploaded"#]
    pub async fn snippet_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
    ) -> Result<Vec<models::SnippetSummary>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/snippets",
                workspaceId = workspace_id,
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

    #[doc = r#"Create a new snippet"#]
    pub async fn snippet_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewSnippet,
    ) -> Result<models::Snippet> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/snippets",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieves a specified snippet from a workspace"#]
    pub async fn snippet_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        snippet_name: &fiberplane_models::names::Name,
    ) -> Result<models::Snippet> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/snippets/{snippetName}",
                workspaceId = workspace_id,
                snippetName = snippet_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a specified snippet from a workspace"#]
    pub async fn snippet_delete(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        snippet_name: &fiberplane_models::names::Name,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/snippets/{snippetName}",
                workspaceId = workspace_id,
                snippetName = snippet_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Updates a specified snippet from a workspace"#]
    pub async fn snippet_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        snippet_name: &fiberplane_models::names::Name,
        payload: models::UpdateSnippet,
    ) -> Result<models::Snippet> {
        let mut builder = self.request(
            Method::PATCH,
            &format!(
                "/api/workspaces/{workspaceId}/snippets/{snippetName}",
                workspaceId = workspace_id,
                snippetName = snippet_name,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Expand the snippet and return the array of cells (without inserting them into a specific notebook)"#]
    pub async fn snippet_expand(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        snippet_name: &fiberplane_models::names::Name,
    ) -> Result<Vec<models::Cell>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/snippets/{snippetName}/expand",
                workspaceId = workspace_id,
                snippetName = snippet_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve all the templates that have been uploaded"#]
    pub async fn template_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
    ) -> Result<Vec<models::TemplateSummary>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/templates",
                workspaceId = workspace_id,
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

    #[doc = r#"Create a new template"#]
    pub async fn template_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewTemplate,
    ) -> Result<models::Template> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/templates",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieves a specified template"#]
    pub async fn template_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        template_name: &fiberplane_models::names::Name,
    ) -> Result<models::Template> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/templates/{templateName}",
                workspaceId = workspace_id,
                templateName = template_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes a specified template"#]
    pub async fn template_delete(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        template_name: &fiberplane_models::names::Name,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/templates/{templateName}",
                workspaceId = workspace_id,
                templateName = template_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Updates a specified template"#]
    pub async fn template_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        template_name: &fiberplane_models::names::Name,
        payload: models::UpdateTemplate,
    ) -> Result<models::Template> {
        let mut builder = self.request(
            Method::PATCH,
            &format!(
                "/api/workspaces/{workspaceId}/templates/{templateName}",
                workspaceId = workspace_id,
                templateName = template_name,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Expand the template into a notebook"#]
    pub async fn template_expand(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        template_name: &fiberplane_models::names::Name,
        payload: models::TemplateExpandPayload,
    ) -> Result<models::Notebook> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/templates/{templateName}/expand",
                workspaceId = workspace_id,
                templateName = template_name,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"List all created triggers in the workspace"#]
    pub async fn trigger_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
    ) -> Result<Vec<models::Trigger>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/triggers",
                workspaceId = workspace_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Creates a new trigger for a template"#]
    pub async fn trigger_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewTrigger,
    ) -> Result<models::Trigger> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/triggers",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"List all users for a workspace"#]
    pub async fn workspace_user_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
    ) -> Result<Vec<models::Membership>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/users",
                workspaceId = workspace_id,
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

    #[doc = r#"Removes a user from the workspace"#]
    pub async fn workspace_user_remove(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        user_id: base64uuid::Base64Uuid,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/users/{userId}",
                workspaceId = workspace_id,
                userId = user_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Updates the user within a workspace"#]
    pub async fn workspace_user_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        user_id: base64uuid::Base64Uuid,
        payload: models::UpdateWorkspaceUser,
    ) -> Result<models::User> {
        let mut builder = self.request(
            Method::PATCH,
            &format!(
                "/api/workspaces/{workspaceId}/users/{userId}",
                workspaceId = workspace_id,
                userId = user_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieves all views"#]
    pub async fn view_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        sort_by: Option<&str>,
        sort_direction: Option<&str>,
        page: Option<i32>,
        limit: Option<i32>,
    ) -> Result<Vec<models::View>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/views",
                workspaceId = workspace_id,
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

    #[doc = r#"Creates a new view"#]
    pub async fn view_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewView,
    ) -> Result<models::View> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/views",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieves a single view"#]
    pub async fn view_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        view_name: &fiberplane_models::names::Name,
    ) -> Result<models::View> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/views/{viewName}",
                workspaceId = workspace_id,
                viewName = view_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes an existing view"#]
    pub async fn view_delete(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        view_name: &fiberplane_models::names::Name,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/views/{viewName}",
                workspaceId = workspace_id,
                viewName = view_name,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Updates an existing view"#]
    pub async fn view_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        view_name: &fiberplane_models::names::Name,
        payload: models::UpdateView,
    ) -> Result<models::View> {
        let mut builder = self.request(
            Method::PATCH,
            &format!(
                "/api/workspaces/{workspaceId}/views/{viewName}",
                workspaceId = workspace_id,
                viewName = view_name,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve all webhooks for a specific workspace"#]
    pub async fn webhook_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        page: Option<i32>,
        limit: Option<i32>,
    ) -> Result<Vec<models::Webhook>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/webhooks",
                workspaceId = workspace_id,
            ),
        )?;
        if let Some(page) = page {
            builder = builder.query(&[("page", page)]);
        }
        if let Some(limit) = limit {
            builder = builder.query(&[("limit", limit)]);
        }
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Create a new webhook. Upon execution of this route, a test event ("ping") will be sent to the endpoint.
If sending the ping event fails, the webhook will still be created, but it will be disabled.
Please check the response of this endpoint to see whenever `enabled` = `false`,
and if that is the case, check the latest delivery to see why. Once the endpoint has been fixed, you
can re-deliver the ping payload and if that works, manually re-enable the webhook again.
"#]
    pub async fn webhook_create(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        payload: models::NewWebhook,
    ) -> Result<models::Webhook> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/webhooks",
                workspaceId = workspace_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Deletes an existing webhook"#]
    pub async fn webhook_delete(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        webhook_id: base64uuid::Base64Uuid,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::DELETE,
            &format!(
                "/api/workspaces/{workspaceId}/webhooks/{webhookId}",
                workspaceId = workspace_id,
                webhookId = webhook_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }

    #[doc = r#"Updates an existing webhook. Upon execution of this route, a test event ("ping") will be sent to the endpoint.
If sending the ping event fails, the webhook will still be updated, but will be disabled.
Please check the response of this endpoint to see whenever `enabled` = `false`, and if that is the case
(and not manually requested), check the latest delivery to see why. Once the endpoint has been fixed, you
can re-deliver the ping payload and if that works, manually re-enable the webhook again.
"#]
    pub async fn webhook_update(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        webhook_id: base64uuid::Base64Uuid,
        payload: models::UpdateWebhook,
    ) -> Result<models::Webhook> {
        let mut builder = self.request(
            Method::PATCH,
            &format!(
                "/api/workspaces/{workspaceId}/webhooks/{webhookId}",
                workspaceId = workspace_id,
                webhookId = webhook_id,
            ),
        )?;
        builder = builder.json(&payload);
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve a list of deliveries for a specific webhook"#]
    pub async fn webhook_delivery_list(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        webhook_id: base64uuid::Base64Uuid,
        page: Option<i32>,
        limit: Option<i32>,
    ) -> Result<Vec<models::WebhookDeliverySummary>> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/webhooks/{webhookId}/deliveries",
                workspaceId = workspace_id,
                webhookId = webhook_id,
            ),
        )?;
        if let Some(page) = page {
            builder = builder.query(&[("page", page)]);
        }
        if let Some(limit) = limit {
            builder = builder.query(&[("limit", limit)]);
        }
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Retrieve information about a specific delivery for a specific webhook"#]
    pub async fn webhook_delivery_get(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        webhook_id: base64uuid::Base64Uuid,
        delivery_id: base64uuid::Base64Uuid,
    ) -> Result<models::WebhookDelivery> {
        let mut builder = self.request(
            Method::GET,
            &format!(
                "/api/workspaces/{workspaceId}/webhooks/{webhookId}/deliveries/{deliveryId}",
                workspaceId = workspace_id,
                webhookId = webhook_id,
                deliveryId = delivery_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?.json().await?;

        Ok(response)
    }

    #[doc = r#"Resend a specific delivery"#]
    pub async fn webhook_delivery_resend(
        &self,
        workspace_id: base64uuid::Base64Uuid,
        webhook_id: base64uuid::Base64Uuid,
        delivery_id: base64uuid::Base64Uuid,
    ) -> Result<()> {
        let mut builder = self.request(
            Method::POST,
            &format!(
                "/api/workspaces/{workspaceId}/webhooks/{webhookId}/deliveries/{deliveryId}/resend",
                workspaceId = workspace_id,
                webhookId = webhook_id,
                deliveryId = delivery_id,
            ),
        )?;
        let response = builder.send().await?.error_for_status()?;

        Ok(())
    }
}
