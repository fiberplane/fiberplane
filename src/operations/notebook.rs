use crate::operations::{ApplyOperationState, CellRefWithIndex};
use crate::protocols::core::{Cell, NotebookDataSource, TimeRange};
use fp_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Serialize, Serializable)]
#[fp(rust_plugin_module = "fiberplane::operations")]
#[serde(rename_all = "snake_case")]
pub enum NotebookVisibility {
    Private,
    Public,
}

impl Default for NotebookVisibility {
    fn default() -> Self {
        Self::Private
    }
}

/// A notebook with all (meta)data included.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, Serializable)]
#[fp(rust_plugin_module = "fiberplane::operations")]
#[serde(rename_all = "camelCase")]
pub struct Notebook {
    pub id: String,
    pub cells: Vec<Cell>,
    pub data_sources: BTreeMap<String, NotebookDataSource>,
    pub read_only: bool,
    pub revision: u32,
    pub time_range: TimeRange,
    pub title: String,
    pub visibility: NotebookVisibility,
}

impl ApplyOperationState for Notebook {
    fn all_relevant_cells(&self) -> Vec<CellRefWithIndex> {
        self.cells
            .iter()
            .enumerate()
            .map(|(index, cell)| CellRefWithIndex {
                cell,
                index: index as u32,
            })
            .collect()
    }
}

impl Default for Notebook {
    fn default() -> Self {
        Self {
            id: "".to_owned(),
            cells: vec![],
            data_sources: BTreeMap::default(),
            read_only: false,
            revision: 0,
            time_range: TimeRange { from: 0.0, to: 0.0 },
            title: "".to_owned(),
            visibility: NotebookVisibility::Private,
        }
    }
}