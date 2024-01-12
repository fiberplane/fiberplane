use crate::data_sources::SelectedDataSource;
use crate::formatting::Formatting;
use crate::front_matter_schemas::{FrontMatterSchemaEntry, FrontMatterValueSchema};
use crate::notebooks::{Cell, FrontMatter, Label};
use crate::timestamps::TimeRange;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use typed_builder::TypedBuilder;

/// An operation is the representation for a mutation to be performed to a notebook.
///
/// Operations are intended to be atomic (they should either be performed in their entirety or not
/// at all), while also capturing the intent of the user.
///
/// For more information, please see RFC 8:
///   https://www.notion.so/fiberplane/RFC-8-Notebook-Operations-f9d18676d0d9437d81de30faa219deb4
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Operation {
    MoveCells(MoveCellsOperation),
    ReplaceCells(ReplaceCellsOperation),
    ReplaceText(ReplaceTextOperation),
    UpdateNotebookTimeRange(UpdateNotebookTimeRangeOperation),
    /// **Deprecated:** Please use `ReplaceText` with `cell_id == TITLE_CELL_ID` instead.
    UpdateNotebookTitle(UpdateNotebookTitleOperation),
    SetSelectedDataSource(SetSelectedDataSourceOperation),
    AddLabel(AddLabelOperation),
    ReplaceLabel(ReplaceLabelOperation),
    RemoveLabel(RemoveLabelOperation),
    /// **Deprecated:** Full front matter updates should be avoided, granular update operations are
    /// better for conflict handling.
    UpdateFrontMatter(UpdateFrontMatterOperation),
    ClearFrontMatter(ClearFrontMatterOperation),
    InsertFrontMatterSchema(InsertFrontMatterSchemaOperation),
    UpdateFrontMatterSchema(UpdateFrontMatterSchemaOperation),
    MoveFrontMatterSchema(MoveFrontMatterSchemaOperation),
    RemoveFrontMatterSchema(RemoveFrontMatterSchemaOperation),
}

/// Moves one or more cells.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct MoveCellsOperation {
    /// IDs of all the cells to be moved.
    ///
    /// These must be adjacent and given in the order they appear in the notebook.
    pub cell_ids: Vec<String>,

    /// Index the cells will be moved from. This is the index of the first cell before the move.
    pub from_index: u32,

    /// Index the cells will be moved to. This is the index of the first cell after the move.
    pub to_index: u32,
}

/// Replaces one or more cells at once.
///
/// Note: This operation is relatively coarse and can be (ab)used to perform
/// `ReplaceText` operations as well. In order to preserve intent as much as
/// possible, please use `ReplaceText` where possible.
///
/// Note: This operation may not be used to move cells, other than the necessary
/// corrections in cell indices that account for newly inserted and removed
/// cells. Attempts to move cells to other indices will cause validation to
/// fail.
#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ReplaceCellsOperation {
    /// Vector of the new cells, including their new indices.
    ///
    /// Indices of the new cells must be ordered incrementally to form a single,
    /// cohesive range of cells.
    ///
    /// Note that "new" does not imply "newly inserted". If a cell with the same
    /// ID is part of the `old_cells` field, it will merely be updated. Only
    /// cells in the `new_cells` field that are not part of the `old_cells` will
    /// be newly inserted.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub new_cells: Vec<CellWithIndex>,

    /// Vector of the old cells, including their old indices.
    ///
    /// Indices of the old cells must be ordered incrementally to form a single,
    /// cohesive range of cells.
    ///
    /// Note that "old" does not imply "removed". If a cell with the same
    /// ID is part of the `new_cells` field, it will merely be updated. Only
    /// cells in the `old_cells` field that are not part of the `new_cells` will
    /// be removed.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub old_cells: Vec<CellWithIndex>,

    /// Offset at which to split the first of the old cells.
    ///
    /// In this context, splitting means that the text of the cell in the
    /// notebook is split in two at the split offset. The first part is kept,
    /// while the second part (which must match the cell's text in `old_cells`)
    /// is replaced with the text given in the first of the `new_cells`.
    ///
    /// If `None`, no cell is split.
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub split_offset: Option<u32>,

    /// Offset from which to merge the remainder of the last old cell.
    ///
    /// In this context, merging means that the text of the new cell is merged
    /// from two parts. The first part comes the last of the `new_cells`, while
    /// the second part is what remains of the cell in the notebook after the
    /// merge offset.
    ///
    /// If `None`, no cells are merged.
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub merge_offset: Option<u32>,

    /// Optional cells which are updated as a result of the replacing of other
    /// cells. This is intended to be used for cells that reference the
    /// `new_cells` and which now need to be updated as a result of the
    /// operation being applied to those cells.
    ///
    /// These referencing cells may also be newly inserted if they are not
    /// included in the `old_referencing_cells`.
    ///
    /// Indices of new referencing cells do not need to form a cohesive range,
    /// but they should still be ordered in ascending order.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub new_referencing_cells: Vec<CellWithIndex>,

    /// Optional cells which are updated as a result of the replacing of other
    /// cells. This is intended to be used for cells that reference the
    /// `old_cells` and which now need to be updated as a result of the
    /// operation being applied to those cells.
    ///
    /// These referencing cells may also be removed if they are not included in
    /// the `new_referencing_cells`.
    ///
    /// Indices of old referencing cells do not need to form a cohesive range,
    /// but they should still be ordered in ascending order.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub old_referencing_cells: Vec<CellWithIndex>,
}

