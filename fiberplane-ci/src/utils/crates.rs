use super::parse_version;
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

/// Returns the most-recently published alpha version for the given crate.
pub async fn get_previous_alpha_version(
    index_url: &str,
    crate_name: &str,
) -> Result<Option<String>> {
    let versions = get_published_versions(index_url, crate_name).await?;
    Ok(versions
        .into_iter()
        .rev()
        .find(|version| match parse_version(&version) {
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
        .map(|line| {
            let PublishedVersion { version } = serde_json::from_str(line.trim())?;
            Ok(version)
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
