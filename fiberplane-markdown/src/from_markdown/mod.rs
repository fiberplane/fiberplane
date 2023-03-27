use fiberplane_models::formatting::{Annotation, AnnotationWithOffset};
use fiberplane_models::notebooks::{
    Cell, CheckboxCell, CodeCell, DividerCell, HeadingCell, HeadingType, ImageCell, ListItemCell,
    ListType, NewNotebook, TextCell,
};
use fiberplane_models::timestamps::{NewTimeRange, RelativeTimeRange};
use fiberplane_models::utils::char_count;
use pulldown_cmark::{CowStr, Event::*, HeadingLevel, LinkType, Options, Parser, Tag};
use tracing::warn;

#[cfg(test)]
mod tests;

/// Convert Markdown to a Fiberplane notebook
///
/// This parses the first heading as the notebook title and
/// then parses the rest of the markdown as the notebook cells.
pub fn markdown_to_notebook(markdown: &str) -> NewNotebook {
    let converter = MarkdownConverter::new(markdown);
    converter.convert_to_notebook()
}

/// Convert the Markdown to Fiberplane notebook cells
pub fn markdown_to_cells(markdown: &str) -> Vec<Cell> {
    let converter = MarkdownConverter::new(markdown);
    converter.parse_cells()
}

struct ListDetails {
    list_type: ListType,
    start_number: Option<u16>,
    level: Option<u8>,
}

struct MarkdownConverter<'a> {
    parser: Parser<'a, 'a>,
    current_cell: Option<Cell>,
    lists: Vec<ListDetails>,
    cells: Vec<Cell>,
    /// If the title is the only H1 in the document, we will decrement the level of all other headings
    decrement_heading_level: bool,
}

impl<'a> MarkdownConverter<'a> {
    fn new(markdown: &'a str) -> Self {
        let mut options = Options::empty();
        options.insert(Options::ENABLE_STRIKETHROUGH);
        options.insert(Options::ENABLE_TASKLISTS);

        Self {
            parser: Parser::new_ext(markdown, options),
            current_cell: None,
            lists: Vec::new(),
            cells: Vec::new(),
            decrement_heading_level: false,
        }
    }

    fn convert_to_notebook(mut self) -> NewNotebook {
        NewNotebook::builder()
            .title(self.parse_title())
            .cells(self.parse_cells())
            .time_range(NewTimeRange::Relative(RelativeTimeRange::from_minutes(-60)))
            .build()
    }

    /// Parse the title from the markdown heading or first paragraph.
    fn parse_title(&mut self) -> String {
        let mut title = String::new();
        let mut start_tag = None;
        for event in self.parser.by_ref() {
            match event {
                Text(text) => {
                    title.push_str(&text);
                }
                Code(code) => {
                    title.push_str(&code);
                }
                Start(tag) => {
                    if start_tag.is_none() {
                        if let Tag::Heading(HeadingLevel::H1, ..) = tag {
                            self.decrement_heading_level = true;
                        }
                        start_tag = Some(tag);
                    }
                }
                End(tag) => {
                    if start_tag == Some(tag) {
                        break;
                    }
                }
                // TODO handle if there is an image before the title
                _ => continue,
            }
        }
        title
    }

