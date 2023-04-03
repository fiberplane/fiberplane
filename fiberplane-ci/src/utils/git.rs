use anyhow::{bail, Result};
use duct::cmd;
use std::str::Utf8Error;

/// Returns whether a path in the repo has changed since the given commit.
pub fn did_change(repo_dir: &str, path: &str, since_commit: &str) -> Result<bool> {
    let output = cmd!(
        "git",
        "diff",
        "--quiet",
        "--ignore-space-change",
        "HEAD",
        since_commit,
        "--",
        path
    )
    .dir(repo_dir)
    .unchecked()
    .run()?;
    match output.status.code() {
        Some(1) => Ok(true),
        Some(0) => Ok(false),
        Some(code) => bail!("Unexpected exit code ({code}) from `git diff`"),
        None => bail!("`git diff` terminated unexpectedly"),
    }
}

/// Returns whether a path in the repo has changed since the previous release
/// branch was created.
///
/// If no previous release branch can be found at all, we consider that a new
/// release is in order, so this function will return `true` in that case.
pub fn did_change_since_previous_release(repo_dir: &str, path: &str) -> Result<bool> {
    let Some(latest_release_branch) = get_latest_release_branch(repo_dir)? else {
        return Ok(true); // No release found? Report as having changes.
    };

    let main_tip = get_latest_commit(repo_dir, "main")?;
    let release_branch_tip = get_latest_commit(repo_dir, &latest_release_branch)?;
    let common_ancestor = get_common_ancestor(repo_dir, &main_tip, &release_branch_tip)?;
    did_change(repo_dir, path, &common_ancestor)
}

/// Returns whether a crate in the repo has changed since the previous release
/// branch was created.
///
/// If no previous release branch can be found at all, we consider that a new
/// release is in order, so this function will return `true` in that case.
///
/// If only the version number in the crate's `Cargo.toml` has changed, this
/// still regards the crate as not having any changes.
pub fn did_crate_change_since_previous_release_in_anything_except_version(
    repo_dir: &str,
    path: &str,
) -> Result<bool> {
    let Some(latest_release_branch) = get_latest_release_branch(repo_dir)? else {
        return Ok(true); // No release found? Report as having changes.
    };

    let main_tip = get_latest_commit(repo_dir, "main")?;
    let release_branch_tip = get_latest_commit(repo_dir, &latest_release_branch)?;
    let common_ancestor = get_common_ancestor(repo_dir, &main_tip, &release_branch_tip)?;

    let output = cmd!(
        "git",
        "diff",
        "--exit-code",
        "--ignore-space-change",
        "--no-color", // don't get fancy ideas
        "-U0",        // disable context lines
        "HEAD",
        common_ancestor,
        "--",
        path
    )
    .stdout_capture()
    .dir(repo_dir)
    .unchecked()
    .run()?;
    match output.status.code() {
        Some(1) => did_change_anything_except_version(&output.stdout),
        Some(0) => Ok(false),
        Some(code) => bail!("Unexpected exit code ({code}) from `git diff`"),
        None => bail!("`git diff` terminated unexpectedly"),
    }
}

fn did_change_anything_except_version(output: &[u8]) -> Result<bool> {
    for line in output.split(|byte| byte == &b'\n') {
        if line.is_empty() {
            continue;
        }

        if line.starts_with(b"diff ") || line.starts_with(b"index ") || line.starts_with(b"@@ ") {
            continue; // This is context we don't care about.
        }

        if line.starts_with(b"--- ") || line.starts_with(b"+++ ") {
            if !line.ends_with(b"/Cargo.toml") {
                return Ok(true); // Found changes to a file other than `Cargo.toml`.
            }
        } else if line.starts_with(b"-") {
            if !line.starts_with(b"-version = ") {
                return Ok(true); // Found changes to something other than the version.
            }
        } else if line.starts_with(b"+") {
            if !line.starts_with(b"+version = ") {
                return Ok(true); // Found changes to something other than the version.
            }
        } else {
            bail!("Unexpected diff line. Make sure diff output doesn't contain context lines");
        }
    }

    Ok(false)
}

