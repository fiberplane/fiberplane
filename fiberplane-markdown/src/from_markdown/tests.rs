use super::*;
use fiberplane_models::notebooks::CodeCell;
use test_case::test_case;

#[test_case("# Title\nContent", "Title"; "h1")]
#[test_case("## Title\nContent", "Title"; "h2")]
#[test_case("### Title\nContent", "Title"; "h3")]
#[test_case("# Title with `code`\nContent", "Title with code"; "heading with code")]
#[test_case("# Title with *bold*\nContent", "Title with bold"; "heading with bold")]
#[test_case("# Title with ~~strikethrough~~\nContent", "Title with strikethrough"; "heading with strikethrough")]
#[test_case("# Title\n> Description", "Title"; "description")]
// Note these require two newlines after the first line to distinguish the title from what comes after
#[test_case("Title\n\nContent", "Title"; "plain text line")]
#[test_case("`Title`\n\nContent", "Title"; "inline code")]
fn parsing_title(markdown: &str, title: &str) {
    assert_eq!(markdown_to_notebook(markdown).title, title);
}

#[test]
fn heading_levels_are_decremented() {
    let markdown = "# Title\n## H1\n### H2";
    let notebook = markdown_to_notebook(markdown);
    assert_eq!(notebook.title, "Title");
    if let Cell::Heading(HeadingCell {
        heading_type,
        content,
        ..
    }) = &notebook.cells[0]
    {
        assert_eq!(heading_type, &HeadingType::H1);
        assert_eq!(content, "H1");
    } else {
        panic!("Expected HeadingCell");
    }
    if let Cell::Heading(HeadingCell {
        heading_type,
        content,
        ..
    }) = &notebook.cells[1]
    {
        assert_eq!(heading_type, &HeadingType::H2);
        assert_eq!(content, "H2");
    } else {
        panic!("Expected HeadingCell");
    }
}

#[test_case("1", &["1"]; "single")]
#[test_case("1\n\n2\n\n3", &["1", "2", "3"]; "multiple")]
#[test_case("1\n2", &["1 2"]; "multiline")]
fn parsing_text_cells(markdown: &str, cell_text: &[&str]) {
    assert_eq!(
        markdown_to_cells(markdown)
            .iter()
            .map(|cell| cell.content().unwrap_or_default())
            .collect::<Vec<_>>(),
        cell_text
    );
}

#[test_case("```\ncode\n```", &["code"]; "single")]
#[test_case("```\ncode\n```\n```\nhere\n```", &["code", "here"]; "multiple")]
#[test_case("```\ncode\nhere\n```", &["code\nhere"]; "multiline")]
#[test_case("```\ncode\n# fake heading\n```", &["code\n# fake heading"]; "heading inside code")]
fn parsing_code_cells(markdown: &str, cell_text: &[&str]) {
    let expected: Vec<Cell> = cell_text
        .iter()
        .enumerate()
        .map(|(index, content)| {
            Cell::Code(
                CodeCell::builder()
                    .content(content.to_string())
                    .id(format!("{}", index + 1))
                    .build(),
            )
        })
        .collect();
    assert_eq!(markdown_to_cells(markdown), expected);
}

#[test]
fn parsing_rich_text() {
    let markdown = "text with _italics_, **bold**, ~~strikethrough~~, [link](url)";
    let cell = markdown_to_cells(markdown).pop().unwrap();
    assert_eq!(
        cell.content(),
        Some("text with italics, bold, strikethrough, link")
    );
    let f = cell.formatting().unwrap();
    assert_eq!(
        f[0],
        AnnotationWithOffset::new(10, Annotation::StartItalics)
    );
    assert_eq!(f[1], AnnotationWithOffset::new(17, Annotation::EndItalics));
    assert_eq!(f[2], AnnotationWithOffset::new(19, Annotation::StartBold));
    assert_eq!(f[3], AnnotationWithOffset::new(23, Annotation::EndBold));
    assert_eq!(
        f[4],
        AnnotationWithOffset::new(25, Annotation::StartStrikethrough)
    );
    assert_eq!(
        f[5],
        AnnotationWithOffset::new(38, Annotation::EndStrikethrough)
    );
    assert_eq!(
        f[6],
        AnnotationWithOffset::new(
            40,
            Annotation::StartLink {
                url: "url".to_string()
            }
        )
    );
    assert_eq!(f[7], AnnotationWithOffset::new(44, Annotation::EndLink));
}

