use anyhow::{bail, Result};
use duct::cmd;
use std::str::Utf8Error;

/// Returns whether a path in the repo changed since the given commit.
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

/// Returns whether a path in the repo changes since the previous release branch
/// was created.
///
/// If no previous release branch can be found at all, we consider that a new
/// release is in order, so this function will return `true` in that case.
pub fn did_change_since_previous_release(repo_dir: &str, path: &str) -> Result<bool> {
    let output = cmd!("git", "branch", "--list", "release-*")
        .dir(repo_dir)
        .stdout_capture()
        .run()?
        .stdout;
    let release_branches = output
        .split(|byte| byte == &b'\n')
        .map(|slice| std::str::from_utf8(slice).map(str::trim))
        .collect::<Result<Vec<&str>, _>>()?;
    let Some(latest_release_branch) = release_branches.iter().reduce(|latest_release, release_branch| {
        std::cmp::max(latest_release, release_branch)
    }) else {
        return Ok(true); // No release found? Report as having changes.
    };

    let main_tip = get_latest_commit(repo_dir, "main")?;
    let release_branch_tip = get_latest_commit(repo_dir, latest_release_branch)?;
    let common_ancestor = get_common_ancestor(repo_dir, &main_tip, &release_branch_tip)?;
    did_change(repo_dir, path, &common_ancestor)
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