impl ReplaceCellsOperation {
    /// Returns all the new cell IDs, including the ones in the
    /// `new_referencing_cells` field.
    pub fn all_newly_inserted_cells(&self) -> impl Iterator<Item = &CellWithIndex> {
        self.newly_inserted_cells()
            .chain(self.newly_inserted_referencing_cells())
    }

    /// Returns all the old cell IDs, including the ones in the
    /// `old_referencing_cells` field.
    pub fn all_old_cells(&self) -> impl Iterator<Item = &CellWithIndex> {
        self.old_cells
            .iter()
            .chain(self.old_referencing_cells.iter())
    }

    /// Returns all the old removed cell IDs, including the ones from the
    /// `old_referencing_cells` field.
    pub fn all_old_removed_cells(&self) -> impl Iterator<Item = &CellWithIndex> {
        self.old_removed_cells()
            .chain(self.old_removed_referencing_cells())
    }

    /// Returns all newly inserted cells, excluding referencing cells.
    pub fn newly_inserted_cells(&self) -> impl Iterator<Item = &CellWithIndex> {
        self.new_cells.iter().filter(move |new_cell| {
            !self
                .old_cells
                .iter()
                .any(|old_cell| old_cell.id() == new_cell.id())
        })
    }

    /// Returns all newly inserted referencing cells.
    pub fn newly_inserted_referencing_cells(&self) -> impl Iterator<Item = &CellWithIndex> {
        self.new_referencing_cells.iter().filter(move |new_cell| {
            !self
                .old_referencing_cells
                .iter()
                .any(|old_cell| old_cell.id() == new_cell.id())
        })
    }

    /// Returns all old cells that will be removed, excluding referencing cells.
    pub fn old_removed_cells(&self) -> impl Iterator<Item = &CellWithIndex> {
        self.old_cells.iter().filter(move |old_cell| {
            !self
                .new_cells
                .iter()
                .any(|new_cell| new_cell.id() == old_cell.id())
        })
    }

    /// Returns all old referencing cells that will be removed.
    pub fn old_removed_referencing_cells(&self) -> impl Iterator<Item = &CellWithIndex> {
        self.old_referencing_cells.iter().filter(move |old_cell| {
            !self
                .new_referencing_cells
                .iter()
                .any(|new_cell| new_cell.id() == old_cell.id())
        })
    }
}

