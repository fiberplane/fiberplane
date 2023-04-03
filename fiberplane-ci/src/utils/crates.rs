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

/// Fetches the current list of all published versions of a crate.
///
/// Notably, this _includes_ the yanked versions.
///
/// The versions are sorted from smallest semver-wise (0.0.0-alpha.0) to most
/// recent semver-wise (9999.9999.9999).
async fn get_published_versions(index_url: &str, crate_name: &str) -> Result<Vec<String>> {
    let index_url = format!("{index_url}/{}", index_url_path(crate_name));
    let client = Client::new();
    let response = client
        .get(index_url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await?;
    let response_text = response.text().await?;

    let mut versions = response_text
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
        .collect::<Result<Vec<String>>>()?;

    sort_versions(&mut versions);

    Ok(versions)
}

/// Helper for generating index path to crates.
///
/// ```rust,ignore
/// assert_eq!(&index_url_path("fiberplane"), "fi/be/fiberplane");
/// assert_eq!(&index_url_path("fib"), "3/f/fib");
/// assert_eq!(&index_url_path("fi"), "2/fi");
/// assert_eq!(&index_url_path("f"), "1/f");
/// ```
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

fn sort_versions(versions: &mut [String]) {
    versions.sort_by(|lhs, rhs| {
        let (l_major, l_minor, l_patch, l_meta) =
            parse_version(lhs).expect("crates-io returns valid version numbers.");
        let (r_major, r_minor, r_patch, r_meta) =
            parse_version(rhs).expect("crates-io returns valid version numbers.");
        if l_major != r_major {
            return l_major.cmp(&r_major);
        }
        if l_minor != r_minor {
            return l_minor.cmp(&r_minor);
        }
        if l_patch != r_patch {
            return l_patch.cmp(&r_patch);
        }
        match (l_meta, r_meta) {
            (Some(_), None) => std::cmp::Ordering::Less,
            (None, Some(_)) => std::cmp::Ordering::Greater,
            (None, None) => std::cmp::Ordering::Equal,
            (Some(l_meta), Some(r_meta)) => cmp_prereleases(l_meta, r_meta),
        }
    });
}

// NOTE: we do not rely on a crate like semver to do the comparison because we
// have non-semver versions like '1.0.0-beta.2-alpha.3' (with 2 dashes) that
// semver crate cannot sort as we want out of the box.
fn cmp_prereleases(lhs: &str, rhs: &str) -> std::cmp::Ordering {
    assert!(lhs.split('-').count() <= 2, "Comparing prerelease versions for ordering only works when prereleases have at most 1 '-'; {lhs:?} is invalid");
    assert!(rhs.split('-').count() <= 2, "Comparing prerelease versions for ordering only works when prereleases have at most 1 '-'; {rhs:?} is invalid");

    /// Computes ordering between components like 'alpha.2' and 'beta.5',
    /// making sure that 'alpha.14' < 'alpha.3'
    fn cmp_prerelease_sections(lhs: &str, rhs: &str) -> std::cmp::Ordering {
        match (lhs.split_once('.'), rhs.split_once('.')) {
            (None, None) => lhs.cmp(rhs),
            (None, Some((r_first, _r_count))) => {
                if lhs == r_first {
                    std::cmp::Ordering::Less
                } else {
                    lhs.cmp(r_first)
                }
            }
            (Some((l_first, _l_count)), None) => {
                if l_first == rhs {
                    std::cmp::Ordering::Greater
                } else {
                    l_first.cmp(rhs)
                }
            }
            (Some((l_first, l_count)), Some((r_first, r_count))) => {
                if l_first != r_first {
                    l_first.cmp(r_first)
                } else {
                    l_count
                        .parse::<u32>()
                        .unwrap()
                        .cmp(&r_count.parse::<u32>().unwrap())
                }
            }
        }
    }

    match (lhs.split_once('-'), rhs.split_once('-')) {
        (None, None) => lhs.cmp(rhs),
        (None, Some((r_first, _r_second))) => {
            if lhs == r_first {
                std::cmp::Ordering::Greater
            } else {
                cmp_prerelease_sections(lhs, r_first)
            }
        }
        (Some((l_first, _l_second)), None) => {
            if rhs == l_first {
                std::cmp::Ordering::Less
            } else {
                cmp_prerelease_sections(l_first, rhs)
            }
        }
        (Some((l_first, l_second)), Some((r_first, r_second))) => {
            if l_first != r_first {
                cmp_prerelease_sections(l_first, r_first)
            } else {
                cmp_prerelease_sections(l_second, r_second)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_index_path() {
        assert_eq!(&index_url_path("fiberplane"), "fi/be/fiberplane");
        assert_eq!(&index_url_path("fib"), "3/f/fib");
        assert_eq!(&index_url_path("fi"), "2/fi");
        assert_eq!(&index_url_path("f"), "1/f");
    }

    #[test]
    fn test_versions_sort() {
        let mut start = vec![
            "1.1.0".to_string(),
            "1.1.1".to_string(),
            "1.0.1".to_string(),
            "0.1.0".to_string(),
            "1.1.0-alpha.12".to_string(),
            "1.1.0-beta.1".to_string(),
            "1.1.0-beta.1-alpha.2".to_string(),
            "1.1.0-alpha.2".to_string(),
        ];

        sort_versions(&mut start);

        assert_eq!(
            start,
            vec![
                "0.1.0".to_string(),
                "1.0.1".to_string(),
                "1.1.0-alpha.12".to_string(),
                "1.1.0-alpha.2".to_string(),
                "1.1.0-beta.1-alpha.2".to_string(),
                "1.1.0-beta.1".to_string(),
                "1.1.0".to_string(),
                "1.1.1".to_string(),
            ]
        );
    }
}
