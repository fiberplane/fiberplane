use super::parse_version;
use anyhow::{Context, Result};
use octocrab::{models::repos::Release, repos::RepoHandler};

pub async fn get_previous_alpha_release(repo: &RepoHandler<'_>) -> Result<Option<Release>> {
    let releases = repo
        .releases()
        .list()
        .per_page(100)
        .send()
        .await
        .context("Unable to get the releases")?
        .take_items();

    Ok(releases
        .into_iter()
        .find(|release| match parse_version(&release.tag_name) {
            Ok((_, _, _, Some(suffix))) => suffix.starts_with("alpha-"),
            _ => false,
        }))
}
