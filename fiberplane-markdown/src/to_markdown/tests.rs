use super::*;
use fiberplane_models::formatting::{Annotation, AnnotationWithOffset, Formatting, Mention};
use fiberplane_models::notebooks::*;
use fiberplane_models::timestamps::Timestamp;

#[test]
fn title() {
    let mut converter = NotebookConverter::new();
    converter.convert_title("Some title");
    let markdown = converter.into_markdown();
    assert_eq!(markdown, "# Some title");
}

#[test]
fn decrements_headings() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::Heading(
            HeadingCell::builder()
                .content("H1")
                .heading_type(HeadingType::H1)
                .build(),
        ),
        Cell::Heading(
            HeadingCell::builder()
                .content("H2")
                .heading_type(HeadingType::H2)
                .build(),
        ),
    ]);
    assert_eq!(converter.into_markdown(), "## H1\n\n### H2");
}

#[test]
fn plain_text() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text("Some text".to_string(), Formatting::default());
    assert_eq!(converter.into_markdown(), "Some text");
}

#[test]
fn formatted_text() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some bold, italics, strikethrough".to_string(),
        vec![
            AnnotationWithOffset::new(5, Annotation::StartBold),
            AnnotationWithOffset::new(9, Annotation::EndBold),
            AnnotationWithOffset::new(11, Annotation::StartItalics),
            AnnotationWithOffset::new(18, Annotation::EndItalics),
            AnnotationWithOffset::new(20, Annotation::StartStrikethrough),
            AnnotationWithOffset::new(33, Annotation::EndStrikethrough),
        ],
    );
    assert_eq!(
        converter.into_markdown(),
        "Some **bold**, *italics*, ~~strikethrough~~"
    );
}

#[test]
fn text_cells() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::Text(TextCell::builder().content("Some text").build()),
        Cell::Text(TextCell::builder().content("Some more text").build()),
    ]);
    assert_eq!(converter.into_markdown(), "Some text\n\nSome more text");
}

#[test]
fn mentions() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some @mention".to_string(),
        vec![AnnotationWithOffset::new(
            5,
            Annotation::Mention(
                Mention::builder()
                    .name("mention")
                    .user_id("user_id")
                    .build(),
            ),
        )],
    );
    assert_eq!(converter.into_markdown(), "Some **@mention**");
}

#[test]
fn timestamps() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some 2020-01-01T00:00:00Z timestamp".to_string(),
        vec![AnnotationWithOffset::new(
            5,
            Annotation::Timestamp {
                timestamp: Timestamp::parse("2020-01-01T00:00:00Z").unwrap(),
            },
        )],
    );
    assert_eq!(
        converter.into_markdown(),
        "Some **2020-01-01T00:00:00Z** timestamp"
    );
}

#[test]
fn labels() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some foo:bar".to_string(),
        vec![AnnotationWithOffset::new(
            5,
            Annotation::Label(Label::new("foo", "bar")),
        )],
    );
    assert_eq!(converter.into_markdown(), "Some **foo:bar**");
}

#[test]
fn links() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some link here".to_string(),
        vec![
            AnnotationWithOffset::new(
                5,
                Annotation::StartLink {
                    url: "https://www.rust-lang.org".to_string(),
                },
            ),
            AnnotationWithOffset::new(9, Annotation::EndLink),
        ],
    );
    assert_eq!(
        converter.into_markdown(),
        "Some [link](https://www.rust-lang.org) here"
    );
}

#[test]
fn images() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells(vec![
        Cell::Image(
            ImageCell::builder()
                .url("http://example.com/image.png")
                .build(),
        ),
        // This one is ignored because it has no URL
        Cell::Image(ImageCell::builder().file_id("file_id").build()),
    ]);
    let markdown = converter.into_markdown();
    assert_eq!(markdown, "![](http://example.com/image.png)");
}

#[test]
fn inline_code() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some code here".to_string(),
        vec![
            AnnotationWithOffset::new(5, Annotation::StartCode),
            AnnotationWithOffset::new(9, Annotation::EndCode),
        ],
    );
    assert_eq!(converter.into_markdown(), "Some `code` here");
}

#[test]
fn code_blocks() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::Code(CodeCell::builder().content("Some code").build()),
        Cell::Code(
            CodeCell::builder()
                .content("Some more code\non multiple lines")
                .build(),
        ),
    ]);
    assert_eq!(
        converter.into_markdown(),
        "
```
Some code
```

```
Some more code
on multiple lines
```"
    );
}

#[test]
fn unclosed_formatting_annotation() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some bold".to_string(),
        vec![AnnotationWithOffset::new(5, Annotation::StartBold)],
    );
    assert_eq!(converter.into_markdown(), "Some **bold**");
}

#[test]
fn unclosed_code() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some code".to_string(),
        vec![AnnotationWithOffset::new(5, Annotation::StartCode)],
    );
    assert_eq!(converter.into_markdown(), "Some `code`");
}