/// Replaces the part of the content in any content type cell or the title of a graph cell.
#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ReplaceTextOperation {
    /// ID of the cell whose text we're modifying.
    #[builder(setter(into))]
    pub cell_id: String,

    /// Field to update the text of.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub field: Option<String>,

    /// Starting offset where we will be replacing the text.
    ///
    /// Please be aware this offset refers to the position of a Unicode Scalar Value (non-surrogate
    /// codepoint) in the cell text, which may require additional effort to determine correctly.
    pub offset: u32,

    /// The new text value we're inserting.
    #[builder(default, setter(into))]
    pub new_text: String,

    /// Optional formatting that we wish to apply to the new text.
    ///
    /// Offsets in the formatting are relative to the start of the new text.
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub new_formatting: Option<Formatting>,

    /// The old text that we're replacing.
    #[builder(default, setter(into))]
    pub old_text: String,

    /// Optional formatting that was applied to the old text. This should be **all** the formatting
    /// annotations that were *inside* the `old_text` before this operation was applied. However,
    /// it is at the operation's discretion whether or not to include annotations that are at the
    /// old text's boundaries.
    ///
    /// Offsets in the formatting are relative to the start of the old text.
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub old_formatting: Option<Formatting>,
}

/// Updates the notebook time range.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateNotebookTimeRangeOperation {
    pub old_time_range: TimeRange,
    pub time_range: TimeRange,
}

/// Updates the notebook title.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateNotebookTitleOperation {
    #[builder(default, setter(into))]
    pub old_title: String,

    #[builder(default, setter(into))]
    pub title: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SetSelectedDataSourceOperation {
    #[builder(setter(into))]
    pub provider_type: String,

    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub old_selected_data_source: Option<SelectedDataSource>,

    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub new_selected_data_source: Option<SelectedDataSource>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct CellWithIndex {
    pub cell: Cell,
    pub index: u32,
}

impl CellWithIndex {
    pub fn new(cell: Cell, index: u32) -> CellWithIndex {
        CellWithIndex { cell, index }
    }

    pub fn formatting(&self) -> Option<&Formatting> {
        self.cell.formatting()
    }

    pub fn id(&self) -> &str {
        self.cell.id()
    }

    pub fn text(&self) -> Option<&str> {
        self.cell.text()
    }
}

/// Add an label to an notebook.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct AddLabelOperation {
    /// The new label
    pub label: Label,
}

/// Replace an label in an notebook.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ReplaceLabelOperation {
    // The previous label
    pub old_label: Label,

    // The new label
    pub new_label: Label,
}

/// Remove an label in an notebook.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct RemoveLabelOperation {
    pub label: Label,
}

/// Replaces front matter in a notebook
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateFrontMatterOperation {
    pub old_front_matter: FrontMatter,
    pub new_front_matter: FrontMatter,
}

/// Removes front matter in a notebook
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ClearFrontMatterOperation {
    pub front_matter: FrontMatter,
}

