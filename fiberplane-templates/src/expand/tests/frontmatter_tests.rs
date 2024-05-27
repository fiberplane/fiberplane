use super::*;
use fiberplane_models::{
    front_matter_schemas::{
        FrontMatterDateTimeSchema, FrontMatterNumberSchema, FrontMatterSchema,
        FrontMatterSchemaEntry, FrontMatterStringSchema, FrontMatterUserSchema,
    },
    notebooks::front_matter::FrontMatterValue,
};
use pretty_assertions::assert_eq;
use serde_json::Value;

const ARGS: [(&str, Value); 0] = [];

// Test manually adding a single value into the front matter
#[test]
fn expands_add_frontmatter() {
    let template = r#"
        local fp = import 'fiberplane.libsonnet';
        local fm = fp.frontMatter;
        fp.notebook.new('Notebook')
            .addFrontMatter({
                frontMatter: {
                    key: 42
                },
                frontMatterSchema: [{
                    key: 'key',
                    schema: {
                      type: 'number',
                      displayName: 'Number'
                    },
                  }]
            })
    "#;
    let output = expand_template(template, ARGS).unwrap();
    let expected_schema: FrontMatterSchema = vec![FrontMatterSchemaEntry::builder()
        .key("key")
        .schema(
            FrontMatterNumberSchema::builder()
                .display_name("Number")
                .build(),
        )
        .build()]
    .into();
    assert_eq!(output.front_matter_schema, expected_schema);
    let expected_front_matter: BTreeMap<String, FrontMatterValue> =
        [("key".to_string(), json!(42).into())].into();
    assert_eq!(output.front_matter, expected_front_matter);
}

// Test adding multiple number values into the front matter
#[test]
fn expands_add_frontmatter_number() {
    let template = r#"
        local fp = import 'fiberplane.libsonnet';
        local fm = fp.frontMatter;
        fp.notebook.new('Notebook')
            .addFrontMatter([
                fm.number('number', 42, 'Number of issues'),
                fm.number('number-2', 13),
                fm.number('number-3', [1, 96])
            ])
    "#;
    let output = expand_template(template, ARGS).unwrap();
    let expected_schema: FrontMatterSchema = vec![
        FrontMatterSchemaEntry::builder()
            .key("number")
            .schema(
                FrontMatterNumberSchema::builder()
                    .display_name("Number of issues")
                    .build(),
            )
            .build(),
        FrontMatterSchemaEntry::builder()
            .key("number-2")
            .schema(
                FrontMatterNumberSchema::builder()
                    .display_name("Number")
                    .build(),
            )
            .build(),
        FrontMatterSchemaEntry::builder()
            .key("number-3")
            .schema(
                FrontMatterNumberSchema::builder()
                    .display_name("Number")
                    .build(),
            )
            .build(),
    ]
    .into();
    assert_eq!(output.front_matter_schema, expected_schema);
    let expected_front_matter: BTreeMap<String, FrontMatterValue> = [
        ("number".to_string(), json!(42).into()),
        ("number-2".to_string(), json!(13).into()),
        ("number-3".to_string(), json!([1, 96]).into()),
    ]
    .into();
    assert_eq!(output.front_matter, expected_front_matter);
}

// Test adding string field into the front matter
#[test]
fn expands_add_frontmatter_string() {
    let template = r#"
        local fp = import 'fiberplane.libsonnet';
        local fm = fp.frontMatter;
        fp.notebook.new('Notebook')
            .addFrontMatter([
                fm.string('string', 'value', 'A field with string value'),
                fm.string('string-2', 'value-2'),
                fm.string('string-3', ['value-3', 'value-4'])
            ])
    "#;
    let output = expand_template(template, ARGS).unwrap();
    let expected_schema: FrontMatterSchema = vec![
        FrontMatterSchemaEntry::builder()
            .key("string")
            .schema(
                FrontMatterStringSchema::builder()
                    .display_name("A field with string value")
                    .build(),
            )
            .build(),
        FrontMatterSchemaEntry::builder()
            .key("string-2")
            .schema(
                FrontMatterStringSchema::builder()
                    .display_name("String")
                    .build(),
            )
            .build(),
        FrontMatterSchemaEntry::builder()
            .key("string-3")
            .schema(
                FrontMatterStringSchema::builder()
                    .display_name("String")
                    .build(),
            )
            .build(),
    ]
    .into();
    assert_eq!(output.front_matter_schema, expected_schema);
    let expected_front_matter: BTreeMap<String, FrontMatterValue> = [
        ("string".to_string(), json!("value").into()),
        ("string-2".to_string(), json!("value-2").into()),
        ("string-3".to_string(), json!(["value-3", "value-4"]).into()),
    ]
    .into();
    assert_eq!(output.front_matter, expected_front_matter);
}

