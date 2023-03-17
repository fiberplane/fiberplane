use crate::utils::{parse_suffix, parse_version};
use anyhow::{bail, Result};
use clap::Parser;
use reqwest::Client;
use secrecy::ExposeSecret;
use serde::Deserialize;

pub const ARTIFACTORY_INDEX_URL: &str = "https://fiberplane.jfrog.io/artifactory";

#[derive(Parser)]
pub struct ArtifactoryCredentials {
    /// API key configured in your Artifactory account.
    #[clap(long, env)]
    pub artifactory_token: secrecy::SecretString,

    /// Email address you use to login to Artifactory.
    #[clap(long, env)]
    pub artifactory_username: String,
}

/// Determines the next applicable alpha version for a crate that is published
/// to Artifactory.
pub async fn determine_next_artifactory_alpha(
    crate_name: &str,
    base_version: &str,
    credentials: &ArtifactoryCredentials,
) -> Result<String> {
    match get_previous_artifactory_alpha_version(crate_name, base_version, credentials).await? {
        Some(version) => {
            let (_major, _minor, _patch, Some(suffix)) = parse_version(&version)? else {
                bail!("Expected alpha version has no suffix");
            };
            let (_suffix, count) = parse_suffix(suffix)?;
            Ok(format!("{base_version}-alpha.{count}", count = count + 1))
        }
        None => Ok(format!("{base_version}-alpha.1")),
    }
}

pub async fn get_previous_artifactory_alpha_version(
    crate_name: &str,
    base_version: &str,
    credentials: &ArtifactoryCredentials,
) -> Result<Option<String>> {
    let prefix = format!("{crate_name}-");

    let client = Client::new();
    let response = client
        .post(format!("{ARTIFACTORY_INDEX_URL}/api/search/aql"))
        .basic_auth(
            &credentials.artifactory_username,
            Some(credentials.artifactory_token.expose_secret()),
        )
        .header("Content-Type", "text/plain")
        .body(format!(
            r#"items.find({{
                "repo":"internal-cargo-local",
                "path":"crates/{crate_name}",
                "name":{{"$match":"{prefix}{base_version}-alpha.*"}}
            }})
            .include("repo","path","name")
            .sort({{"$desc":["name"]}})"#
        ))
        .send()
        .await?;
    let response_text = response.text().await?;

    let response: ArtifactorySearchResponse = serde_json::from_str(&response_text)?;
    Ok(response.results.first().map(|result| {
        let version = &result.name[prefix.len()..];
        version.strip_suffix(".crate").unwrap_or(version).to_owned()
    }))
}

/// Returns whether the given version of the given crate has been published to
/// Artifactory.
pub async fn is_published_to_artifactory(
    crate_name: &str,
    version: &str,
    credentials: &ArtifactoryCredentials,
) -> Result<bool> {
    let client = Client::new();
    let response = client
        .post(format!("{ARTIFACTORY_INDEX_URL}/api/search/aql"))
        .basic_auth(
            &credentials.artifactory_username,
            Some(credentials.artifactory_token.expose_secret()),
        )
        .header("Content-Type", "text/plain")
        .body(format!(
            r#"items.find({{
                "repo":"internal-cargo-local",
                "path":"crates/{crate_name}",
                "name":"{crate_name}-{version}.crate"
            }})
            .include("repo","path","name")"#
        ))
        .send()
        .await?;
    let response_text = response.text().await?;

    let response: ArtifactorySearchResponse = serde_json::from_str(&response_text)?;
    Ok(response.results.first().is_some())
}

#[derive(Deserialize)]
struct ArtifactorySearchResponse {
    results: Vec<ArtifactorySearchResult>,
}

#[derive(Deserialize)]
struct ArtifactorySearchResult {
    #[allow(dead_code)]
    repo: String,
    #[allow(dead_code)]
    path: String,
    name: String,
}
