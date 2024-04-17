mod frontmatter_tests;

use super::*;
use crate::types::{TemplateParameter, TemplateParameterType};
use crate::*;
use fiberplane_models::data_sources::SelectedDataSource;
use fiberplane_models::formatting::{Annotation, AnnotationWithOffset, Formatting, Mention};
use fiberplane_models::names::Name;
use fiberplane_models::notebooks::*;
use fiberplane_models::timestamps::{NewTimeRange, RelativeTimeRange, Timestamp};
use once_cell::sync::Lazy;
use pretty_assertions::assert_eq;
use serde_json::{json, Map, Value};
use std::collections::{BTreeMap, HashMap};
use std::fs;
use std::iter::FromIterator;
use std::path::PathBuf;
use time::macros::datetime;

static CELLS: Lazy<Vec<Cell>> = Lazy::new(|| {
    vec![
        Cell::Text(
            TextCell::builder()
                .id("1")
                .content("Let's debug this incident! foo:bar baz")
                .formatting(vec![
                    AnnotationWithOffset::new(6, Annotation::StartItalics),
                    AnnotationWithOffset::new(11, Annotation::EndItalics),
                    AnnotationWithOffset::new(17, Annotation::StartBold),
                    AnnotationWithOffset::new(26, Annotation::EndBold),
                    AnnotationWithOffset::new(27, Annotation::Label(Label::new("foo", "bar"))),
                    AnnotationWithOffset::new(35, Annotation::Label(Label::new("baz", ""))),
                ])
                .build(),
        ),
        Cell::Heading(
            HeadingCell::builder()
                .id("2")
                .content("TODOs:")
                .heading_type(HeadingType::H2)
                .read_only(true)
                .build(),
        ),
        Cell::Checkbox(
            CheckboxCell::builder()
                .id("3")
                .content("Investigate")
                .build(),
        ),
        Cell::Code(
            CodeCell::builder()
                .id("4")
                .content(
                    "// Some code to run
let a = 'b';
let b = \"c\";",
                )
                .build(),
        ),
        Cell::Checkbox(CheckboxCell::builder().id("5").content("Resolve").build()),
        Cell::Checkbox(CheckboxCell::builder().id("6").content("Profit").build()),
        Cell::Heading(
            HeadingCell::builder()
                .id("7")
                .content("Hypotheses")
                .heading_type(HeadingType::H2)
                .read_only(true)
                .build(),
        ),
        Cell::Provider(
            ProviderCell::builder()
                .id("8")
                .intent("loki,events")
                .query_data("application/x-www-form-urlencoded,query=loki+query")
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .id("9")
                .content("Step 1")
                .list_type(ListType::Ordered)
                .start_number(1)
                .build(),
        ),
        Cell::Code(CodeCell::builder().id("10").content("Some code").build()),
        Cell::ListItem(
            ListItemCell::builder()
                .id("11")
                .content("Step 2")
                .list_type(ListType::Ordered)
                .start_number(2)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .id("12")
                .content("Bullet 1")
                .list_type(ListType::Unordered)
                .level(1)
                .start_number(1)
                .build(),
        ),
        Cell::ListItem(
            ListItemCell::builder()
                .id("13")
                .content("Bullet 2")
                .list_type(ListType::Unordered)
                .level(1)
                .start_number(2)
                .build(),
        ),
        Cell::Image(
            ImageCell::builder()
                .id("14")
                .url("http://example.com/image.png")
                .build(),
        ),
        Cell::Provider(
            ProviderCell::builder()
                .id("15")
                .intent("prometheus,timeseries")
                .query_data("application/x-www-form-urlencoded,query=http_requests")
                .build(),
        ),
        Cell::Provider(
            ProviderCell::builder()
                .id("16")
                .intent("prometheus,timeseries")
                .build(),
        ),
        Cell::Text(
            TextCell::builder()
                .id("17")
                .content("Prefix: 2022-10-24T10:42:10.977Z - error triggered")
                .formatting(vec![AnnotationWithOffset::new(
                    8,
                    Annotation::Timestamp {
                        timestamp: datetime!(2022-10-24 10:42:10.977 UTC).into(),
                    },
                )])
                .build(),
        ),
        Cell::Provider(
            ProviderCell::builder()
                .id("18")
                .intent("fiberplane,unknown")
                .query_data("application/x-www-form-urlencoded,query=arbitrary+query&live=false&exclamation=234")
                .build(),
        ),
    ]
});

