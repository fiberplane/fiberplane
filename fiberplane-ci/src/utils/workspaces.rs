use std::cmp::Ordering;

use super::TomlNode;
use anyhow::{anyhow, Result};

pub fn get_crate_dir_from_name<'a>(
    all_crate_dirs: &'a [String],
    crate_name: &'_ str,
) -> Option<&'a str> {
    all_crate_dirs
        .into_iter()
        .find(|crate_dir| get_crate_name_from_dir(crate_dir) == crate_name)
        .map(String::as_str)
}

pub fn get_crate_name_from_dir(crate_dir: &str) -> &str {
    crate_dir.split('/').last().unwrap()
}

/// Returns the names of all the crates whose version numbers are tied to the
/// workspace version.
pub fn get_crates_using_workspace_version(crate_dirs: &[String]) -> Vec<&str> {
    crate_dirs
        .into_iter()
        .filter(|crate_dir| {
            TomlNode::from_file(format!("{crate_dir}/Cargo.toml"))
                .ok()
                .and_then(|node| node.get_bool("package.version.workspace"))
                .unwrap_or_default()
        })
        .map(String::as_str)
        .map(get_crate_name_from_dir)
        .collect()
}

pub fn get_workspace_crate_dirs() -> Result<Vec<String>> {
    TomlNode::from_file("Cargo.toml")?
        .get_string_array("workspace.members")
        .ok_or_else(|| anyhow!("Cannot determine workspace members"))
}

/// Sorts the crate dirs such that none of the crates depend on any others that
/// come after it. I.e. the first crate will have no dependencies, the second
/// may only depend on the first, etc..
pub fn sort_by_dependencies(crate_dirs: &[String]) -> Result<Vec<&str>> {
    let mut dirs_with_cargo_nodes = crate_dirs
        .iter()
        .map(|crate_dir| {
            TomlNode::from_file(&format!("{crate_dir}/Cargo.toml"))
                .map(|node| (crate_dir.as_str(), node))
        })
        .collect::<Result<Vec<(&str, TomlNode)>>>()?;

    dirs_with_cargo_nodes.sort_by(|(dir_a, node_a), (dir_b, node_b)| {
        let name_a = get_crate_name_from_dir(dir_a);
        if node_b.depends_on(name_a) {
            return Ordering::Less;
        }

        let name_b = get_crate_name_from_dir(dir_b);
        if node_a.depends_on(name_b) {
            return Ordering::Greater;
        }

        Ordering::Equal
    });

    Ok(dirs_with_cargo_nodes
        .iter()
        .map(|(name, _)| *name)
        .collect())
}
