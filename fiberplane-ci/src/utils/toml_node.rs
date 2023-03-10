use anyhow::Context;
use std::fs;
use std::path::Path;
use taplo::dom::node::Table;
use taplo::dom::{Keys, Node};

/// A node in a TOML document that we can query on.
#[derive(Clone, Debug)]
pub struct TomlNode {
    pub(crate) node: Node,
}

impl TomlNode {
    /// Parses the given TOML string into a node.
    pub fn from_file<P>(path: P) -> anyhow::Result<Self>
    where
        P: AsRef<Path>,
    {
        let toml = fs::read_to_string(path.as_ref()).context("Cannot read Cargo file")?;
        Self::parse(&toml)
    }

    /// Parses the given TOML string into a node.
    pub fn parse(toml: &str) -> anyhow::Result<Self> {
        let parse_result = taplo::parser::parse(toml);
        if let Some(error) = parse_result.errors.first() {
            return Err(error.clone()).context("Parse error");
        }

        let root = parse_result.into_dom();
        Ok(Self { node: root })
    }

    /// Returns whether this node contains a dependency for the given crate.
    pub fn depends_on(&self, crate_name: &str) -> bool {
        match self.get_dependencies() {
            Some(dependencies) => dependencies.get(crate_name).is_some(),
            None => false,
        }
    }

    /// Returns all the nodes and their keys that match the given path.
    pub fn find_all_matches(
        &self,
        path: &str,
    ) -> Option<impl Iterator<Item = (Keys, Node)> + ExactSizeIterator> {
        let keys = path.parse::<Keys>().ok()?;
        self.node.find_all_matches(keys, false).ok()
    }

    /// Returns the first node that match the given path.
    pub fn find_first_match(&self, path: &str) -> Option<Node> {
        let mut matches = self.find_all_matches(path)?;
        let (_, node) = matches.next()?;
        Some(node)
    }

    /// Returns the boolean value at the given path, if any.
    pub fn get_bool(&self, path: &str) -> Option<bool> {
        let node = self.find_first_match(path)?;
        node.as_bool().map(|bool| bool.value())
    }

    /// Returns the table with all dependencies.
    pub fn get_dependencies(&self) -> Option<Table> {
        self.get_table("dependencies")
            .or_else(|| self.get_table("workspace.dependencies"))
    }

    /// Returns the node that is used for configuring a patch version of the
    /// given dependency.
    pub fn get_patch(&self, dependency_name: &str) -> Option<(Keys, Node)> {
        let mut matches = self.find_all_matches(&format!("patch.*.{dependency_name}"))?;
        matches.next()
    }

    /// Returns the string value at the given path, if any.
    pub fn get_string(&self, path: &str) -> Option<String> {
        let node = self.find_first_match(path)?;
        node.as_str().map(|str| str.value().into())
    }

    /// Returns the array with string values at the given path, if any.
    pub fn get_string_array(&self, path: &str) -> Option<Vec<String>> {
        let node = self.find_first_match(path)?;
        node.as_array().map(|array| {
            array
                .items()
                .get()
                .iter()
                .filter_map(Node::as_str)
                .map(|str| str.value().into())
                .collect()
        })
    }

    /// Returns the table at the given path, if any.
    pub fn get_table(&self, path: &str) -> Option<Table> {
        let node = self.find_first_match(path)?;
        node.as_table().cloned()
    }
}

#[cfg(test)]
mod tests {
    use super::TomlNode;

    #[test]
    fn test_depends_on() {
        let workspace_toml = r#"[workspace]
members = [
    "base64uuid",
    "fiberplane",
    "fiberplane-api-client",
    "fiberplane-provider-protocol/fiberplane-provider-bindings",
]

[workspace.package]
version = "1.0.0-alpha.1"
authors = ["Fiberplane <info@fiberplane.com>"]
edition = "2021"
license = "MIT OR Apache-2.0"
repository = "https://github.com/fiberplane/fiberplane"
rust-version = "1.64"

[workspace.dependencies]
base64uuid = { version = "1.0.0", path = "base64uuid", default-features = false }
bytes = "1"
fp-bindgen = { version = "3.0.0-alpha.1" }
fiberplane = { version = "1.0.0-alpha.1", path = "fiberplane" }
fiberplane-api-client = { version = "1.0.0-alpha.1", path = "fiberplane-api-client" }
once_cell = { version = "1.8" }
vergen = { version = "7.4.2", default-features = false, features = [
    "build",
    "git",
] }

[patch.crates-io]
#fp-bindgen = { git = "ssh://git@github.com/fiberplane/fp-bindgen.git", branch = "main" }
#fp-bindgen = { path = "../fp-bindgen/fp-bindgen" }
"#;

        let node = TomlNode::parse(workspace_toml).unwrap();
        assert!(node.depends_on("fp-bindgen"));
        assert!(!node.depends_on("fiberplane-models"));
    }
}