#[test]
fn ignore_start_formatting_annotation_at_content_end() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some text".to_string(),
        vec![
            AnnotationWithOffset::new(9, Annotation::StartBold),
            AnnotationWithOffset::new(10, Annotation::EndBold),
        ],
    );
    assert_eq!(converter.into_markdown(), "Some text");
}

#[test]
fn mixed_formatting() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "A link with code and bold here".to_string(),
        vec![
            AnnotationWithOffset::new(
                2,
                Annotation::StartLink {
                    url: "http://example.com".to_string(),
                },
            ),
            AnnotationWithOffset::new(12, Annotation::StartCode),
            AnnotationWithOffset::new(16, Annotation::EndCode),
            AnnotationWithOffset::new(21, Annotation::StartBold),
            AnnotationWithOffset::new(25, Annotation::EndBold),
            AnnotationWithOffset::new(25, Annotation::EndLink),
        ],
    );

    assert_eq!(
        converter.into_markdown(),
        "A [link with `code` and **bold**](http://example.com) here"
    );
}

#[test]
fn overlapping_formatting() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some overlapping formatting".to_string(),
        vec![
            AnnotationWithOffset::new(0, Annotation::StartBold),
            AnnotationWithOffset::new(5, Annotation::StartItalics),
            AnnotationWithOffset::new(16, Annotation::EndBold),
            AnnotationWithOffset::new(27, Annotation::EndItalics),
        ],
    );
    let markdown = converter.into_markdown();
    assert_eq!(markdown, "**Some *overlapping** formatting*");
}

#[test]
fn highlighting() {
    let mut converter = NotebookConverter::new();
    converter.convert_formatted_text(
        "Some highlighted text".to_string(),
        vec![
            AnnotationWithOffset::new(5, Annotation::StartHighlight),
            AnnotationWithOffset::new(21, Annotation::EndHighlight),
        ],
    );
    assert_eq!(
        converter.into_markdown(),
        "Some <mark>highlighted text</mark>"
    );
}

#[test]
fn ordered_lists_without_start_number() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::ListItem(
            ListItemCell::builder()
                .content("one")
                .list_type(ListType::Ordered)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("two")
                .list_type(ListType::Ordered)
                .build(),
        ),
    ]);
    assert_eq!(converter.into_markdown(), "1. one\n1. two");
}

#[test]
fn ordered_lists_with_start_number() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::ListItem(
            ListItemCell::builder()
                .content("two")
                .list_type(ListType::Ordered)
                .start_number(2)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("three")
                .list_type(ListType::Ordered)
                .start_number(3)
                .build(),
        ),
    ]);
    assert_eq!(
        converter.into_markdown(),
        "\
2. two
2. three"
    );
}
#[test]
fn nested_ordered_lists() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::ListItem(
            ListItemCell::builder()
                .content("one")
                .list_type(ListType::Ordered)
                .start_number(1)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("one-one")
                .list_type(ListType::Ordered)
                .start_number(1)
                .level(1)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("one-two")
                .list_type(ListType::Ordered)
                .start_number(2)
                .level(1)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("two")
                .list_type(ListType::Ordered)
                .start_number(2)
                .build(),
        ),
    ]);
    assert_eq!(
        converter.into_markdown(),
        "\
1. one
   1. one-one
   1. one-two
1. two"
    );
}

#[test]
fn nested_unordered_lists() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::ListItem(
            ListItemCell::builder()
                .content("one")
                .list_type(ListType::Unordered)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("one-one")
                .list_type(ListType::Unordered)
                .level(1)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("one-two")
                .list_type(ListType::Unordered)
                .level(1)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("two")
                .list_type(ListType::Unordered)
                .build(),
        ),
    ]);
    assert_eq!(
        converter.into_markdown(),
        "\
- one
  - one-one
  - one-two
- two"
    );
}

#[test]
fn checkboxes() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::Checkbox(CheckboxCell::builder().content("one").checked(true).build()),
        Cell::Checkbox(CheckboxCell::builder().content("two").build()),
    ]);
    let markdown = converter.into_markdown();
    assert_eq!(markdown, "- [x] one\n- [ ] two\n");
}

#[test]
fn text_cells_after_lists() {
    let mut converter = NotebookConverter::new();
    converter.convert_cells([
        Cell::ListItem(
            ListItemCell::builder()
                .content("one")
                .list_type(ListType::Ordered)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .content("two")
                .list_type(ListType::Ordered)
                .build(),
        ),
        Cell::Text(TextCell::builder().content("three").build()),
        Cell::Checkbox(CheckboxCell::builder().content("four").build()),
        Cell::Checkbox(CheckboxCell::builder().content("five").build()),
        Cell::Text(TextCell::builder().content("six").build()),
    ]);
    assert_eq!(
        converter.into_markdown(),
        "\
1. one
1. two

three

- [ ] four
- [ ] five

six"
    );
}