/// Returns a list of commits, from newest to oldest.
pub fn get_commits(repo_dir: &str) -> Result<Vec<String>> {
    let output = cmd!("git", "log", "--pretty=%h")
        .stdout_capture()
        .dir(repo_dir)
        .run()?
        .stdout;

    output
        .split(|byte| byte == &b'\n')
        .filter(|slice| !slice.is_empty())
        .map(|slice| {
            std::str::from_utf8(slice)
                .map(str::to_owned)
                .map_err(Utf8Error::into)
        })
        .collect()
}

/// Returns the most recent common ancestor between two commits.
pub fn get_common_ancestor(repo_dir: &str, commit_a: &str, commit_b: &str) -> Result<String> {
    let output = cmd!("git", "merge-base", commit_a, commit_b)
        .stdout_capture()
        .dir(repo_dir)
        .run()?
        .stdout;

    let common_ancestor = std::str::from_utf8(&output)?.trim();
    if common_ancestor.is_empty() {
        bail!("Could not determine common ancestor between commits {commit_a} and {commit_b}");
    }

    Ok(common_ancestor.to_owned())
}

/// Returns the SHA of the most recent commit.
pub fn get_latest_commit(repo_dir: &str, branch_name: &str) -> Result<String> {
    let output = cmd!("git", "log", "--pretty=%h", "-n", "1", branch_name)
        .stdout_capture()
        .dir(repo_dir)
        .run()?
        .stdout;

    let commit = std::str::from_utf8(&output)?.trim();
    if commit.is_empty() {
        bail!("No commit found in {branch_name}. Invalid branch?");
    }

    Ok(commit.to_owned())
}

/// Returns the name of most recent release branch.
pub fn get_latest_release_branch(repo_dir: &str) -> Result<Option<String>> {
    let output = cmd!("git", "branch", "--list", "release-*")
        .dir(repo_dir)
        .stdout_capture()
        .run()?
        .stdout;
    let release_branches = output
        .split(|byte| byte == &b'\n')
        .map(|slice| std::str::from_utf8(slice).map(str::trim))
        .collect::<Result<Vec<&str>, _>>()?;
    let latest_release_branch = release_branches
        .iter()
        .reduce(|latest_release, release_branch| std::cmp::max(latest_release, release_branch))
        .cloned()
        .map(str::to_owned);
    Ok(latest_release_branch)
}

#[cfg(test)]
mod tests {
    use super::did_change_anything_except_version;

    #[test]
    fn test_did_change_anything_except_version() {
        let changed_nothing_output = br#""#;
        assert!(!did_change_anything_except_version(changed_nothing_output).unwrap());

        let only_changed_version_output = br#"diff --git a/fiberplane-provider-protocol/fiberplane-provider-bindings/Cargo.toml b/fiberplane-provider-protocol/fiberplane-provider-bindings/Cargo.toml
index 74c999b..3e5422a 100644
--- a/fiberplane-provider-protocol/fiberplane-provider-bindings/Cargo.toml
+++ b/fiberplane-provider-protocol/fiberplane-provider-bindings/Cargo.toml
@@ -5 +5 @@ readme = "README.md"
-version = "2.0.0-beta.2"
+version = "2.0.0-beta.3"
"#;
        assert!(!did_change_anything_except_version(only_changed_version_output).unwrap());

        let changed_dependency_output = br#"diff --git a/fiberplane-provider-protocol/fiberplane-provider-bindings/Cargo.toml b/fiberplane-provider-protocol/fiberplane-provider-bindings/Cargo.toml
index 74c999b..bb32cb4 100644
--- a/fiberplane-provider-protocol/fiberplane-provider-bindings/Cargo.toml
+++ b/fiberplane-provider-protocol/fiberplane-provider-bindings/Cargo.toml
@@ -5 +5 @@ readme = "README.md"
-version = "2.0.0-beta.2"
+version = "2.0.0-beta.3"
@@ -15 +15 @@ once_cell = { workspace = true }
-rmp-serde = { version = "1.0" }
+rmp-serde = { version = "1.1" }
"#;
        assert!(did_change_anything_except_version(changed_dependency_output).unwrap());
    }
}
