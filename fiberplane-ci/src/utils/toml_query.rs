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
