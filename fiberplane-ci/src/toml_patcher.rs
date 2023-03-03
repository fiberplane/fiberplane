// This file is based on: https://github.com/tamasfe/taplo/blob/master/crates/taplo/src/dom/rewrite.rs
// Copyright (c) 2020 Ferenc Tamás
// MIT License

use std::ops::Range;
use taplo::dom::node::{DomNode, Table};
use taplo::dom::rewrite::{Error, PendingPatch, PendingPatchKind};
use taplo::dom::{Keys, Node};
use taplo::rowan::TextRange;
use taplo::syntax::SyntaxKind;

#[derive(Debug)]
pub struct TomlPatcher {
    root: Node,
    patches: Vec<PendingPatch>,
}

impl TomlPatcher {
    pub fn new(root: Node) -> Result<Self, Error> {
        if !matches!(root.syntax().map(|s| s.kind()), Some(SyntaxKind::ROOT)) {
            return Err(Error::RootNodeExpected);
        }

        Ok(Self {
            root,
            patches: Default::default(),
        })
    }

    pub fn add(&mut self, patch: impl Into<Patch>) -> Result<&mut Self, Error> {
        let patch = patch.into();
        match patch {
            Patch::Replace { path, value } => {
                let keys = path.parse::<Keys>()?;
                let nodes = self.root.find_all_matches(keys, false)?;

                for (_, node) in nodes {
                    let Some(mut range) = node.syntax().map(|s| s.text_range()) else {
                        continue;
                    };

                    // If we're replacing a table, replace the entries too.
                    if let Some(table) = node.as_table() {
                        if let Some(last_entry_range) = table
                            .entries()
                            .get()
                            .iter()
                            .last()
                            .and_then(|(_, node)| node.syntax())
                            .map(|s| s.text_range())
                        {
                            range = TextRange::new(range.start(), last_entry_range.end());
                        }
                    }

                    self.check_overlap(range)?;

                    self.patches.push(PendingPatch {
                        range,
                        kind: PendingPatchKind::Replace(value.clone().into()),
                    })
                }
            }
        }

        self.patches
            .sort_by(|a, b| b.range.start().cmp(&a.range.start()));

        Ok(self)
    }

    pub fn patches(&self) -> &[PendingPatch] {
        &self.patches
    }

    fn check_overlap(&self, range: TextRange) -> Result<(), Error> {
        for patch in self.patches() {
            if patch.range.contains_range(range)
                || range.contains_range(patch.range)
                || patch.range.contains(range.start())
                || patch.range.contains(range.end())
            {
                return Err(Error::Overlap);
            }
        }

        Ok(())
    }

    /// Comments out a single key in the table at the given path, and runs a
    /// custom replacer function on the associated value.
    pub fn comment_out_table_key_and_replace_value<F>(
        &mut self,
        path: &str,
        key: &str,
        replacer: F,
    ) -> Result<&mut Self, Error>
    where
        F: Fn(String) -> String,
    {
        let keys = path.parse::<Keys>()?;
        let header = keys.to_string();

        let table = self.get_table(path).ok_or(Error::ExpectedTable)?;
        let entries = table
            .entries()
            .get()
            .iter()
            .map(|(k, node)| {
                let prefix = if k.value() == key { "#" } else { "" };
                let value = if k.value() == key {
                    replacer(node.to_string())
                } else {
                    node.to_string()
                };
                format!("{prefix}{k} = {value}")
            })
            .collect::<Vec<_>>()
            .join("\n");

        self.set_raw(path, format!("[{header}]\n{entries}"))
    }

    /// Returns the boolean value at the given path, if any.
    pub fn get_bool(&self, path: &str) -> Option<bool> {
        let keys = path.parse::<Keys>().ok()?;
        let mut matches = self.root.find_all_matches(keys, false).ok()?;
        let (_, node) = matches.next()?;
        node.as_bool().map(|bool| bool.value())
    }

    /// Returns the node that is used for configuring a patch version of the
    /// given dependency.
    pub fn get_patch(&self, dependency_name: &str) -> Option<(Keys, Node)> {
        let keys = format!("patch.*.{dependency_name}").parse::<Keys>().ok()?;
        let mut matches = self.root.find_all_matches(keys, false).ok()?;
        matches.next()
    }

    /// Returns the string value at the given path, if any.
    pub fn get_string(&self, path: &str) -> Option<String> {
        let keys = path.parse::<Keys>().ok()?;
        let mut matches = self.root.find_all_matches(keys, false).ok()?;
        let (_, node) = matches.next()?;
        node.as_str().map(|str| str.value().into())
    }

    /// Returns the table at the given path, if any.
    pub fn get_table(&self, path: &str) -> Option<Table> {
        let keys = path.parse::<Keys>().ok()?;
        let mut matches = self.root.find_all_matches(keys, false).ok()?;
        let (_, node) = matches.next()?;
        node.as_table().cloned()
    }

    /// Replaces the node at the given path with a raw, TOML-formatted, string.
    pub fn set_raw(
        &mut self,
        path: impl Into<String>,
        raw: impl Into<String>,
    ) -> Result<&mut Self, Error> {
        self.add(Patch::Replace {
            path: path.into(),
            value: raw.into(),
        })
    }

    /// Replaces the node at the given path with a string value.
    pub fn set_string(
        &mut self,
        path: impl Into<String>,
        value: impl AsRef<str>,
    ) -> Result<&mut Self, Error> {
        self.set_raw(
            path,
            format!(
                r#""{}""#,
                value.as_ref().replace("\\", "\\\\").replace('"', "\\\"")
            ),
        )
    }
}

impl core::fmt::Display for TomlPatcher {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut string = self.root.syntax().unwrap().to_string();

        for patch in &self.patches {
            match &patch.kind {
                PendingPatchKind::Replace(to) => {
                    string.replace_range(std_range(patch.range), to);
                }
                _ => return Err(std::fmt::Error),
            }
        }

        string.fmt(f)
    }
}

#[derive(Debug)]
pub enum Patch {
    Replace { path: String, value: String },
}

fn std_range(range: TextRange) -> Range<usize> {
    let start: usize = u32::from(range.start()) as usize;
    let end: usize = u32::from(range.end()) as usize;
    start..end
}