static NOTEBOOK: Lazy<NewNotebook> = Lazy::new(|| {
    NewNotebook::builder()
        .title("Incident: 'API Outage'")
        .time_range(NewTimeRange::Relative(RelativeTimeRange::from_minutes(-60)))
        .selected_data_sources(BTreeMap::from_iter([(
            "prometheus".to_string(),
            SelectedDataSource::builder()
                .name(Name::from_static("prometheus"))
                .proxy_name(Name::from_static("dev"))
                .build(),
        )]))
        .cells(CELLS.clone())
        .labels(vec![
            Label::new("key1", ""),
            Label::new("key2", "value2"),
            Label::new("key3", ""),
            Label::new("key4", "value4"),
            Label::new("key5", ""),
        ])
        .build()
});

#[test]
fn expands_without_top_level_function() {
    let template = "{title: 'hello'}";
    let expander = TemplateExpander::default();
    let output = expander
        .expand_template_to_string(
            template,
            [("not used".to_string(), Value::String("value".to_string()))],
            false,
        )
        .unwrap();
    assert_eq!(output, "{\"title\": \"hello\"}");
}

#[test]
fn accepts_map_or_hashmap() {
    let template = "function(title) { title: title }";
    let expander = TemplateExpander::default();
    let args: HashMap<_, _> =
        HashMap::from_iter([("title", Value::String("my title".to_string()))]);
    let output = expander
        .expand_template_to_string(template, args, false)
        .unwrap();
    assert_eq!(output, "{\"title\": \"my title\"}");

    let args = Map::from_iter([(
        "title".to_string(),
        Value::String("other title".to_string()),
    )]);
    let output = expander
        .expand_template_to_string(template, args, false)
        .unwrap();
    assert_eq!(output, "{\"title\": \"other title\"}");
}

#[test]
fn accepts_non_value_args() {
    let template = "function(title) { title: title }";
    let expander = TemplateExpander::default();
    let args: HashMap<_, _> = HashMap::from_iter([("title", "my title".to_string())]);
    let output = expander
        .expand_template_to_string(template, args, false)
        .unwrap();
    assert_eq!(output, "{\"title\": \"my title\"}");
}

#[test]
fn expands_if_tlas_not_used() {
    let template = "function(title='hello') {title: title}";
    let expander = TemplateExpander::default();
    let output = expander
        .expand_template_to_string(
            template,
            [
                ("not used".to_string(), Value::String("value".to_string())),
                ("title".to_string(), Value::String("okay".to_string())),
            ],
            false,
        )
        .unwrap();
    assert_eq!(output, "{\"title\": \"okay\"}");
}

#[test]
fn expands_nested_lists() {
    let template = "local fp = import 'fiberplane.libsonnet';
    fp.notebook.new('a')
        .addCells([
            fp.cell.orderedList([ 'A', ['1', '2', ['i', 'ii']] ])
        ])";
    let output = expand_template(template, EMPTY_ARGS).unwrap();
    let cells: Vec<ListItemCell> = output
        .cells
        .into_iter()
        .map(|c| {
            if let Cell::ListItem(c) = c {
                c
            } else {
                panic!("Expected ListItem")
            }
        })
        .collect();
    assert_eq!(
        cells,
        &[
            ListItemCell::builder()
                .id("1")
                .content("A")
                .list_type(ListType::Ordered)
                .start_number(1)
                .build(),
            ListItemCell::builder()
                .id("2")
                .content("1")
                .list_type(ListType::Ordered)
                .level(1)
                .start_number(1)
                .build(),
            ListItemCell::builder()
                .id("3")
                .content("2")
                .list_type(ListType::Ordered)
                .level(1)
                .start_number(2)
                .build(),
            ListItemCell::builder()
                .id("4")
                .content("i")
                .list_type(ListType::Ordered)
                .level(2)
                .start_number(1)
                .build(),
            ListItemCell::builder()
                .id("5")
                .content("ii")
                .list_type(ListType::Ordered)
                .level(2)
                .start_number(2)
                .build()
        ]
    );
}

