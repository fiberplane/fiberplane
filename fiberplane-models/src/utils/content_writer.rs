use crate::formatting::{ActiveFormatting, AnnotationWithOffset, Formatting, RichText};
use crate::notebooks::{CheckboxCell, HeadingCell, ListItemCell, TableRowValue, TextCell};
use crate::timestamps::Timestamp;
use crate::utils::char_count;
use crate::workspaces::Label;

pub struct ContentWriter {
    active_formatting: ActiveFormatting,
    previous_formatting: ActiveFormatting,
    content: String,
    formatting: Formatting,
}

impl ContentWriter {
    pub fn new() -> Self {
        Self {
            active_formatting: ActiveFormatting::default(),
            previous_formatting: ActiveFormatting::default(),
            content: String::new(),
            formatting: vec![],
        }
    }

    fn flush_annotations(&mut self) {
        let offset: u32 = char_count(&self.content);
        let mut annotations: Vec<_> = self
            .active_formatting
            .annotations_for_toggled_formatting(&self.previous_formatting)
            .into_iter()
            .map(|annotation| AnnotationWithOffset { annotation, offset })
            .collect();
        self.formatting.append(&mut annotations);
    }

    pub fn write_text(mut self, text: impl Into<String>) -> Self {
        self.flush_annotations();
        self.content.push_str(text.into().as_str());
        self.previous_formatting = self.active_formatting.clone();
        self
    }

    pub fn write_bold_text(self, text: impl Into<String>) -> Self {
        self.set_bold().write_text(text).unset_bold()
    }

    pub fn write_code_text(self, text: impl Into<String>) -> Self {
        self.set_code().write_text(text).unset_code()
    }

    pub fn write_highlight_text(self, text: impl Into<String>) -> Self {
        self.set_highlight().write_text(text).unset_highlight()
    }

    pub fn write_italics_text(self, text: impl Into<String>) -> Self {
        self.set_italics().write_text(text).unset_italics()
    }

    pub fn write_strikethrough_text(self, text: impl Into<String>) -> Self {
        self.set_strikethrough()
            .write_text(text)
            .unset_strikethrough()
    }

    pub fn write_link(self, text: impl Into<String>, url: impl Into<String>) -> Self {
        self.set_link(url).write_text(text).unset_link()
    }

    pub fn write_label(self, label: Label) -> Self {
        let text = label.to_string();
        self.set_label(label).write_text(text).unset_label()
    }

    pub fn write_timestamp(self, timestamp: Timestamp) -> Self {
        self.set_timestamp(timestamp)
            .write_text(timestamp.to_string())
            .unset_timestamp()
    }

    fn set_timestamp(mut self, timestamp: Timestamp) -> Self {
        self.active_formatting.timestamp = Some(timestamp);
        self
    }

    fn unset_timestamp(mut self) -> Self {
        self.active_formatting.timestamp = None;
        self
    }

    pub fn set_link(mut self, url: impl Into<String>) -> Self {
        self.active_formatting.link = Some(url.into());
        self
    }

    pub fn unset_link(mut self) -> Self {
        self.active_formatting.link = None;
        self
    }

    pub fn set_label(mut self, label: Label) -> Self {
        self.active_formatting.label = Some(label);
        self
    }

    pub fn unset_label(mut self) -> Self {
        self.active_formatting.label = None;
        self
    }

    pub fn set_bold(mut self) -> Self {
        self.active_formatting.bold = true;
        self
    }

    pub fn unset_bold(mut self) -> Self {
        self.active_formatting.bold = false;
        self
    }

    pub fn set_code(mut self) -> Self {
        self.active_formatting.code = true;
        self
    }

    pub fn unset_code(mut self) -> Self {
        self.active_formatting.code = false;
        self
    }

    pub fn set_highlight(mut self) -> Self {
        self.active_formatting.highlight = true;
        self
    }

    pub fn unset_highlight(mut self) -> Self {
        self.active_formatting.highlight = false;
        self
    }

    pub fn set_italics(mut self) -> Self {
        self.active_formatting.italics = true;
        self
    }

    pub fn unset_italics(mut self) -> Self {
        self.active_formatting.italics = false;
        self
    }

