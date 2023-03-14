use anyhow::{bail, Result};
use duct::cmd;
use std::str::Utf8Error;

/// Returns whether a path in the repo changed since the given commit.
pub fn did_change(path: &str, since_commit: &str) -> Result<bool> {
    let output = cmd!("git", "diff", "--quiet", "HEAD", since_commit, "--", path)
        .unchecked()
        .run()?;
    match output.status.code() {
        Some(1) => Ok(true),
        Some(0) => Ok(false),
        Some(code) => bail!("Unexpected exit code ({code}) from `git diff`"),
        None => bail!("`git diff` terminated unexpectedly"),
    }
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
        .map(|slice| {
            std::str::from_utf8(slice)
                .map(str::to_owned)
                .map_err(Utf8Error::into)
        })
        .collect()
}