#[test]
fn filters_out_invalid_labels() {
    let template = "local fp = import 'fiberplane.libsonnet';
    fp.notebook.new('title').addLabels({'a': 'b', '-invalidkey': 'c', 'd': '\ninvalidvalue', 'e': 'f'})";
    let notebook = expand_template(template, EMPTY_ARGS).unwrap();
    assert_eq!(
        notebook.labels,
        &[Label::new("a", "b"), Label::new("e", "f"),]
    );
}

#[test]
fn errors_include_line_numbers() {
    let template = "local a = '';
invalid!";
    let args: [(&str, Value); 0] = [];
    match expand_template(template, args) {
        Ok(_) => panic!("should have errored"),
        Err(Error::Evaluation(err)) => assert!(err.contains("template:2:8")),
        Err(_) => panic!("wrong error"),
    }
}

#[test]
fn returns_helpful_error_if_missing_argument() {
    let template = "local fp = import 'fiberplane.libsonnet';
    function(title)
    fp.notebook.new(title)";
    let args: [(&str, Value); 0] = [];
    match expand_template(template, args) {
        Ok(_) => panic!("Should have errored"),
        Err(Error::MissingArgument(parameter)) => assert_eq!(parameter, "title"),
        Err(err) => panic!("wrong error: {err:?}"),
    }
}

#[test]
fn extract_template_parameters_non_function() {
    let template = "local fp = import 'fiberplane.libsonnet';
    fp.notebook.new(title)";
    let parameters = extract_template_parameters(template).unwrap();
    assert!(parameters.is_empty());
}

#[test]
fn extract_template_parameters_no_parameters() {
    let template = "function() {}";
    let parameters = extract_template_parameters(template).unwrap();
    assert!(parameters.is_empty());
}

#[test]
fn extract_template_parameters_required() {
    let template = "function(requiredParam1, requiredParam2) { title: 'my title' }";
    let params = extract_template_parameters(template).unwrap();
    assert_eq!(params.len(), 2);
    assert_eq!(
        params[0],
        TemplateParameter::builder().name("requiredParam1").build()
    );
    assert_eq!(
        params[1],
        TemplateParameter::builder().name("requiredParam2").build()
    );
}

#[test]
fn extract_template_parameters_optional() {
    let template = "function(
        optionalString='test',
        optionalNumber=1,
        optionalBoolean=true,
        optionalObject={},
        optionalArray=[],
        optionalNull=null,
    ) { title: 'my title' }";
    let params = extract_template_parameters(template).unwrap();
    assert_eq!(params.len(), 6);
    assert_eq!(
        params[0],
        TemplateParameter::builder()
            .name("optionalString")
            .ty(TemplateParameterType::String)
            .default_value(Value::String("test".to_string()))
            .build()
    );
    assert_eq!(
        params[1],
        TemplateParameter::builder()
            .name("optionalNumber")
            .ty(TemplateParameterType::Number)
            .default_value(Value::Number(Number::from_f64(1.0).unwrap()))
            .build()
    );
    assert_eq!(
        params[2],
        TemplateParameter::builder()
            .name("optionalBoolean")
            .ty(TemplateParameterType::Boolean)
            .default_value(Value::Bool(true))
            .build()
    );
    assert_eq!(
        params[3],
        TemplateParameter::builder()
            .name("optionalObject")
            .ty(TemplateParameterType::Object)
            .default_value(Value::Object(Map::new()))
            .build()
    );
    assert_eq!(
        params[4],
        TemplateParameter::builder()
            .name("optionalArray")
            .ty(TemplateParameterType::Array)
            .default_value(Value::Array(vec![]))
            .build()
    );
    assert_eq!(
        params[5],
        TemplateParameter::builder()
            .name("optionalNull")
            .ty(TemplateParameterType::Unknown)
            .default_value(Value::Null)
            .build()
    );
}

