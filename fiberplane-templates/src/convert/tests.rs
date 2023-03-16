use fiberplane_models::formatting::Mention;
use fiberplane_models::notebooks::{DividerCell, Label, ProviderCell, TextCell};
use time::OffsetDateTime;

use super::*;

#[test]
fn formatting_basic() {
    let content = "some normal, some bold, and some italicized text";
    let formatting = vec![
        AnnotationWithOffset::new(13, Annotation::StartBold),
        AnnotationWithOffset::new(24, Annotation::EndBold),
        AnnotationWithOffset::new(24, Annotation::StartItalics),
        AnnotationWithOffset::new(43, Annotation::EndItalics),
    ];
    let actual = format_content(content, &formatting);
    // alternative: "fmt.raw('some normal, ').bold('some bold, ').italics('and some italicized text')"
    assert_eq!(
        actual,
        "['some normal, ', fmt.bold(['some bold, ']), fmt.italics(['and some italicized']), ' text']"
    );
}

#[test]
fn formatting_nested() {
    let content = "some normal, some bold, and some bold italicized text";
    let formatting = vec![
        AnnotationWithOffset::new(13, Annotation::StartBold),
        AnnotationWithOffset::new(24, Annotation::StartItalics),
        AnnotationWithOffset::new(48, Annotation::EndItalics),
        AnnotationWithOffset::new(48, Annotation::EndBold),
    ];
    let actual = format_content(content, &formatting);
    assert_eq!(actual, "['some normal, ', fmt.bold(['some bold, ', fmt.italics(['and some bold italicized'])]), ' text']");
}

#[test]
fn format_link() {
    let content = "see here for more";
    let formatting = vec![
        AnnotationWithOffset::new(
            4,
            Annotation::StartLink {
                url: "https://example.com/more".to_string(),
            },
        ),
        AnnotationWithOffset::new(8, Annotation::EndLink),
    ];
    let actual = format_content(content, &formatting);
    assert_eq!(
        actual,
        "['see ', fmt.link(url='https://example.com/more', content=['here']), ' for more']"
    );
}

#[test]
fn format_unclosed() {
    let content = "some normal, some bold";
    let formatting = vec![AnnotationWithOffset::new(13, Annotation::StartBold)];
    let actual = format_content(content, &formatting);
    assert_eq!(actual, "['some normal, ', fmt.bold(['some bold'])]");
}

#[test]
fn format_mention() {
    let content = "hi @Bob Bobsen mention";
    let formatting = vec![AnnotationWithOffset::new(
        3,
        Annotation::Mention(
            Mention::builder()
                .name("Bob Bobsen".to_string())
                .user_id("1234".to_string())
                .build(),
        ),
    )];
    let actual = format_content(content, &formatting);
    assert_eq!(
        actual,
        "['hi ', fmt.mention('Bob Bobsen', '1234'), ' mention']"
    );
}

#[test]
fn format_timestamp() {
    let content = "hi 2020-01-01T00:00:00Z timestamp";
    let formatting = vec![AnnotationWithOffset::new(
        3,
        Annotation::Timestamp {
            timestamp: OffsetDateTime::parse("2020-01-01T00:00:00Z", &Rfc3339).unwrap(),
        },
    )];
    let actual = format_content(content, &formatting);
    assert_eq!(
        actual,
        "['hi ', fmt.timestamp('2020-01-01T00:00:00Z'), ' timestamp']"
    );
}

#[test]
fn format_label() {
    let content = "hi foo:bar label";
    let formatting = vec![AnnotationWithOffset::new(
        3,
        Annotation::Label(Label::new("foo", "bar")),
    )];
    let actual = format_content(content, &formatting);
    assert_eq!(actual, "['hi ', fmt.label('foo', 'bar'), ' label']");
}

#[test]
fn print_text_cell() {
    let mut writer = CodeWriter::new();
    print_cell(
        &mut writer,
        &Cell::Text(
            TextCell::builder()
                .id("c1")
                .content("I'm a text cell")
                .build(),
        ),
    );
    assert_eq!(writer.to_string(), "c.text(\"I'm a text cell\"),\n");
}

#[test]
fn print_divider_cell() {
    let mut writer = CodeWriter::new();
    print_cell(
        &mut writer,
        &Cell::Divider(DividerCell::builder().id("c2".to_owned()).build()),
    );
    assert_eq!(writer.to_string(), "c.divider(),\n");
}

#[test]
fn print_cell_handles_unicode() {
    let mut writer = CodeWriter::new();
    let cell = Cell::Text(
        TextCell::builder()
            .content("👀 I'm a text cell with unicode 🦀")
            .build(),
    );
    print_cell(&mut writer, &cell);
    assert_eq!(
        writer.to_string(),
        "c.text(\"👀 I'm a text cell with unicode 🦀\"),\n"
    );
}

#[test]
fn print_cell_handles_formatted_unicode() {
    let mut writer = CodeWriter::new();
    let cell = Cell::Text(
        TextCell::builder()
            .content("👀")
            .formatting(vec![
                AnnotationWithOffset::new(0, Annotation::StartHighlight),
                AnnotationWithOffset::new(1, Annotation::EndHighlight),
            ])
            .build(),
    );
    print_cell(&mut writer, &cell);
    assert_eq!(writer.to_string(), "c.text([fmt.highlight(['👀'])]),\n");
}

#[test]
fn decodes_well_known_provider_cell_data() {
    let mut writer = CodeWriter::new();
    let cell = Cell::Provider(ProviderCell::builder()
                              .title("".to_string())
        .intent("prometheus,timeseries".to_string())
        .query_data("application/x-www-form-urlencoded,query=apiserver_audit_event_total%7Bjob%3D%22test%22%7D".to_string())
                              .id("c1")
                              .build()
    );

    print_cell(&mut writer, &cell);
    assert_eq!(
        writer.to_string(),
        "c.prometheus(
  title='',
  content='apiserver_audit_event_total{job=\"test\"}',
),
"
    );
}

#[test]
fn decodes_arbitrary_provider_cell_data() {
    let mut writer = CodeWriter::new();
    let cell = Cell::Provider(ProviderCell::builder()
                              .title("".to_string())
        .intent("cloudwatch,x-list-metrics".to_string())
        .query_data("application/x-www-form-urlencoded,query=CPUUtil&tag_name=Environment&tag_values=prod+production".to_string())
                              .id("c1")
                              .build()
    );

    print_cell(&mut writer, &cell);
    assert_eq!(
        writer.to_string(),
        "c.provider(
  title='',
  intent='cloudwatch,x-list-metrics',
  queryData='application/x-www-form-urlencoded,query=CPUUtil&tag_name=Environment&tag_values=prod+production',
),
"
    );
}