#[test]
fn parsing_code_blocks() {
    let cells = markdown_to_cells(
        "
```
Some code
```

```
Some more code
on multiple lines
```",
    );
    assert_eq!(cells[0].content(), Some("Some code"));
    assert!(matches!(cells[0], Cell::Code(_)));
    assert_eq!(
        cells[1].content(),
        Some("Some more code\non multiple lines")
    );
    assert!(matches!(cells[1], Cell::Code(_)));
}

#[test_case("[*link*](url)"; "formatting in text")]
#[test_case("*[link](url)*"; "formatting around url")]
fn parsing_links_with_formatting(markdown: &str) {
    let cell = markdown_to_cells(markdown).pop().unwrap();
    assert_eq!(cell.content(), Some("link"));
    assert!(cell
        .formatting()
        .unwrap()
        .contains(&AnnotationWithOffset::new(0, Annotation::StartItalics)));
    assert!(cell
        .formatting()
        .unwrap()
        .contains(&AnnotationWithOffset::new(4, Annotation::EndItalics)));
    assert!(cell
        .formatting()
        .unwrap()
        .contains(&AnnotationWithOffset::new(
            0,
            Annotation::StartLink {
                url: "url".to_string()
            }
        )));
    assert!(cell
        .formatting()
        .unwrap()
        .contains(&AnnotationWithOffset::new(4, Annotation::EndLink)));
}

#[test_case("- one\n- two\n- three", &["one", "two", "three"]; "bullet list")]
#[test_case("- one\n- two  \nnext line\n- three", &["one", "two\nnext line", "three"]; "multiline")]
fn parsing_unordered_lists(markdown: &str, cell_text: &[&str]) {
    let cells = markdown_to_cells(markdown);
    assert_eq!(cells.len(), cell_text.len());
    for i in 0..cells.len() {
        if let Cell::ListItem(cell) = &cells[i] {
            assert_eq!(cell.content, cell_text[i]);
        } else {
            panic!("expected list item");
        }
    }
}

#[test_case("1. one\n2. two\n3. three", &["one", "two", "three"]; "numbered list")]
#[test_case("1. one\n2. two  \nnext line\n3. three", &["one", "two\nnext line", "three"]; "multiline")]
fn parsing_ordered_lists(markdown: &str, cell_text: &[&str]) {
    let cells = markdown_to_cells(markdown);
    assert_eq!(cells.len(), cell_text.len());
    for i in 0..cells.len() {
        if let Cell::ListItem(cell) = &cells[i] {
            assert_eq!(cell.content, cell_text[i]);
            assert_eq!(cell.start_number, Some(i as u16 + 1));
        } else {
            panic!("expected list item");
        }
    }
}

#[test]
fn parsing_adjacent_lists() {
    let markdown = "1. one\n2. two\n1. three\n- four\n- five";
    let expected = [
        ("one", Some(1)),
        ("two", Some(2)),
        ("three", Some(3)),
        ("four", None),
        ("five", None),
    ];
    let cells = markdown_to_cells(markdown);
    assert_eq!(cells.len(), 5);
    for i in 0..cells.len() {
        if let Cell::ListItem(cell) = &cells[i] {
            assert_eq!(cell.content, expected[i].0);
            assert_eq!(cell.start_number, expected[i].1);
            assert_eq!(
                cell.list_type,
                if expected[i].1.is_some() {
                    ListType::Ordered
                } else {
                    ListType::Unordered
                }
            );
        } else {
            panic!("expected list item");
        }
    }
}