#[test]
fn extract_template_parameters_ignores_non_serializable_types() {
    let template = "function(optionalObject={ a: function() {}, b: 2, c: 'three'}) {}";
    let params = extract_template_parameters(template).unwrap();
    assert_eq!(
        params[0],
        TemplateParameter::builder()
            .name("optionalObject")
            .ty(TemplateParameterType::Object)
            .default_value(json!({
                "b": 2.0,
                "c": "three"
            }))
            .build()
    );
}

#[test]
fn extract_template_parameters_value_from_context() {
    let template = "local a = 1;
    local b(x) = x + 1;
    local c = 'three';
    function(x=a, y=b(1), z=c) {}";
    let params = extract_template_parameters(template).unwrap();
    assert_eq!(
        params,
        vec![
            TemplateParameter::builder()
                .name("x")
                .ty(TemplateParameterType::Number)
                .default_value(Value::Number(Number::from_f64(1.0).unwrap()))
                .build(),
            TemplateParameter::builder()
                .name("y")
                .ty(TemplateParameterType::Number)
                .default_value(Value::Number(Number::from_f64(2.0).unwrap()))
                .build(),
            TemplateParameter::builder()
                .name("z")
                .ty(TemplateParameterType::String)
                .default_value(Value::String("three".to_string()))
                .build()
        ]
    );
}

#[test]
fn formatting_basic() {
    let template = "local fp = import 'fiberplane.libsonnet';
        local fmt = fp.format;

        fp.notebook.new('title')
        .setTimeRangeRelative(60)
        .addCells(
        [
            fp.cell.text(fmt.bold('some bold text')),
            fp.cell.text(fmt.code('some code')),
            fp.cell.text(fmt.highlight('some highlighted text')),
            fp.cell.text(fmt.italics('some italicized text')),
            fp.cell.text(fmt.link('Fiberplane', 'https://fiberplane.com')),
            fp.cell.text(fmt.strikethrough('some strikethrough text')),
            fp.cell.text(fmt.underline('some underlined text')),
            fp.cell.text(fmt.mention('Bob Bobsen', 'Bob')),
            fp.cell.text(fmt.timestamp('2020-01-01T00:00:00Z')),
            fp.cell.text(fmt.label('foo', 'bar')),
            fp.cell.text(fmt.label('foo')),
        ])";
    let notebook = expand_template(template, EMPTY_ARGS).unwrap();
    let cells: Vec<TextCell> = notebook
        .cells
        .into_iter()
        .map(|cell| {
            if let Cell::Text(text) = cell {
                text
            } else {
                panic!("expected text cell");
            }
        })
        .collect();
    assert_eq!(cells.len(), 11);

    assert_eq!(cells[0].content, "some bold text");
    assert_eq!(
        &cells[0].formatting,
        &[
            AnnotationWithOffset::new(0, Annotation::StartBold),
            AnnotationWithOffset::new(14, Annotation::EndBold),
        ]
    );
    assert_eq!(cells[1].content, "some code");
    assert_eq!(
        &cells[1].formatting,
        &[
            AnnotationWithOffset::new(0, Annotation::StartCode),
            AnnotationWithOffset::new(9, Annotation::EndCode),
        ]
    );
    assert_eq!(cells[2].content, "some highlighted text");
    assert_eq!(
        &cells[2].formatting,
        &[
            AnnotationWithOffset::new(0, Annotation::StartHighlight),
            AnnotationWithOffset::new(21, Annotation::EndHighlight),
        ]
    );
    assert_eq!(cells[3].content, "some italicized text");
    assert_eq!(
        &cells[3].formatting,
        &[
            AnnotationWithOffset::new(0, Annotation::StartItalics),
            AnnotationWithOffset::new(20, Annotation::EndItalics),
        ]
    );
    assert_eq!(cells[4].content, "Fiberplane");
    assert_eq!(
        &cells[4].formatting,
        &[
            AnnotationWithOffset::new(
                0,
                Annotation::StartLink {
                    url: "https://fiberplane.com".to_string()
                }
            ),
            AnnotationWithOffset::new(10, Annotation::EndLink),
        ]
    );
    assert_eq!(cells[5].content, "some strikethrough text");
    assert_eq!(
        &cells[5].formatting,
        &[
            AnnotationWithOffset::new(0, Annotation::StartStrikethrough),
            AnnotationWithOffset::new(23, Annotation::EndStrikethrough),
        ]
    );
    assert_eq!(cells[6].content, "some underlined text");
    assert_eq!(
        &cells[6].formatting,
        &[
            AnnotationWithOffset::new(0, Annotation::StartUnderline),
            AnnotationWithOffset::new(20, Annotation::EndUnderline),
        ]
    );

    assert_eq!(cells[7].content, "@Bob");
    assert_eq!(
        &cells[7].formatting,
        &[AnnotationWithOffset::new(
            0,
            Annotation::Mention(
                Mention::builder()
                    .name("Bob Bobsen".to_owned())
                    .user_id("Bob".to_owned())
                    .build()
            ),
        )]
    );

    assert_eq!(cells[8].content, "2020-01-01T00:00:00Z");
    assert_eq!(
        &cells[8].formatting,
        &[AnnotationWithOffset::new(
            0,
            Annotation::Timestamp {
                timestamp: Timestamp::parse("2020-01-01T00:00:00Z").unwrap()
            }
        )]
    );

    assert_eq!(cells[9].content, "foo:bar");
    assert_eq!(
        &cells[9].formatting,
        &[AnnotationWithOffset::new(
            0,
            Annotation::Label(Label::new("foo", "bar"))
        )]
    );

    assert_eq!(cells[10].content, "foo");
    assert_eq!(
        &cells[10].formatting,
        &[AnnotationWithOffset::new(
            0,
            Annotation::Label(Label::new("foo", ""))
        )]
    );
}

