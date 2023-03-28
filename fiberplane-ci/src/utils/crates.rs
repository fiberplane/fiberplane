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