#[test]
fn parsing_nested_lists() {
    let markdown = "1. one\n   1. one-one\n   1. one-two\n1. two\n   * two-bullet\n";
    let cells = markdown_to_cells(markdown);
    if let Cell::ListItem(cell) = &cells[0] {
        assert_eq!(cell.content, "one");
        assert_eq!(cell.start_number, Some(1));
        assert_eq!(cell.list_type, ListType::Ordered);
        assert_eq!(cell.level, None);
    } else {
        panic!("expected list item");
    }
    if let Cell::ListItem(cell) = &cells[1] {
        assert_eq!(cell.content, "one-one");
        assert_eq!(cell.start_number, Some(1));
        assert_eq!(cell.list_type, ListType::Ordered);
        assert_eq!(cell.level, Some(1));
    } else {
        panic!("expected list item");
    }
    if let Cell::ListItem(cell) = &cells[2] {
        assert_eq!(cell.content, "one-two");
        assert_eq!(cell.start_number, Some(2));
        assert_eq!(cell.list_type, ListType::Ordered);
        assert_eq!(cell.level, Some(1));
    } else {
        panic!("expected list item");
    }
    if let Cell::ListItem(cell) = &cells[3] {
        assert_eq!(cell.content, "two");
        assert_eq!(cell.start_number, Some(2));
        assert_eq!(cell.list_type, ListType::Ordered);
        assert_eq!(cell.level, None);
    } else {
        panic!("expected list item");
    }
    if let Cell::ListItem(cell) = &cells[4] {
        assert_eq!(cell.content, "two-bullet");
        assert_eq!(cell.start_number, None);
        assert_eq!(cell.list_type, ListType::Unordered);
        assert_eq!(cell.level, Some(1));
    } else {
        panic!("expected list item");
    }
}

#[test]
fn parsing_lists_with_other_blocks_between() {
    let markdown = "1. one\n```\nblock\n```\n2. two";
    let cells = markdown_to_cells(markdown);
    assert!(
        matches!(&cells[0], Cell::ListItem(cell) if cell.content == "one" && cell.start_number == Some(1))
    );
    assert!(matches!(&cells[1], Cell::Code(cell) if cell.content == "block"));
    assert!(
        matches!(&cells[2], Cell::ListItem(cell) if cell.content == "two" && cell.start_number == Some(2))
    );
}

#[test]
fn parsing_task_list() {
    let markdown = "- [ ] task 1\n- [x] task 2\n- [ ] task 3";
    let cells = markdown_to_cells(markdown);
    assert_eq!(cells.len(), 3);
    assert_eq!(cells[0].content(), Some("task 1"));
    assert!(matches!(
        cells[0],
        Cell::Checkbox(CheckboxCell { checked: false, .. })
    ));
    assert_eq!(cells[1].content(), Some("task 2"));
    assert!(matches!(
        cells[1],
        Cell::Checkbox(CheckboxCell { checked: true, .. })
    ));
    assert_eq!(cells[2].content(), Some("task 3"));
    assert!(matches!(
        cells[2],
        Cell::Checkbox(CheckboxCell { checked: false, .. })
    ));
}

#[test]
fn parsing_dividers() {
    let markdown = "a\n\n---\n\nb";
    let cells = markdown_to_cells(markdown);
    assert_eq!(cells.len(), 3);
    assert_eq!(cells[0].content(), Some("a"));
    assert!(matches!(cells[1], Cell::Divider(_)));
    assert_eq!(cells[2].content(), Some("b"));
}

#[test]
fn parsing_line_breaks() {
    let markdown = "a

b<br>
c<br><br>d";
    let cells = markdown_to_cells(markdown);
    let cell_content: Vec<&str> = cells.iter().map(|c| c.content().unwrap()).collect();
    assert_eq!(cell_content, vec!["a", "b\n c\n\nd"]);
}

#[test]
fn html_goes_into_code_cell() {
    let markdown = "<p>a</p>\n<p>b</p><div>hello</div>";
    let cells = markdown_to_cells(markdown);
    assert!(matches!(cells[0], Cell::Code(CodeCell { .. })));
    assert_eq!(cells[0].content(), Some("<p>a</p>\n"));
    assert!(matches!(cells[1], Cell::Code(CodeCell { .. })));
    assert_eq!(cells[1].content(), Some("<p>b</p><div>hello</div>"));
}