#[test]
fn formatting_nested() {
    let template = "local fp = import 'fiberplane.libsonnet';
        local fmt = fp.format;

        fp.notebook.new('title')
        .setTimeRangeRelative(60)
        .addCell(
            fp.cell.text(['some normal, ', fmt.bold(['some bold, ', fmt.italics('and some bold italicized')]), ' text'])
        )";
    let notebook = expand_template(template, EMPTY_ARGS).unwrap();
    if let Cell::Text(cell) = &notebook.cells[0] {
        assert_eq!(
            cell.content,
            "some normal, some bold, and some bold italicized text"
        );
        assert_eq!(
            &cell.formatting,
            &[
                AnnotationWithOffset::new(13, Annotation::StartBold),
                AnnotationWithOffset::new(24, Annotation::StartItalics),
                AnnotationWithOffset::new(48, Annotation::EndItalics),
                AnnotationWithOffset::new(48, Annotation::EndBold),
            ]
        );
    } else {
        panic!("expected text cell");
    }
}

#[test]
fn formatting_builder() {
    let template = "local fp = import 'fiberplane.libsonnet';
        local fmt = fp.format;

        fp.notebook.new('title')
        .setTimeRangeRelative(60)
        .addCell(
            fp.cell.text(fmt.raw('some normal, ').bold('some bold, ').italics('and some italicized').raw(' text'))
        )";
    let notebook = expand_template(template, EMPTY_ARGS).unwrap();
    if let Cell::Text(cell) = &notebook.cells[0] {
        assert_eq!(
            cell.content,
            "some normal, some bold, and some italicized text"
        );
        assert_eq!(
            &cell.formatting,
            &[
                AnnotationWithOffset::new(13, Annotation::StartBold),
                AnnotationWithOffset::new(24, Annotation::EndBold),
                AnnotationWithOffset::new(24, Annotation::StartItalics),
                AnnotationWithOffset::new(43, Annotation::EndItalics),
            ]
        );
    } else {
        panic!("expected text cell");
    }
}