/// Adds front matter entries in a notebook
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct InsertFrontMatterSchemaOperation {
    // NOTE: No strip_option here because the strongly typed builder makes
    // it hard to revert operations in fiberplane-ot otherwise
    /// The Front Matter Schema key that is just before the insertion point. This
    /// is solely used for consistency checks when validating the operation.
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub key_of_entry_before_insertion_location: Option<String>,

    /// The Front Matter Schema key that is just after the insertion point. This
    /// is solely used for consistency checks when validating the operation.
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub key_of_entry_after_insertion_location: Option<String>,

    /// The index to insert the new front matter schema into
    pub to_index: u32,

    /// The new entries to add to the front matter schema, with their new values
    pub insertions: Vec<FrontMatterSchemaRow>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[serde(rename_all = "camelCase")]
#[non_exhaustive]
pub struct FrontMatterSchemaRow {
    #[builder(setter(into))]
    pub key: String,

    #[builder(setter(into))]
    pub schema: FrontMatterValueSchema,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[builder(default, setter(into))]
    pub value: Option<Value>,
}

impl From<(FrontMatterSchemaEntry, Option<Value>)> for FrontMatterSchemaRow {
    fn from((schema, value): (FrontMatterSchemaEntry, Option<Value>)) -> Self {
        Self {
            key: schema.key,
            schema: schema.schema,
            value,
        }
    }
}

/// Changes the expected schema of a front matter key in a notebook and/or the
/// value attached to a schema
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UpdateFrontMatterSchemaOperation {
    /// The key of the front matter schema to update.
    #[builder(setter(into))]
    pub key: String,

    /// The previous schema used for that front matter key. The old value is used
    /// to make consistency checks, as well as revert the operation.
    #[builder(setter(into))]
    pub old_schema: FrontMatterValueSchema,

    // NOTE: No strip_option here because the strongly typed builder makes
    // it hard to revert operations in fiberplane-ot otherwise
    /// The previous value for that front matter key. It is used for consistency checks,
    /// as well as making reverting operations possible.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub old_value: Option<Value>,

    // NOTE: No strip_option here because the strongly typed builder makes
    // it hard to revert operations in fiberplane-ot otherwise
    /// The new schema to use, if unspecified the operation will leave the schema
    /// untouched (so the operation is only being used to edit the associated value).
    ///
    /// If a new schema is specified, and the data type does _not_ match between the
    /// old and the new one, then the old value will be wiped anyway.
    #[builder(setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub new_schema: Option<FrontMatterValueSchema>,

    /// The new value to set for the front matter entry.
    ///
    /// If this attribute is `None` or `null` it can mean multiple things depending on
    /// the other attributes:
    /// - if `delete_value` is `false`, this means we want to keep the `old_value`
    ///   + it is impossible to keep the `old_value` if the schemas are incompatible. In that
    ///     case we use the `default_value` of the new schema (or nothing if there’s no default)
    /// - if `delete_value` is `true`, this means we want to wipe the value from the front
    ///   matter in all cases.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub new_value: Option<Value>,

    /// Switch that controls front matter value edition alongside `new_value`, when
    /// `new_value` is None.
    #[builder(setter(strip_bool))]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub delete_value: bool,
}

/// Moves front matter entries in a notebook
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct MoveFrontMatterSchemaOperation {
    /// The keys that will be moved in the front matter. They should be a range of
    /// consecutive front matter entries, matching the existing front matter schema
    /// at the index pointed to by `from_index`
    pub keys: Vec<String>,

    /// Index the key will be moved from. This is the index of the first front matter key before the move.
    pub from_index: u32,

    /// Index the key will be moved to. This is the index of the first front matter key after the move.
    pub to_index: u32,
}

/// Removes front matter entries in a notebook
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct RemoveFrontMatterSchemaOperation {
    /// The key of the front matter schema element lying just before the deletion range, i.e. _not_ removed.
    /// This is used to make consistency checks when validating operation.
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub key_of_entry_before_deletion_range: Option<String>,

    /// The key of the front matter schema element lying just after the deletion range, i.e. _not_ removed.
    /// This is used to make consistency checks when validating operation.
    #[builder(default, setter(into))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub key_of_entry_after_deletion_range: Option<String>,

    /// The index to start removing elements from. This is the index of the first element that will be
    /// deleted, and should match the first element of the `deletions` array.
    pub from_index: u32,

    /// Elements that should be deleted, with their last known values
    pub deletions: Vec<FrontMatterSchemaRow>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct CellAppendText {
    #[builder(setter(into))]
    pub content: String,

    #[builder(default)]
    #[serde(default)]
    pub formatting: Formatting,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::operations")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct CellReplaceText {
    /// Starting offset where we will be replacing the text.
    ///
    /// Please be aware this offset refers to the position of a Unicode Scalar Value (non-surrogate
    /// codepoint) in the cell text, which may require additional effort to determine correctly.
    pub offset: u32,

    /// The new text value we're inserting.
    #[builder(default, setter(into))]
    pub new_text: String,

    /// Optional formatting that we wish to apply to the new text.
    ///
    /// Offsets in the formatting are relative to the start of the new text.
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub new_formatting: Option<Formatting>,

    /// The old text that we're replacing.
    #[builder(default, setter(into))]
    pub old_text: String,

    /// Optional formatting that was applied to the old text. This should be **all** the formatting
    /// annotations that were *inside* the `old_text` before this operation was applied. However,
    /// it is at the operation's discretion whether or not to include annotations that are at the
    /// old text's boundaries.
    ///
    /// Offsets in the formatting are relative to the start of the old text.
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub old_formatting: Option<Formatting>,
}
