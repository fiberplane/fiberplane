use crate::formatting::RichText;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use thiserror::Error;
use typed_builder::TypedBuilder;

const MIN_LENGTH: usize = 4;

/// Cell used for displaying tables in a notebook.
///
/// Tables have columns, which are tracked using [TableColumnDefinition]. The
/// column definition may specify a specific schema to be used for all values
/// in that column.
///
/// Tables also have [rows](TableRow), which are used for tracking all the data
/// in the table. Each row has multiple "row values" (we intentionally avoid the
/// term "cell" here, because it would be too confusing with the table cell
/// itself).
///
/// Row values have a specific data type, which should correspond to the type
/// specified in the [TableColumnDefinition].
///
/// Every row and every column inside a table has a unique ID. Those IDs can be
/// combined to create a [TableRowValueId]. [TableRowValueId] can be serialized
/// to be used inside the `field` of
/// [some operations](crate::notebooks::operations::ReplaceTextOperation::field)
/// as well as [focus types](crate::realtime::FocusPosition::field).
#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TableCell {
    #[builder(setter(into))]
    pub id: String,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,

    /// Describes the types used for the columns and the order they should be
    /// rendered in.
    #[builder(default, setter(into))]
    pub column_defs: Vec<TableColumnDefinition>,

    /// Holds the table rows and their values.
    #[builder(default, setter(into))]
    pub rows: Vec<TableRow>,
}

impl TableCell {
    /// Returns a reference to a column definition by [TableColumnId].
    pub fn column_def(&self, id: &TableColumnId) -> Option<&TableColumnDefinition> {
        self.column_defs.iter().find(|def| &def.id == id)
    }

    /// Returns a reference to a row by [TableRowId].
    pub fn row(&self, id: &TableRowId) -> Option<&TableRow> {
        self.rows.iter().find(|row| &row.id == id)
    }

    /// Returns a reference to a row value.
    pub fn row_value(&self, id: &TableRowValueId) -> Option<&TableRowValue> {
        let row = self.row(id.row_id());
        let value_index = self
            .column_defs
            .iter()
            .position(|def| &def.id == id.column_id());
        match (row, value_index) {
            (Some(row), Some(value_index)) => row.values.get(value_index),
            _ => None,
        }
    }

    /// Returns the table cell with an updated row value for the given field.
    pub fn with_row_value(&self, field: &str, mut updated_value: TableRowValue) -> Self {
        let Ok(id) = TableRowValueId::from_str(field) else {
            return self.clone();
        };

        let Some(column_index) = self
            .column_defs
            .iter()
            .position(|column_def| &column_def.id == id.column_id())
        else {
            return self.clone();
        };

        let rows = self
            .rows
            .iter()
            .map(|row| match &row.id == id.row_id() {
                true => TableRow {
                    id: row.id.clone(),
                    values: row
                        .values
                        .iter()
                        .enumerate()
                        .map(|(i, value)| match i == column_index {
                            // We use `mem::replace()` to avoid cloning, because
                            // the borrow checker thinks we might move from
                            // `updated_value` multiple times, even though we
                            // know it'll happen only once since `field`
                            // identifies a unique table row value.
                            true => std::mem::replace(
                                &mut updated_value,
                                TableRowValue::Text(RichText::default()),
                            ),
                            false => value.clone(),
                        })
                        .collect(),
                },
                false => row.clone(),
            })
            .collect();

        Self {
            id: self.id.clone(),
            column_defs: self.column_defs.clone(),
            read_only: self.read_only,
            rows,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TableColumnDefinition {
    /// ID of the column.
    pub id: TableColumnId,

    /// Heading text to be displayed at the top of the column.
    #[builder(setter(into))]
    pub title: String,
}

/// This is an automatically generated ID that is added to every column in a
/// table cell.
///
/// Table column IDs are used to refer to column definitions in the table.
/// They can also be combined with a [TableRowId] to create a [TableRowItemId].
///
/// Column IDs may only contain alphanumeric characters and must be unique
/// within a table.
#[derive(Debug, Clone, Deserialize, Eq, Ord, PartialEq, PartialOrd, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
pub struct TableColumnId(String);

impl std::fmt::Display for TableColumnId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl FromStr for TableColumnId {
    type Err = InvalidTableId;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        validate_id(s).map(|_| Self(s.to_owned()))
    }
}

#[derive(Debug, Clone, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
pub struct TableRow {
    /// ID of the row.
    pub id: TableRowId,

    /// The values inside this row.
    ///
    /// The types, order, and amount of the values should match the table's
    /// [column definitions](TableCell::column_defs).
    #[builder(setter(into))]
    pub values: Vec<TableRowValue>,
}

/// This is an automatically generated ID that is added to every row in a table
/// cell.
///
/// Table row IDs are used to refer to rows in the table. They can also be
/// combined with a [TableColumnId] to create a [TableRowValueId].
///
/// Row IDs may only contain alphanumeric characters and must be unique within a
/// table.
#[derive(Debug, Clone, Deserialize, Eq, Ord, PartialEq, PartialOrd, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
pub struct TableRowId(String);

impl std::fmt::Display for TableRowId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl FromStr for TableRowId {
    type Err = InvalidTableId;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        validate_id(s).map(|_| Self(s.to_owned()))
    }
}

/// One of the values stored in a [TableRow].
///
/// We intentionally avoid the term "cell" here, because it would be too
/// confusing with the table cell itself.
///
/// Row values can be looked up by [ID](TableRowValueId), although the ID is not
/// stored in the row value itself. Instead, it can be created from the row ID
/// and column ID.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum TableRowValue {
    Text(RichText),
}

/// This is a compound ID based on the row ID and column ID that together
/// identify a row value.
///
/// Table row value IDs are used to refer to [row values](TableRowValue). They
/// are not stored in the [TableCell] data structure, but are used in serialized
/// form to refer to row values inside the `field` of
/// [some operations](crate::notebooks::operations::ReplaceTextOperation::field)
/// as well as [focus types](crate::realtime::FocusPosition::field).
#[derive(Debug, Clone, Deserialize, Eq, Ord, PartialEq, PartialOrd, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
pub struct TableRowValueId(TableRowId, TableColumnId);

impl TableRowValueId {
    /// Creates a new value ID from a [TableRowId] and [TableColumnId].
    pub fn new(row_id: TableRowId, column_id: TableColumnId) -> Self {
        Self(row_id, column_id)
    }

    pub fn row_id(&self) -> &TableRowId {
        &self.0
    }

    pub fn column_id(&self) -> &TableColumnId {
        &self.1
    }
}

impl std::fmt::Display for TableRowValueId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{};{}", self.0, self.1)
    }
}

impl FromStr for TableRowValueId {
    type Err = InvalidTableId;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.split_once(';') {
            Some((before, after)) => Ok(Self::new(
                TableRowId::from_str(before)?,
                TableColumnId::from_str(after)?,
            )),
            None => Err(InvalidTableId::MissingSeparator),
        }
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
pub enum InvalidTableId {
    #[error("table IDs must be at least 6 characters in length")]
    TooShort,
    #[error("table IDs may only contain alpha-numeric characters")]
    InvalidCharacters,
    #[error("row ID and column ID must be separated by a semicolon")]
    MissingSeparator,
}

fn validate_id(id: &str) -> Result<(), InvalidTableId> {
    if id.len() < MIN_LENGTH {
        return Err(InvalidTableId::TooShort);
    }

    if id.chars().any(|c| !c.is_ascii_alphanumeric()) {
        return Err(InvalidTableId::InvalidCharacters);
    }

    Ok(())
}