    fn parse_cells(mut self) -> Vec<Cell> {
        let events: Vec<_> = (&mut self.parser).collect();

        // Check if there are any other H1s in the document. If not, we will decrement the level of all other headings
        if self.decrement_heading_level
            && events
                .iter()
                .any(|event| matches!(event, Start(Tag::Heading(HeadingLevel::H1, ..))))
        {
            self.decrement_heading_level = false;
        }

        for event in events {
            match event {
                Start(tag) => self.start_tag(tag),
                End(tag) => self.end_tag(tag),
                Text(content) => {
                    if let Some(cell) = &mut self.current_cell {
                        if let Some(cell_text) = cell.text_mut() {
                            cell_text.push_str(&content);
                            continue;
                        }
                    }
                    self.new_text_cell(content.to_string());
                }
                // Inline code
                Code(content) => {
                    let cell = if let Some(cell) = &mut self.current_cell {
                        cell
                    } else {
                        self.new_text_cell(String::new())
                    };

                    append_formatting(cell, Annotation::StartCode);
                    if let Some(c) = cell.text_mut() {
                        c.push_str(&content)
                    }
                    append_formatting(cell, Annotation::EndCode);
                }
                SoftBreak => {
                    if let Some(cell) = &mut self.current_cell {
                        if let Some(text) = cell.text_mut() {
                            text.push(' ');
                        }
                    }
                }
                HardBreak | Html(CowStr::Borrowed("<br>")) | Html(CowStr::Borrowed("<br />")) => {
                    if let Some(cell) = &mut self.current_cell {
                        if let Some(text) = cell.text_mut() {
                            text.push('\n');
                            continue;
                        }
                    }
                    self.new_text_cell(String::new());
                }
                Rule => self.cells.push(Cell::Divider(DividerCell::default())),
                TaskListMarker(checked) => {
                    // Task list markers follow Start(Tag::Item) events so we need to convert
                    // the current cell to a checkbox if we see this event
                    self.current_cell = match self.current_cell.take() {
                        Some(Cell::ListItem(cell)) => {
                            let builder = CheckboxCell::builder()
                                .checked(checked)
                                .id(cell.id)
                                .content(cell.content)
                                .read_only(cell.read_only.is_some())
                                .formatting(cell.formatting);
                            let checkbox = if let Some(level) = cell.level {
                                builder.level(level).build()
                            } else {
                                builder.build()
                            };
                            Some(Cell::Checkbox(checkbox))
                        }
                        cell => cell,
                    };
                }
                Html(code) => {
                    self.new_cell(Cell::Code(
                        CodeCell::builder().content(code.to_string()).build(),
                    ));
                }
                FootnoteReference(_) => {}
            }
        }
        if let Some(cell) = self.current_cell {
            self.cells.push(cell);
        }

        // Ensure that each cell has a unique ID
        for (i, cell) in self.cells.iter_mut().enumerate() {
            *cell.id_mut() = (i + 1).to_string();
        }

        self.cells
    }

    fn start_tag(&mut self, tag: Tag) {
        match tag {
            Tag::Paragraph => {
                self.new_text_cell(String::new());
            }
            Tag::Heading(level, _, _) => {
                let heading_type = if self.decrement_heading_level {
                    match level {
                        HeadingLevel::H2 => Some(HeadingType::H1),
                        HeadingLevel::H3 => Some(HeadingType::H2),
                        HeadingLevel::H4 => Some(HeadingType::H3),
                        _ => None,
                    }
                } else {
                    match level {
                        HeadingLevel::H1 => Some(HeadingType::H1),
                        HeadingLevel::H2 => Some(HeadingType::H2),
                        HeadingLevel::H3 => Some(HeadingType::H3),
                        _ => None,
                    }
                };
                let cell = if let Some(heading_type) = heading_type {
                    Cell::Heading(HeadingCell::builder().heading_type(heading_type).build())
                } else {
                    // We don't currently support levels 4-6 so we'll just treat those as text cells
                    Cell::Text(TextCell::default())
                };
                self.new_cell(cell);
            }
            Tag::BlockQuote => {
                // We don't yet support block quotes so we'll just treat them as text cells
                self.new_text_cell(String::new());
            }
            Tag::CodeBlock(_) => {
                self.new_cell(Cell::Code(CodeCell::default()));
            }
            Tag::List(start_number) => {
                let (start_number, list_type) = if let Some(start_number) = start_number {
                    (start_number.try_into().ok(), ListType::Ordered)
                } else {
                    (None, ListType::Unordered)
                };
                let level = self
                    .lists
                    .last()
                    .map(|details| details.level.unwrap_or_default() + 1);
                self.lists.push(ListDetails {
                    start_number,
                    list_type,
                    level,
                });
            }
            Tag::Item => {
                if let Some(details) = self.lists.last_mut() {
                    let builder = ListItemCell::builder().list_type(details.list_type);

                    let item = match (details.start_number, details.level) {
                        (Some(start_number), Some(level)) => {
                            builder.start_number(start_number).level(level).build()
                        }
                        (Some(start_number), None) => builder.start_number(start_number).build(),
                        (None, Some(level)) => builder.level(level).build(),
                        (None, None) => builder.build(),
                    };

                    let cell = Cell::ListItem(item);
                    if let Some(ref mut start_number) = details.start_number {
                        *start_number += 1;
                    }
                    self.new_cell(cell);
                }
            }
            Tag::Image(_link_type, url, _title) => {
                self.new_cell(Cell::Image(
                    ImageCell::builder().url(url.to_string()).build(),
                ));
            }
            // Formatting annotations
            Tag::Emphasis
            | Tag::Strikethrough
            | Tag::Strong
            | Tag::Link(LinkType::Inline, ..)
            | Tag::Link(LinkType::Autolink, ..) => {
                let annotation = match tag {
                    Tag::Emphasis => Annotation::StartItalics,
                    Tag::Strong => Annotation::StartBold,
                    Tag::Strikethrough => Annotation::StartStrikethrough,
                    Tag::Link(_, url, _) => Annotation::StartLink {
                        url: url.to_string(),
                    },
                    _ => unreachable!(),
                };
                if let Some(cell) = &mut self.current_cell {
                    append_formatting(cell, annotation);
                }
            }
            Tag::Link(link_type, ..) => {
                warn!("Ignoring unsupported link type: {:?}", link_type);
            }
            Tag::FootnoteDefinition(_) => {
                warn!("Ignoring footnote definition because footnotes are not yet supported");
            }
            Tag::Table(_) => {
                warn!("Ignoring table because tables are not yet supported");
            }
            Tag::TableHead | Tag::TableRow | Tag::TableCell => {}
        }
    }

