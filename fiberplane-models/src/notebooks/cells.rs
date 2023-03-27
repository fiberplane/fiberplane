use crate::blobs::EncodedBlob;
use crate::formatting::Formatting;
pub use crate::labels::Label;
use crate::query_data::{has_query_data, set_query_field, unset_query_field};
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use typed_builder::TypedBuilder;

/// Representation of a single notebook cell.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Cell {
    Checkbox(CheckboxCell),
    Code(CodeCell),
    Discussion(DiscussionCell),
    Divider(DividerCell),
    Graph(GraphCell),
    Heading(HeadingCell),
    Image(ImageCell),
    ListItem(ListItemCell),
    Log(LogCell),
    Provider(ProviderCell),
    Table(TableCell),
    Timeline(TimelineCell),
    Text(TextCell),
}

impl Cell {
    /// Returns the cell's content, if any.
    pub fn content(&self) -> Option<&str> {
        match self {
            Cell::Checkbox(cell) => Some(&cell.content),
            Cell::Code(cell) => Some(&cell.content),
            Cell::Discussion(_) => None,
            Cell::Divider(_) => None,
            Cell::Graph(_) => None,
            Cell::Heading(cell) => Some(&cell.content),
            Cell::Image(_) => None,
            Cell::ListItem(cell) => Some(&cell.content),
            Cell::Log(_) => None,
            Cell::Provider(_) => None,
            Cell::Table(_) => None,
            Cell::Text(cell) => Some(&cell.content),
            Cell::Timeline(_) => None,
        }
    }

    /// Returns the cell's formatting, if any.
    pub fn formatting(&self) -> Option<&Formatting> {
        match self {
            Cell::Code(_)
            | Cell::Discussion(_)
            | Cell::Divider(_)
            | Cell::Graph(_)
            | Cell::Image(_)
            | Cell::Log(_)
            | Cell::Provider(_)
            | Cell::Table(_)
            | Cell::Timeline(_) => None,
            Cell::Checkbox(cell) => Some(&cell.formatting),
            Cell::Heading(cell) => Some(&cell.formatting),
            Cell::ListItem(cell) => Some(&cell.formatting),
            Cell::Text(cell) => Some(&cell.formatting),
        }
    }

    pub fn supports_formatting(&self) -> bool {
        match self {
            Cell::Code(_)
            | Cell::Discussion(_)
            | Cell::Divider(_)
            | Cell::Graph(_)
            | Cell::Image(_)
            | Cell::Log(_)
            | Cell::Table(_)
            | Cell::Timeline(_) => false,
            Cell::Checkbox(_)
            | Cell::Heading(_)
            | Cell::ListItem(_)
            | Cell::Provider(_)
            | Cell::Text(_) => true,
        }
    }

    /// Returns the cell's ID.
    pub fn id(&self) -> &str {
        match self {
            Cell::Checkbox(cell) => &cell.id,
            Cell::Code(cell) => &cell.id,
            Cell::Discussion(cell) => &cell.id,
            Cell::Divider(cell) => &cell.id,
            Cell::Graph(cell) => &cell.id,
            Cell::Heading(cell) => &cell.id,
            Cell::Image(cell) => &cell.id,
            Cell::ListItem(cell) => &cell.id,
            Cell::Log(cell) => &cell.id,
            Cell::Provider(cell) => &cell.id,
            Cell::Table(cell) => &cell.id,
            Cell::Text(cell) => &cell.id,
            Cell::Timeline(cell) => &cell.id,
        }
    }

    /// Returns the cell's text, if any.
    pub fn text(&self) -> Option<&str> {
        self.content()
    }

