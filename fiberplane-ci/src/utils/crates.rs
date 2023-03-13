use super::{get_suffix_count, matches_base_version, parse_version};
use anyhow::Result;
use reqwest::Client;
use serde::Deserialize;

pub const CRATES_IO_INDEX_URL: &str = "https://index.crates.io";

const USER_AGENT: &str = "Fiberplane/Release worker/1.0";

#[derive(Deserialize)]
struct PublishedVersion {
    #[serde(rename = "vers")]
    version: String,
}

/// Determines the next applicable alpha version for a crate that uses the
/// workspace version.
///
/// When publishing a new alpha version for a crate that relies on the workspace
/// version, we cannot simply look at the next alpha version for that crate
/// alone, because that version could have been already used by another
/// workspace-version-using-crate that also needs to be updated. So we need to
/// determine an alpha version that all those crates can be bumped to.
pub async fn determine_next_workspace_alpha(
    index_url: &str,
    base_version: &str,
    workspace_version_using_crates_to_publish: &[&str],
) -> Result<String> {
    let mut next_alpha_count = 1;
    for crate_name in workspace_version_using_crates_to_publish {
        let Some(previous_alpha_version) = get_previous_alpha_version(index_url, crate_name).await? else {
            continue;
        };
        if matches_base_version(&previous_alpha_version, base_version) {
            let alpha_count = get_suffix_count(&previous_alpha_version)?;
            if alpha_count >= next_alpha_count {
                next_alpha_count = alpha_count + 1;
            }
        }
    }
    Ok(format!("{base_version}-alpha.{next_alpha_count}"))
}

/// Returns the most-recently published alpha version for the given crate.
pub async fn get_previous_alpha_version(
    index_url: &str,
    crate_name: &str,
) -> Result<Option<String>> {
    let versions = get_published_versions(index_url, crate_name).await?;
    Ok(versions
        .into_iter()
        .rev()
        .find(|version| match parse_version(version) {
            Ok((_, _, _, Some(suffix))) => suffix.starts_with("alpha-"),
            _ => false,
        }))
}

/// Fetches the current list of all published versions of a crate.
///
/// Notably, this _includes_ the yanked versions.
///
/// Returned versions are ordered from oldest to newest.
async fn get_published_versions(index_url: &str, crate_name: &str) -> Result<Vec<String>> {
    let index_url = format!("{index_url}/{}", index_url_path(crate_name));
    let client = Client::new();
    let response = client
        .get(index_url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await?;
    let response_text = response.text().await?;

    response_text
        .split('\n')
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .map(|line| match serde_json::from_str(line) {
            Ok(PublishedVersion { version }) => Ok(version),
            Err(error) => {
                eprintln!("Failed to parse published version line for crate {crate_name}: {line}");
                Err(error.into())
            }
        })
        .collect()
}

fn index_url_path(crate_name: &str) -> String {
    match crate_name.len() {
        1 => format!("1/{crate_name}"),
        2 => format!("2/{crate_name}"),
        3 => format!(
            "3/{first_char}/{crate_name}",
            first_char = &crate_name[0..1]
        ),
        _ => format!(
            "{first_chars}/{next_chars}/{crate_name}",
            first_chars = &crate_name[0..2],
            next_chars = &crate_name[2..4]
        ),
    }
}

/// Returns whether the given version of the given crate has been published.
pub async fn is_published(index_url: &str, crate_name: &str, version: &str) -> Result<bool> {
    let versions = get_published_versions(index_url, crate_name).await?;
    Ok(versions.iter().any(|published| published == version))
}