    fn end_tag(&mut self, tag: Tag) {
        match tag {
            Tag::Paragraph | Tag::Heading(..) | Tag::BlockQuote | Tag::Item => {
                if let Some(cell) = self.current_cell.take() {
                    self.cells.push(cell)
                }
            }
            Tag::CodeBlock(_) => {
                if let Some(mut cell) = self.current_cell.take() {
                    if let Cell::Code(cell) = &mut cell {
                        // Code blocks keep the newline that separates the content from the final ```,
                        // which we don't want in the actual cell
                        if cell.content.ends_with('\n') {
                            cell.content.pop();
                        }
                    }
                    self.cells.push(cell);
                }
            }
            Tag::List(_) => {
                self.lists.pop();
            }
            Tag::Image(..) => {}
            // Formatting annotations
            Tag::Emphasis
            | Tag::Strikethrough
            | Tag::Strong
            | Tag::Link(LinkType::Inline, ..)
            | Tag::Link(LinkType::Autolink, ..) => {
                let annotation = match tag {
                    Tag::Emphasis => Annotation::EndItalics,
                    Tag::Strong => Annotation::EndBold,
                    Tag::Strikethrough => Annotation::EndStrikethrough,
                    Tag::Link(..) => Annotation::EndLink,
                    _ => unreachable!(),
                };
                if let Some(cell) = &mut self.current_cell {
                    append_formatting(cell, annotation);
                }
            }
            Tag::Link(link_type, ..) => {
                warn!("Ingoring unsupported link type: {:?}", link_type);
            }
            Tag::Table(_) | Tag::TableHead | Tag::TableRow | Tag::TableCell => {}
            Tag::FootnoteDefinition(_) => {}
        }
    }

    fn new_cell(&mut self, cell: Cell) -> &mut Cell {
        if let Some(cell) = self.current_cell.take() {
            self.cells.push(cell);
        }
        self.current_cell = Some(cell);
        self.current_cell.as_mut().unwrap()
    }

    fn new_text_cell(&mut self, content: String) -> &mut Cell {
        let cell = Cell::Text(TextCell::builder().content(content).build());
        self.new_cell(cell)
    }
}

fn append_formatting(cell: &mut Cell, annotation: Annotation) {
    if let (Some(offset), Some(formatting)) =
        (cell.content().map(char_count), cell.formatting_mut())
    {
        formatting.push(AnnotationWithOffset::new(offset, annotation));
    } else {
        warn!("Tried to append formatting to a cell that does not support it")
    }
}