    /// Returns a copy of the cell with a new ID.
    #[must_use]
    pub fn with_id(&self, id: &str) -> Self {
        match self {
            Cell::Checkbox(cell) => Cell::Checkbox(CheckboxCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Code(cell) => Cell::Code(CodeCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Discussion(cell) => Cell::Discussion(DiscussionCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Divider(cell) => Cell::Divider(DividerCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Graph(cell) => Cell::Graph(GraphCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Heading(cell) => Cell::Heading(HeadingCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Image(cell) => Cell::Image(ImageCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::ListItem(cell) => Cell::ListItem(ListItemCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Log(cell) => Cell::Log(LogCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Provider(cell) => Cell::Provider(ProviderCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Table(cell) => Cell::Table(TableCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Text(cell) => Cell::Text(TextCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
            Cell::Timeline(cell) => Cell::Timeline(TimelineCell {
                id: id.to_owned(),
                ..cell.clone()
            }),
        }
    }

    /// Returns a copy of the cell with its text replaced by the given text,
    /// without any formatting.
    #[must_use]
    pub fn with_text(&self, text: impl Into<String>) -> Self {
        match self {
            Cell::Checkbox(cell) => Cell::Checkbox(CheckboxCell {
                id: cell.id.clone(),
                content: text.into(),
                formatting: Formatting::default(),
                ..*cell
            }),
            Cell::Code(cell) => Cell::Code(CodeCell {
                id: cell.id.clone(),
                content: text.into(),
                syntax: cell.syntax.clone(),
                ..*cell
            }),
            Cell::Discussion(cell) => Cell::Discussion(cell.clone()),
            Cell::Divider(cell) => Cell::Divider(cell.clone()),
            Cell::Graph(cell) => Cell::Graph(cell.clone()),
            Cell::Heading(cell) => Cell::Heading(HeadingCell {
                id: cell.id.clone(),
                content: text.into(),
                formatting: Formatting::default(),
                ..*cell
            }),
            Cell::Image(cell) => Cell::Image(cell.clone()),
            Cell::ListItem(cell) => Cell::ListItem(ListItemCell {
                id: cell.id.clone(),
                content: text.into(),
                formatting: Formatting::default(),
                ..*cell
            }),
            Cell::Log(cell) => Cell::Log(cell.clone()),
            Cell::Provider(cell) => Cell::Provider(cell.clone()),
            Cell::Table(cell) => Cell::Table(cell.clone()),
            Cell::Text(cell) => Cell::Text(TextCell {
                id: cell.id.clone(),
                content: text.into(),
                formatting: Formatting::default(),
                ..*cell
            }),
            Cell::Timeline(cell) => Cell::Timeline(cell.clone()),
        }
    }

    /// Returns a copy of the cell with its text replaced by the given text and
    /// formatting.
    ///
    /// **Warning:** For cell types that have text, but which do not support
    ///              rich-text, the formatting will be dropped silently.
    #[must_use]
    pub fn with_rich_text(&self, text: impl Into<String>, formatting: Formatting) -> Self {
        match self {
            Cell::Checkbox(cell) => Cell::Checkbox(CheckboxCell {
                id: cell.id.clone(),
                content: text.into(),
                formatting,
                ..*cell
            }),
            Cell::Heading(cell) => Cell::Heading(HeadingCell {
                id: cell.id.clone(),
                content: text.into(),
                formatting,
                ..*cell
            }),
            Cell::ListItem(cell) => Cell::ListItem(ListItemCell {
                id: cell.id.clone(),
                content: text.into(),
                formatting,
                ..*cell
            }),
            Cell::Text(cell) => Cell::Text(TextCell {
                id: cell.id.clone(),
                content: text.into(),
                formatting,
                ..*cell
            }),
            Cell::Code(_)
            | Cell::Discussion(_)
            | Cell::Divider(_)
            | Cell::Graph(_)
            | Cell::Image(_)
            | Cell::Log(_)
            | Cell::Provider(_)
            | Cell::Table(_)
            | Cell::Timeline(_) => self.with_text(text),
        }
    }

    /// Returns a copy of the cell with the text for the given field replaced by
    /// the given text and optional formatting.
    ///
    /// If no field is given, the text is applied to the cell's main text field,
    /// similar to `with_text()` or `with_rich_text()`, depending on whether any
    /// formatting is given.
    ///
    /// **Warning:** For cell types that have text, but which do not support
    ///              rich-text, any given formatting will be dropped silently.
    #[must_use]
    pub fn with_text_for_field<T>(
        &self,
        text: T,
        formatting: Option<Formatting>,
        field: Option<impl AsRef<str>>,
    ) -> Self
    where
        T: Into<String> + AsRef<str>,
    {
        match (self, field) {
            (Cell::Provider(cell), Some(field)) => {
                Cell::Provider(cell.with_query_field(field.as_ref(), text))
            }
            (cell, _) => {
                if let Some(formatting) = formatting {
                    cell.with_rich_text(text, formatting)
                } else {
                    cell.with_text(text)
                }
            }
        }
    }

    pub fn id_mut(&mut self) -> &mut String {
        match self {
            Cell::Checkbox(cell) => &mut cell.id,
            Cell::Code(cell) => &mut cell.id,
            Cell::Discussion(cell) => &mut cell.id,
            Cell::Divider(cell) => &mut cell.id,
            Cell::Graph(cell) => &mut cell.id,
            Cell::Heading(cell) => &mut cell.id,
            Cell::Image(cell) => &mut cell.id,
            Cell::ListItem(cell) => &mut cell.id,
            Cell::Log(cell) => &mut cell.id,
            Cell::Provider(cell) => &mut cell.id,
            Cell::Table(cell) => &mut cell.id,
            Cell::Text(cell) => &mut cell.id,
            Cell::Timeline(cell) => &mut cell.id,
        }
    }

    /// Returns a mutable reference to the formatting array if the cell type
    /// supports formatting.
    pub fn formatting_mut(&mut self) -> Option<&mut Formatting> {
        match self {
            Cell::Checkbox(cell) => Some(&mut cell.formatting),
            Cell::Heading(cell) => Some(&mut cell.formatting),
            Cell::ListItem(cell) => Some(&mut cell.formatting),
            Cell::Text(cell) => Some(&mut cell.formatting),
            Cell::Code(_)
            | Cell::Discussion(_)
            | Cell::Divider(_)
            | Cell::Graph(_)
            | Cell::Image(_)
            | Cell::Log(_)
            | Cell::Provider(_)
            | Cell::Table(_)
            | Cell::Timeline(_) => None,
        }
    }

    /// Returns a mutable reference to the cell's text, if any.
    pub fn text_mut(&mut self) -> Option<&mut String> {
        match self {
            Cell::Checkbox(cell) => Some(&mut cell.content),
            Cell::Code(cell) => Some(&mut cell.content),
            Cell::Discussion(_) => None,
            Cell::Divider(_) => None,
            Cell::Image(_) => None,
            Cell::Graph(_) => None,
            Cell::Heading(cell) => Some(&mut cell.content),
            Cell::ListItem(cell) => Some(&mut cell.content),
            Cell::Log(_) => None,
            Cell::Provider(_) => None,
            Cell::Table(_) => None,
            Cell::Text(cell) => Some(&mut cell.content),
            Cell::Timeline(_) => None,
        }
    }

    /// Returns the cell type as a string
    pub fn type_str(&self) -> &str {
        match self {
            Cell::Checkbox(_) => "checkbox",
            Cell::Code(_) => "code",
            Cell::Discussion(_) => "discussion",
            Cell::Divider(_) => "divider",
            Cell::Graph(_) => "graph",
            Cell::Heading(_) => "heading",
            Cell::Image(_) => "image",
            Cell::ListItem(_) => "list item",
            Cell::Log(_) => "log",
            Cell::Provider(cell) => &cell.intent,
            Cell::Table(_) => "table",
            Cell::Text(_) => "text",
            Cell::Timeline(_) => "timeline",
        }
    }
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct CheckboxCell {
    #[builder(default, setter(into))]
    pub id: String,

    #[builder(default)]
    pub checked: bool,

    #[builder(default, setter(into))]
    pub content: String,

    /// Optional formatting to be applied to the cell's content.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Formatting::is_empty")]
    pub formatting: Formatting,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub level: Option<u8>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct CodeCell {
    #[builder(default, setter(into))]
    pub id: String,

    #[builder(default, setter(into))]
    pub content: String,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,

    /// Optional MIME type to use for syntax highlighting.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub syntax: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct DividerCell {
    #[builder(default, setter(into))]
    pub id: String,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct GraphCell {
    #[builder(default, setter(into))]
    pub id: String,

    /// Links to the data to render in the graph.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub data_links: Vec<String>,

    pub graph_type: GraphType,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,

    #[builder(default)]
    pub stacking_type: StackingType,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct HeadingCell {
    #[builder(default, setter(into))]
    pub id: String,

    pub heading_type: HeadingType,

    #[builder(default, setter(into))]
    pub content: String,

    /// Optional formatting to be applied to the cell's content.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Formatting::is_empty")]
    pub formatting: Formatting,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct LogCell {
    #[builder(default, setter(into))]
    pub id: String,

    /// Links to the data to render in the log.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub data_links: Vec<String>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub display_fields: Option<Vec<String>>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hide_similar_values: Option<bool>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expanded_indices: Option<Vec<LogRecordIndex>>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub visibility_filter: Option<LogVisibilityFilter>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selected_indices: Option<Vec<LogRecordIndex>>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub highlighted_indices: Option<Vec<LogRecordIndex>>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum LogVisibilityFilter {
    All,
    Selected,
    Highlighted,
}

/// A single expanded row of log records, as identified by [key] and [index]
/// pointing into the source data of the LogCell.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct LogRecordIndex {
    /// Index of the data link that produced the log record.
    pub link_index: u8,

    /// Index of the record within the data of a single data link.
    pub record_index: u32,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ListItemCell {
    #[builder(default, setter(into))]
    pub id: String,

    #[builder(default, setter(into))]
    pub content: String,

    /// Optional formatting to be applied to the cell's content.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Formatting::is_empty")]
    pub formatting: Formatting,

    #[builder(default)]
    pub list_type: ListType,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub level: Option<u8>,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start_number: Option<u16>,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ProviderCell {
    #[builder(default, setter(into))]
    pub id: String,

    /// The intent served by this provider cell.
    ///
    /// See: https://www.notion.so/fiberplane/RFC-45-Provider-Protocol-2-0-Revised-4ec85a0233924b2db0010d8cdae75e16#c8ed5dfbfd764e6bbd5c5b79333f9d6e
    #[builder(default, setter(into))]
    pub intent: String,

    /// Query data encoded as `"<mime-type>,<data>"`, where the MIME type is
    /// either `"application/x-www-form-urlencoded"` or `"multipart/form-data"`.
    /// This is used for storing data for the Query Builder.
    ///
    /// Note: The format follows the specification for data URLs, without the
    ///       `data:` prefix. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub query_data: Option<String>,

    /// Optional response data from the provider.
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub response: Option<EncodedBlob>,

    /// Optional list of generated output cells.
    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output: Option<Vec<Cell>>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
}

impl ProviderCell {
    /// Returns a clone of the provider cell, with the query data updated for
    /// the given query field.
    ///
    /// Unsets the query field if the value is empty.
    pub fn with_query_field(&self, field_name: impl AsRef<str>, value: impl AsRef<str>) -> Self {
        let query_data = self.query_data.as_deref().unwrap_or_default();
        let query_data = if value.as_ref().is_empty() {
            unset_query_field(query_data, field_name)
        } else {
            set_query_field(query_data, field_name, value)
        };
        Self {
            query_data: if has_query_data(&query_data) {
                Some(query_data)
            } else {
                None
            },
            ..self.clone()
        }
    }
}

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

    /// Describes which key in the TableRow element to render
    /// and the order of definitions also determines the order
    /// of the columns
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub column_defs: Vec<TableColumnDefinition>,

    /// Holds the values/data
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub rows: Vec<TableRowData>,
}

pub type TableRowData = BTreeMap<String, TableCellValue>;

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TableColumnDefinition {
    /// Key under which data for this colum is stored in the row data
    pub key: String,

    /// Table heading text.
    pub title: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum TableCellValue {
    Empty,
    Cell { cell: Cell },
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct TextCell {
    #[builder(default, setter(into))]
    pub id: String,

    #[builder(default, setter(into))]
    pub content: String,

    /// Optional formatting to be applied to the cell's content.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Formatting::is_empty")]
    pub formatting: Formatting,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[serde(rename_all = "camelCase")]
pub struct TimelineCell {
    #[builder(default, setter(into))]
    pub id: String,

    /// Links to the data to render in the timeline.
    #[builder(default)]
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub data_links: Vec<String>,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ImageCell {
    #[builder(default, setter(into))]
    pub id: String,

    // Refers to the id for a file (used to retrieve the file)
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_id: Option<String>,

    /// Used to indicates the upload progress.
    /// If file_id is set this shouldn't be set
    /// Also: if no progress is set and no file_id exists
    /// it means the cell is in the initial state (ready for upload)
    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub progress: Option<f64>,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<i32>,

    #[builder(default, setter(strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<i32>,

    /// Will contain a hash to show as a preview for the image
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub preview: Option<String>,

    /// URL of the image if it was originally hosted on a remote server.
    /// This will not be set if the image was uploaded through the
    /// Fiberplane Studio.
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct DiscussionCell {
    #[builder(default, setter(into))]
    pub id: String,

    #[builder(default, setter(into))]
    pub thread_id: String,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_only: Option<bool>,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum GraphType {
    Bar,
    Line,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum StackingType {
    #[default]
    None,
    Stacked,
    Percentage,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum HeadingType {
    #[default]
    H1,
    H2,
    H3,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub enum ListType {
    Ordered,
    #[default]
    Unordered,
}