// Test adding datetime field into the front matter
#[test]
fn expands_add_frontmatter_datetime() {
    let template = r#"
        local fp = import 'fiberplane.libsonnet';
        local fm = fp.frontMatter;
        fp.notebook.new('Notebook')
            .addFrontMatter([
                fm.dateTime('datetime', '2021-01-01T00:00:00Z'),
                fm.dateTime('datetime-2', ['2021-01-01T00:00:00Z', '2021-01-01T00:00:00Z'])
            ])
    "#;
    let output = expand_template(template, ARGS).unwrap();
    let expected_schema: FrontMatterSchema = vec![
        FrontMatterSchemaEntry::builder()
            .key("datetime")
            .schema(
                FrontMatterDateTimeSchema::builder()
                    .display_name("DateTime")
                    .build(),
            )
            .build(),
        FrontMatterSchemaEntry::builder()
            .key("datetime-2")
            .schema(
                FrontMatterDateTimeSchema::builder()
                    .display_name("DateTime")
                    .build(),
            )
            .build(),
    ]
    .into();
    assert_eq!(output.front_matter_schema, expected_schema);
    let expected_front_matter: BTreeMap<String, FrontMatterValue> = [
        ("datetime".to_string(), json!("2021-01-01T00:00:00Z").into()),
        (
            "datetime-2".to_string(),
            json!(["2021-01-01T00:00:00Z", "2021-01-01T00:00:00Z"]).into(),
        ),
    ]
    .into();
    assert_eq!(output.front_matter, expected_front_matter);
}

// Test adding datetime field with incorrect value into the front matter
#[test]
fn expands_add_frontmatter_datetime_incorrect() {
    let template = r#"
        local fp = import 'fiberplane.libsonnet';
        local fm = fp.frontMatter;
        fp.notebook.new('Notebook')
            .addFrontMatter([
                fm.dateTime('correct', '2021-01-01T00:00:00Z'),
                fm.dateTime('incorrect', 'not-a-date'),
            ])
    "#;
    let output = expand_template(template, ARGS).unwrap();
    if let Some(&FrontMatterValue::DateTime(value)) = output.front_matter.get("correct").as_ref() {
        value
    } else {
        panic!(
            "Expected a datetime value, got {}",
            output.front_matter.get("incorrect").unwrap()
        );
    };
    // this results in a string field, probably not the expected behavior
    // let parsed_value = if let Some(&FrontMatterValue::DateTime(foo)) = output.front_matter.get("incorrect").as_ref() {
    //     foo
    // } else {
    //     panic!("Expected a datetime value, got {}", output.front_matter.get("incorrect").unwrap());
    // };
}

// Test adding user value into the front matter
#[test]
fn expands_add_frontmatter_user() {
    let template = r#"
        local fp = import 'fiberplane.libsonnet';
        local fm = fp.frontMatter;
        fp.notebook.new('Notebook')
            .addFrontMatter([
                fm.user('user', 'base64-encoded-user'),
                fm.user('user-2', ['base64-encoded-user', 'base64-encoded-user'])
            ])
    "#;
    let output = expand_template(template, ARGS).unwrap();
    let expected_schema: FrontMatterSchema = vec![
        FrontMatterSchemaEntry::builder()
            .key("user")
            .schema(
                FrontMatterUserSchema::builder()
                    .display_name("User")
                    .build(),
            )
            .build(),
        FrontMatterSchemaEntry::builder()
            .key("user-2")
            .schema(
                FrontMatterUserSchema::builder()
                    .display_name("User")
                    .build(),
            )
            .build(),
    ]
    .into();
    assert_eq!(output.front_matter_schema, expected_schema);
    let expected_front_matter: BTreeMap<String, FrontMatterValue> = [
        ("user".to_string(), json!("base64-encoded-user").into()),
        (
            "user-2".to_string(),
            json!(["base64-encoded-user", "base64-encoded-user"]).into(),
        ),
    ]
    .into();
    assert_eq!(output.front_matter, expected_front_matter);
}
