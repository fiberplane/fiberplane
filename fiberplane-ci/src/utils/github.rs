use anyhow::{Context, Result};
use octocrab::models::{ArtifactId, JobId, RepositoryId};
use octocrab::{Octocrab, Page};
use secrecy::ExposeSecret;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

pub fn build_octocrab(github_token: &secrecy::SecretString) -> Result<Octocrab> {
    // NOTE: octocrab stores the personal token as secrecy::SecretString
    // already, so there might be a way of doing this directly.
    Octocrab::builder()
        .personal_token(github_token.expose_secret().clone())
        .build()
        .context("Unable to create the GitHub client")
}

#[async_trait::async_trait]
pub trait ArtifactsExt {
    async fn get_artifacts(
        &self,
        owner: &str,
        repo: &str,
        artifact_name: &str,
    ) -> Result<Page<Artifact>>;
}

#[async_trait::async_trait]
impl ArtifactsExt for Octocrab {
    async fn get_artifacts(
        &self,
        owner: &str,
        repo: &str,
        artifact_name: &str,
    ) -> Result<Page<Artifact>> {
        self.get(
            format!("/repos/{owner}/{repo}/actions/artifacts"),
            Some(&ArtifactsParams {
                name: Some(artifact_name.to_owned()),
            }),
        )
        .await
        .map_err(octocrab::Error::into)
    }
}

#[derive(Clone, Serialize)]
struct ArtifactsParams {
    name: Option<String>,
}

/// (Incomplete) representation of a Github artifact.
#[derive(Clone, Debug, Deserialize)]
pub struct Artifact {
    /// The ID of the artifact.
    pub id: ArtifactId,

    pub expired: bool,

    /// The name of the artifact.
    pub name: Option<String>,

    pub node_id: Option<String>,

    pub size_in_bytes: u64,

    pub url: String,

    pub archive_download_url: String,

    #[serde(with = "time::serde::rfc3339")]
    pub created_at: OffsetDateTime,

    #[serde(with = "time::serde::rfc3339")]
    pub updated_at: OffsetDateTime,

    #[serde(with = "time::serde::rfc3339::option")]
    pub expires_at: Option<OffsetDateTime>,

    pub workflow_run: Option<WorkflowRunSummary>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct WorkflowRunSummary {
    pub id: JobId,

    pub repository_id: RepositoryId,

    pub head_branch: String,

    /// The SHA of the head commit that points to the version of the workflow being run.
    pub head_sha: String,
}