    pub fn set_strikethrough(mut self) -> Self {
        self.active_formatting.strikethrough = true;
        self
    }

    pub fn unset_strikethrough(mut self) -> Self {
        self.active_formatting.strikethrough = false;
        self
    }

    /// Finalize the formatting and return both the content and formatting.
    pub fn to_content(mut self) -> (String, Formatting) {
        // We set the active_formatting to the default state, as this will
        // make sure that flush_annotations will emit all required the End
        // annotations.
        self.active_formatting = ActiveFormatting::default();
        self.flush_annotations();
        (self.content, self.formatting)
    }

    /// Create a checkbox cell out of the content and formatting.
    pub fn to_checkbox_cell(self) -> CheckboxCell {
        let (content, formatting) = self.to_content();
        CheckboxCell {
            content,
            formatting,
            ..Default::default()
        }
    }

    /// Create a heading cell out of the content and formatting.
    pub fn to_heading_cell(self) -> HeadingCell {
        let (content, formatting) = self.to_content();
        HeadingCell {
            content,
            formatting,
            ..Default::default()
        }
    }

    /// Create a table value out of the content and formatting.
    pub fn to_table_value(self) -> TableRowValue {
        let (text, formatting) = self.to_content();
        TableRowValue::Text(RichText { text, formatting })
    }

    /// Create a text cell out of the content and formatting.
    pub fn to_text_cell(self) -> TextCell {
        let (content, formatting) = self.to_content();
        TextCell {
            content,
            formatting,
            ..Default::default()
        }
    }

    /// Build a list item cell directly from the text and formatting.
    pub fn to_list_item_cell(self) -> ListItemCell {
        let (content, formatting) = self.to_content();
        ListItemCell {
            content,
            formatting,
            ..Default::default()
        }
    }
}

impl Default for ContentWriter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use crate::{formatting::AnnotationWithOffset, workspaces::Label};

    use super::ContentWriter;

    #[test]
    fn content_writer_test() {
        let writer = ContentWriter::new();

        let (content, formatting) = writer
            .write_text("Hello")
            .write_bold_text("Bold")
            .write_text("|")
            .set_bold()
            .set_italics()
            .write_text("BoldAndItalic")
            .unset_italics()
            .write_text("OnlyBoldAndNoUnset")
            .to_content();

        assert_eq!("HelloBold|BoldAndItalicOnlyBoldAndNoUnset", content);
        assert_eq!(formatting.len(), 6);
        assert_eq!(
            formatting[0],
            AnnotationWithOffset {
                annotation: crate::formatting::Annotation::StartBold,
                offset: 5,
            }
        );
        assert_eq!(
            formatting[1],
            AnnotationWithOffset {
                annotation: crate::formatting::Annotation::EndBold,
                offset: 9,
            }
        );
        assert_eq!(
            formatting[2],
            AnnotationWithOffset {
                annotation: crate::formatting::Annotation::StartBold,
                offset: 10,
            }
        );
        assert_eq!(
            formatting[3],
            AnnotationWithOffset {
                annotation: crate::formatting::Annotation::StartItalics,
                offset: 10,
            }
        );
        assert_eq!(
            formatting[4],
            AnnotationWithOffset {
                annotation: crate::formatting::Annotation::EndItalics,
                offset: 23,
            }
        );
        assert_eq!(
            formatting[5],
            AnnotationWithOffset {
                annotation: crate::formatting::Annotation::EndBold,
                offset: 41,
            }
        );
    }

    #[test]
    fn content_writer_label_test() {
        let writer = ContentWriter::new();

        let label_a = Label::new("key", "value");
        let label_b = Label::new("key", "");

        let (content, formatting) = writer
            .write_label(label_a.clone())
            .write_text("|")
            .write_label(label_b.clone())
            .to_content();

        assert_eq!("key=value|key", content);
        assert_eq!(formatting.len(), 2);
        assert_eq!(
            formatting[0],
            AnnotationWithOffset {
                annotation: crate::formatting::Annotation::Label(label_a),
                offset: 0,
            }
        );
        assert_eq!(
            formatting[1],
            AnnotationWithOffset {
                annotation: crate::formatting::Annotation::Label(label_b),
                offset: 10,
            }
        );
    }
}
