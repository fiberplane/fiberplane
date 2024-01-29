use self::code_writer::CodeWriter;
use self::escape_string::escape_string;
use crate::FIBERPLANE_LIBRARY_PATH;
use fiberplane_models::formatting::{Annotation, AnnotationWithOffset, Formatting};
use fiberplane_models::notebooks::{Cell, HeadingType, ListType, NewNotebook};
use fiberplane_models::timestamps::TimeRange;
use fiberplane_models::utils::{char_count, char_slice, char_slice_from};
use once_cell::sync::Lazy;
use percent_encoding::percent_decode_str;
use regex::Regex;
use std::{collections::BTreeSet, fmt::Write};
use time::Duration;
use tracing::warn;

mod code_writer;
mod escape_string;
#[cfg(test)]
mod tests;

static MUSTACHE_SUBSTITUTION: Lazy<Regex> = Lazy::new(|| Regex::new(r"\{\{(\w+)\}\}").unwrap());
const FORM_ENCODED_QUERY_PREFIX: &str = "application/x-www-form-urlencoded,";

// Note: we use the NewNotebook struct because it contains
// the subset of the Notebook fields that we need to
// create a template from it.
pub fn notebook_to_template(notebook: impl Into<NewNotebook>) -> String {
    let notebook = notebook.into();

    // We assume that the time range for the template should be
    // the same duration as the notebook's time range, but it
    // will be updated so the "to" value is the time when the
    // template is evaluated.
    let time_range = TimeRange::from(notebook.time_range);
    let duration: Duration = time_range.to - time_range.from;

    let mut writer = CodeWriter::new();

    // Write the preamble
    write_preamble(&mut writer);
    writer.println("function(");
    writer.indent();

    // Add all of the variables from the title and content of the notebook
    let template_function_parameters = parse_template_function_parameters(
        &notebook.title,
        notebook.cells.iter().flat_map(Cell::content),
    );
    // If there aren't any parameters, add the title as an example of how to use template parameters
    let include_title_as_parameter = template_function_parameters.is_empty();

    for parameter_declaration in template_function_parameters {
        writer.println(parameter_declaration);
    }
    if include_title_as_parameter {
        writer.println(format!("title={}", escape_string(&notebook.title)));
    }

    // Close the template function signature
    writer.dedent();
    writer.println(")");
    writer.indent();
    writer.println("fp.notebook");

    // Add the title
    if include_title_as_parameter {
        // This references the `title` parameter added above
        writer.println(".new(title)");
    } else {
        writer.println(format!(
            ".new({})",
            escape_string_and_replace_mustache_substitutions(&notebook.title, " + ")
        ));
    }

    // Add the time range
    writer.println(format!(
        ".setTimeRangeRelative(minutes={})",
        (duration.as_seconds_f64() / 60.0).round()
    ));

    // Add labels
    if notebook.labels.is_empty() {
        writer.println(r#".addLabels({})"#);
    } else {
        writer.println(".addLabels({");
        for label in notebook.labels {
            writer.println(format!(
                "{}: {},",
                escape_string(&label.key),
                escape_string(&label.value)
            ));
        }
        writer.println("})");
    }

    // Add front matter
    if !notebook.front_matter.is_empty() {
        writer.println(".addFrontMatterValues({");
        for (fm_key, fm_value) in notebook.front_matter {
            writer.println(format!(
                "{}: {},",
                escape_string(fm_key),
                serde_json::to_string(&fm_value).expect("A JSON Value is always serializable")
            ));
        }
        writer.println("})");
    }

    // Add front matter schema
    if !notebook.front_matter_schema.is_empty() {
        writer.println("// If the front matter schema comes from a known collection, you can replace the next call with .addFrontMatterCollection('name')");
        writer.println(format!(
            ".addFrontMatterSchema({})",
            serde_json::to_string_pretty(&notebook.front_matter_schema.0)
                .expect("A Front matter schema is always serializable."),
        ));
    }

    // Add selected data sources
    for (provider_type, data_source) in notebook.selected_data_sources.iter() {
        if let Some(proxy_name) = &data_source.proxy_name {
            writer.println(format!(
                ".setDataSourceForProviderType({}, {}, {})",
                escape_string(provider_type),
                escape_string(data_source.name.as_str()),
                escape_string(proxy_name.as_str())
            ));
        } else {
            writer.println(format!(
                ".setDataSourceForProviderType({}, {})",
                escape_string(provider_type),
                escape_string(data_source.name.as_str())
            ));
        }
    }

    // Add cells
    writer.println(".addCells([");
    writer.indent();
    for cell in &notebook.cells {
        print_cell(&mut writer, cell);
    }
    writer.dedent();
    writer.println("])");
    writer.println("");

    writer.to_string()
}

/// Convert the given cells into a Snippet
pub fn cells_to_snippet(cells: &[Cell]) -> String {
    let mut writer = CodeWriter::new();
    write_preamble(&mut writer);

    writer.println("fp.snippet([");
    writer.indent();
    for cell in cells {
        print_cell(&mut writer, cell);
    }
    writer.dedent();
    writer.println("])");
    writer.println("");

    writer.to_string()
}

fn write_preamble(writer: &mut CodeWriter) {
    writer.println(
        "// For documentation on Fiberplane Templates, see: https://docs.fiberplane.com/templates",
    );
    writer.println(format!("local fp = import '{FIBERPLANE_LIBRARY_PATH}';"));
    writer.println("local c = fp.cell;");
    writer.println("local fmt = fp.format;");
    writer.println("");
}

/// Print the cell.
///
/// We try to print the cell in the most compact form that is still readable.
/// If it only has 1-2 properties, we print it on a single line.
/// If it has more, we print it on multiple lines and write out each property name.
fn print_cell(writer: &mut CodeWriter, cell: &Cell) {
    let mut args = Vec::with_capacity(5);

    // Get the helper function name, arguments, and read only property from each cell
    // (read_only is handled separately because every cell has it)
    let (function_name, read_only) = match cell {
        Cell::Checkbox(cell) => {
            args.push(("content", format_content(&cell.content, &cell.formatting)));
            args.push(("checked", cell.checked.to_string()));
            if let Some(level) = cell.level {
                args.push(("level", level.to_string()));
            }

            ("checkbox", cell.read_only)
        }
        Cell::Code(cell) => {
            args.push(("content", escape_string(&cell.content)));
            if let Some(syntax) = &cell.syntax {
                args.push(("syntax", escape_string(syntax)));
            }
            ("code", cell.read_only)
        }
        Cell::Divider(cell) => ("divider", cell.read_only),
        Cell::Heading(cell) => {
            let heading_type = match cell.heading_type {
                HeadingType::H1 => "h1",
                HeadingType::H2 => "h2",
                HeadingType::H3 => "h3",
                _ => panic!("Unknown HeadingType"),
            };
            args.push(("content", format_content(&cell.content, &cell.formatting)));
            (heading_type, cell.read_only)
        }
        Cell::Image(cell) => {
            if let Some(url) = &cell.url {
                args.push(("url", escape_string(url)));
            }
            ("image", cell.read_only)
        }
        Cell::ListItem(cell) => {
            let function_name = match cell.list_type {
                ListType::Ordered => "listItem.ordered",
                ListType::Unordered => "listItem.unordered",
                _ => panic!("Unknown ListType"),
            };
            args.push(("content", format_content(&cell.content, &cell.formatting)));
            if let Some(level) = cell.level {
                args.push(("level", level.to_string()));
            }
            if let Some(start_number) = cell.start_number {
                args.push(("startNumber", start_number.to_string()));
            }
            (function_name, cell.read_only)
        }
        Cell::Text(cell) => {
            args.push(("content", format_content(&cell.content, &cell.formatting)));
            ("text", cell.read_only)
        }
        Cell::Provider(cell) => {
            const INTENTS_WITH_TEMPLATES_HELPERS: [&str; 3] = [
                "prometheus,timeseries",
                "elasticsearch,events",
                "loki,events",
            ];

            let cell_type = match cell.intent.as_str() {
                intent if INTENTS_WITH_TEMPLATES_HELPERS.contains(&intent) => {
                    if let Some(query) = decode_provider_cell_query_data(&cell.query_data) {
                        args.extend(query.into_iter().filter_map(|(key, value)| {
                            if key == "query" {
                                Some(("content", escape_string(value)))
                            } else {
                                warn!("Unexpected argument: {key}");
                                None
                            }
                        }))
                    } else {
                        warn!(?cell, "Could not parse the query data from the cell");
                    }
                    intent
                        .split_once(',')
                        .expect("All intents in INTENTS_WITH_TEMPLATE_HELPERS have ',' inside.")
                        .0
                }
                _ => {
                    // No specific treatment is done for libjsonnet.provider function call,
                    // we just pass the raw queryData and the raw intent
                    args.push(("intent", escape_string(&cell.intent)));
                    if let Some(query_data) = &cell.query_data {
                        args.push(("queryData", escape_string(query_data)));
                    }
                    "provider"
                }
            };
            (cell_type, cell.read_only)
        }
        // Ignored cell types:
        Cell::Discussion(_) | Cell::Graph(_) | Cell::Log(_) | Cell::Table(_) => return,
        _ => {
            // Unknown cell type
            return;
        }
    };

    // Only print the read only property if it's true
    if read_only == Some(true) {
        args.push(("readOnly", "true".to_string()));
    }

    // Print the cell on one line or multiple depending on how many properties it has
    let first_param = args.first().map(|(name, _)| *name);
    match (args.len(), first_param) {
        (0, _) => writer.println(format!("c.{function_name}(),")),
        (1, Some("content")) => writer.println(format!("c.{}({}),", function_name, args[0].1)),
        (1, _) => writer.println(format!("c.{}({}={}),", function_name, args[0].0, args[0].1)),
        (2, Some("content")) => writer.println(format!(
            "c.{}({}, {}={}),",
            function_name, args[0].1, args[1].0, args[1].1
        )),
        _ => {
            writer.println(format!("c.{function_name}("));
            writer.indent();
            for (param, val) in args {
                writer.println(format!("{param}={val},"));
            }
            writer.dedent();
            writer.println("),")
        }
    };
}

fn format_content(content: &str, formatting: &Formatting) -> String {
    if formatting.is_empty() {
        return escape_string(content);
    }

    let mut output = "[".to_string();
    let mut index: u32 = 0;
    // Count the number of starting and ending annotations to handle unmatched start annotations
    let mut start_annotations = 0;
    let mut end_annotations = 0;

    // Sort the annotations by offset without cloning the annotations themselves
    let mut sorted: Vec<&AnnotationWithOffset> = formatting.iter().collect();
    sorted.sort_by_key(|f| f.offset);

    // Convert each annotation to a jsonnet helper function
    for AnnotationWithOffset {
        offset, annotation, ..
    } in sorted
    {
        // Add any content before this annotation to the output
        if *offset > index {
            output.push_str(&escape_string_and_replace_mustache_substitutions(
                char_slice(content, index, *offset),
                ", ",
            ));
            output.push_str(", ");
            index = *offset;
        }
        match annotation {
            Annotation::StartBold => {
                output.push_str("fmt.bold([");
                start_annotations += 1;
            }
            Annotation::StartCode => {
                output.push_str("fmt.code([");
                start_annotations += 1;
            }
            Annotation::StartItalics => {
                output.push_str("fmt.italics([");
                start_annotations += 1;
            }
            Annotation::StartStrikethrough => {
                output.push_str("fmt.strikethrough([");
                start_annotations += 1;
            }
            Annotation::StartUnderline => {
                output.push_str("fmt.underline([");
                start_annotations += 1;
            }
            Annotation::StartHighlight => {
                output.push_str("fmt.highlight([");
                start_annotations += 1;
            }
            Annotation::StartLink { url } => {
                output.push_str("fmt.link(url=");
                output.push_str(&escape_string(url));
                output.push_str(", content=[");
                start_annotations += 1;
            }
            Annotation::EndBold
            | Annotation::EndCode
            | Annotation::EndItalics
            | Annotation::EndStrikethrough
            | Annotation::EndUnderline
            | Annotation::EndHighlight
            | Annotation::EndLink => {
                finish_enclosure(&mut output, "]), ");
                end_annotations += 1;
            }
            Annotation::Mention(mention) => {
                write!(
                    output,
                    "fmt.mention('{}', '{}'), ",
                    mention.name, mention.user_id
                )
                .expect("Cannot write mention instruction");
                // Adding + 1 to the mention length to account for the @ sign
                index += char_count(&mention.name) + 1;
            }
            Annotation::Timestamp { timestamp } => {
                let formatted = timestamp.to_string();
                write!(output, "fmt.timestamp('{formatted}'), ")
                    .expect("Cannot write timestamp instruction");
                index += char_count(&formatted);
            }
            Annotation::Label(label) => {
                let args = match label.value.is_empty() {
                    true => format!("'{}'", label.key),
                    false => format!("'{}', '{}'", label.key, label.value),
                };
                output.push_str(&format!("fmt.label({args}), "));
                index += char_count(&label.to_string())
            }
            _ => (),
        }
    }
    // If the content ends with plain text, make sure to add it to the output
    if index < char_count(&content) {
        output.push_str(&escape_string_and_replace_mustache_substitutions(
            char_slice_from(content, index),
            ", ",
        ));
    }
    // If there are unclosed annotations, add extra closing brackets and parens
    // to close the helper function calls
    if start_annotations > end_annotations {
        for _i in 0..start_annotations - end_annotations {
            finish_enclosure(&mut output, "])")
        }
    }
    finish_enclosure(&mut output, "]");

    output
}

/// Remove trailing commas and whitespace and add the closing brackets/parens
fn finish_enclosure(string: &mut String, brackets: &str) {
    if string.ends_with(", ") {
        string.pop();
        string.pop();
    }
    string.push_str(brackets);
}

fn escape_string_and_replace_mustache_substitutions(content: &str, separator: &str) -> String {
    let escaped = escape_string(content);
    if let Some(quote) = escaped.chars().next() {
        let replaced = MUSTACHE_SUBSTITUTION
            .replace_all(&escaped, format!("{quote}{separator}$1{separator}{quote}"));
        // Remove empty strings (which can happen if the mustache substitution happens at the beginning or
        // end of the string, or if there are multiple substitutions in a row)
        replaced
            .replace(&format!("{quote}{quote}{separator}"), "")
            .replace(&format!("{separator}{quote}{quote}"), "")
    } else {
        escaped
    }
}

/// Parse the template function parameters from the title and cells and return
/// their jsonnet declarations in the form "parameter=defaultValue".
///
/// Note this will preserve the order in which the parameters are first used
fn parse_template_function_parameters<'a>(
    title: &str,
    cell_content: impl Iterator<Item = &'a str>,
) -> Vec<String> {
    let mut unique_parameters = BTreeSet::new();
    let mustache_substitution = &*MUSTACHE_SUBSTITUTION;
    let title_substitutions = mustache_substitution.captures_iter(title);
    let cell_substitutions = cell_content.flat_map(|c| mustache_substitution.captures_iter(c));
    title_substitutions
        .chain(cell_substitutions)
        .flat_map(|c| c.get(1))
        .flat_map(|variable| {
            let variable = variable.as_str();
            if unique_parameters.insert(variable) {
                // This will print "variable={{variable}}" (the extra braces are for escaping the braces)
                Some(format!("{variable}='{{{{{variable}}}}}',"))
            } else {
                None
            }
        })
        .collect()
}

fn decode_provider_cell_query_data<'a>(
    query_data: &'a Option<impl AsRef<str> + 'a>,
) -> Option<Vec<(String, String)>> {
    query_data.as_ref().and_then(|query_data| {
        query_data
            .as_ref()
            .strip_prefix(FORM_ENCODED_QUERY_PREFIX)
            .map(|encoded_query| {
                encoded_query
                    .split('&')
                    .map(|kv| {
                        if let Some((key, value)) = kv.split_once('=') {
                            let value = value.replace('+', " ");
                            (
                                percent_decode_str(key).decode_utf8_lossy().to_string(),
                                percent_decode_str(&value).decode_utf8_lossy().to_string(),
                            )
                        } else {
                            (kv.to_string(), String::new())
                        }
                    })
                    .collect()
            })
    })
}
