use anyhow::Result;
use octocrab::models::{ArtifactId, JobId, RepositoryId, WorkflowId};
use octocrab::{Octocrab, Page};
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

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

#[derive(Serialize)]
struct ArtifactsParams {
    name: Option<String>,
}

/// (Incomplete) representation of a Github artifact.
#[derive(Debug, Deserialize)]
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

    pub created_at: OffsetDateTime,

    pub updated_at: OffsetDateTime,

    pub expires_at: Option<OffsetDateTime>,

    pub workflow_run: Option<WorkflowRunSummary>,
}

#[derive(Debug, Deserialize)]
pub struct WorkflowRunSummary {
    pub id: JobId,

    pub repository_id: RepositoryId,

    pub head_branch: String,

    /// The SHA of the head commit that points to the version of the workflow being run.
    pub head_sha: String,
}

#[async_trait::async_trait]
pub trait WorkflowsExt {
    async fn list_all_workflow_runs_for_event(
        &self,
        owner: &str,
        repo: &str,
        event: &str,
    ) -> Result<Page<WorkflowRun>>;
}

#[async_trait::async_trait]
impl WorkflowsExt for Octocrab {
    async fn list_all_workflow_runs_for_event(
        &self,
        owner: &str,
        repo: &str,
        event: &str,
    ) -> Result<Page<WorkflowRun>> {
        self.get(
            format!("/repos/{owner}/{repo}/actions/runs"),
            Some(&ListWorkflowRunsParams {
                event: event.to_owned(),
            }),
        )
        .await
        .map_err(octocrab::Error::into)
    }
}

#[derive(Debug, Serialize)]
struct ListWorkflowRunsParams {
    event: String,
}

/// (Incomplete) representation of a Github Actions workflow run.
#[derive(Debug, Deserialize)]
pub struct WorkflowRun {
    /// The ID of the workflow run.
    pub id: JobId,

    /// The name of the workflow run.
    pub name: Option<String>,

    pub node_id: Option<String>,

    /// The ID of the associated check suite.
    pub check_suite_id: Option<u64>,

    /// The node ID of the associated check suite.
    pub check_suite_node_id: Option<String>,

    pub head_branch: Option<String>,

    /// The SHA of the head commit that points to the version of the workflow being run.
    pub head_sha: String,

    /// The full path of the workflow.
    pub path: String,

    /// The auto incrementing run number for the workflow run.
    pub run_number: u64,

    /// Attempt number of the run, 1 for first attempt and higher if the workflow was re-run.
    pub run_attempt: u64,

    pub event: String,

    pub status: Option<WorkflowStatus>,

    pub conclusion: Option<String>,

    /// The ID of the parent workflow.
    pub workflow_id: WorkflowId,

    /// The URL to the workflow run.
    pub url: String,

    pub created_at: OffsetDateTime,

    pub updated_at: OffsetDateTime,

    /// The start time of the latest run. Resets on re-run.
    pub run_started_at: Option<OffsetDateTime>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
#[non_exhaustive]
pub enum WorkflowStatus {
    ActionRequired,
    Cancelled,
    Failure,
    Neutral,
    Success,
    Skipped,
    Stale,
    TimedOut,
}