#[test]
fn format_list() {
    let template = "local fp = import 'fiberplane.libsonnet';
        local c = fp.cell;
        local fmt = fp.format;

        fp.notebook.new('title')
        .setTimeRangeRelative(60)
        .addCells([
            c.orderedList([
                fmt.raw('some normal, ').bold('and some bold'),
                fmt.bold('bold item'),
                'normal item',
            ])
        ])";
    let notebook = expand_template(template, EMPTY_ARGS).unwrap();
    if let Cell::ListItem(cell) = &notebook.cells[0] {
        assert_eq!(cell.content, "some normal, and some bold");
        assert_eq!(
            &cell.formatting,
            &[
                AnnotationWithOffset::new(13, Annotation::StartBold),
                AnnotationWithOffset::new(26, Annotation::EndBold),
            ]
        );
    } else {
        panic!("wrong cell type")
    }
    if let Cell::ListItem(cell) = &notebook.cells[1] {
        assert_eq!(cell.content, "bold item");
        assert_eq!(
            &cell.formatting,
            &[
                AnnotationWithOffset::new(0, Annotation::StartBold),
                AnnotationWithOffset::new(9, Annotation::EndBold),
            ]
        );
    } else {
        panic!("wrong cell type")
    }
    if let Cell::ListItem(cell) = &notebook.cells[2] {
        assert_eq!(cell.content, "normal item");
        assert_eq!(cell.formatting, Formatting::default());
    } else {
        panic!("wrong cell type");
    }
}

#[test]
fn matches_fiberplane_rs() {
    let template = fs::read_to_string(
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("src/expand/tests/assets/template.jsonnet"),
    )
    .unwrap();
    let args = HashMap::from([("incidentName", "API Outage")]);
    let actual = expand_template(template, args).unwrap();
    assert_eq!(actual, *NOTEBOOK);
}

#[test]
fn export_notebook_to_template_and_back() {
    let template = notebook_to_template(NOTEBOOK.clone());
    let actual = expand_template(template, EMPTY_ARGS).unwrap();
    assert_eq!(actual, *NOTEBOOK);
}

#[test]
fn mustache_substitution_in_title() {
    let notebook = NewNotebook::builder()
        .title(r#"Hello {{personName}}, this is a {{notebookCategory}}"#.to_string())
        .time_range(NewTimeRange::Relative(RelativeTimeRange::from_minutes(-60)))
        .build();
    let template = notebook_to_template(notebook);
    let notebook = expand_template(
        template,
        [
            ("personName", Value::String("Bob".to_string())),
            ("notebookCategory", Value::String("Notebook".to_string())),
        ],
    )
    .unwrap();
    assert_eq!(notebook.title, "Hello Bob, this is a Notebook");
}

#[test]
fn mustache_substitution_to_function_parameters() {
    let notebook = NewNotebook::builder()
        .title(r#"Hello {{personName}}"#.to_string())
        .cells(vec![Cell::Text(
            TextCell::builder()
                .id("1")
                .content(r#"{{greeting}} {{personName}}, great to have you"#)
                .build(),
        )])
        .time_range(NewTimeRange::Relative(RelativeTimeRange::from_minutes(-60)))
        .build();
    let template = notebook_to_template(notebook);
    let params = extract_template_parameters(template).unwrap();
    // Deduplicates the `personName` parameter
    assert_eq!(params.len(), 2);
    assert_eq!(
        params[0],
        TemplateParameter::builder()
            .name("personName".to_string())
            .default_value(Value::String(r#"{{personName}}"#.to_string()))
            .ty(TemplateParameterType::String)
            .build()
    );
    assert_eq!(
        params[1],
        TemplateParameter::builder()
            .name("greeting".to_string())
            .default_value(Value::String(r#"{{greeting}}"#.to_string()))
            .ty(TemplateParameterType::String)
            .build()
    );
}

#[test]
fn export_cells_to_snippet_and_back() {
    let snippet = cells_to_snippet(&CELLS);
    let actual = expand_snippet(snippet).unwrap();
    assert_eq!(actual, *CELLS);
}
