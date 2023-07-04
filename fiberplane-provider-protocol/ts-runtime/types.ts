// ============================================= //
// Types for WebAssembly runtime                 //
//                                               //
// This file is generated. PLEASE DO NOT MODIFY. //
// ============================================= //

/**
 * A rich-text annotation.
 *
 * Annotations are typically found inside a `Formatting` vector.
 */
export type Annotation =
    | { type: "start_bold" }
    | { type: "end_bold" }
    | { type: "start_code" }
    | { type: "end_code" }
    | { type: "start_highlight" }
    | { type: "end_highlight" }
    | { type: "start_italics" }
    | { type: "end_italics" }
    | { type: "start_link"; url: string }
    | { type: "end_link" }
    | { type: "mention" } & Mention
    | { type: "timestamp"; timestamp: Timestamp }
    | { type: "start_strikethrough" }
    | { type: "end_strikethrough" }
    | { type: "start_underline" }
    | { type: "end_underline" }
    | { type: "label" } & Label;

/**
 * An annotation at a specific offset in the text. Offsets are always
 * calculated by Unicode scalar values rather than byte indices.
 *
 * Used inside the `Formatting` vector.
 */
export type AnnotationWithOffset = {
    offset: number;
} & Annotation;

/**
 * Defines an array of composite fields.
 *
 * This is commonly used for arbitrarily long list of (key, value) pairs,
 * or lists of (key, operator, value) filters.
 */
export type ArrayField = {
    /**
     * Suggested label to display along the form field.
     */
    label: string;

    /**
     * Name of the field as it will be included in the encoded query or config
     * object.
     */
    name: string;

    /**
     * The minimum number of entries the array must have to be valid.
     *
     * Leaving the minimum_length to 0 makes the whole field optional.
     */
    minimumLength: number;

    /**
     * The maximum number of entries the array can have and still be valid.
     *
     * It is None when there is no maximum number
     */
    maximumLength?: number;

    /**
     * The schema of the elements inside a row of the array.
     *
     * ### Accessing row fields
     *
     * The name of each QueryField inside the element_schema can be used as
     * an indexing key for a field. That means that if `element_schema` contains
     * a [TextField](crate::providers::TextField) with the name `parameter_name`,
     * then you will be able to access the value of that field using
     * `ArrayField::get(i)::get("parameter_name")` for the i-th element.
     *
     * ### Serialization
     *
     * For example if an array field has this `element_schema`:
     * ```rust,no_run
     * # use fiberplane_models::providers::{ArrayField, TextField, SelectField, IntegerField};
     * ArrayField::new()
     *   .with_name("table")
     *   .with_label("example".to_string())
     *   .with_element_schema(vec![
     *     TextField::new().with_name("key").into(),
     *     SelectField::new().with_name("operator").with_options([
     *       "<".into(),
     *       ">".into(),
     *       "<=".into(),
     *       ">=".into(),
     *       "==".into()
     *     ]).into(),
     *     IntegerField::new().with_name("value").into(),
     *   ]);
     * ```
     *
     * Then the URL-encoded serialization for the fields is expected to use
     * the bracketed-notation. This means you _can_ encode all the
     * keys in the array in any order you want. It can look like this
     * (line breaks are only kept for legibility):
     * ```txt
     *  "table[0][key]=less+than&
     *  table[2][operator]=%3E&
     *  table[0][operator]=%3C&
     *  table[2][key]=greater+than&
     *  table[2][value]=10&
     *  table[0][value]=12"
     * ```
     *
     * or you can do the "logic" ordering too:
     * ```txt
     *  "table[0][key]=less+than&
     *  table[0][operator]=%3C&
     *  table[0][value]=12&
     *  table[1][key]=greater+than&
     *  table[1][operator]=%3E&
     *  table[1][value]=10"
     * ```
     *
     * Note that we are allowed to skip indices.
     * Any of those 2 examples above will
     * be read as:
     * ```rust,no_run
     * # #[derive(Debug, PartialEq)]
     * # struct Row { key: String, operator: String, value: u32 }
     * # let table: Vec<Row> = vec![];
     * assert_eq!(table, vec![
     *   Row {
     *     key: "less than".to_string(),
     *     operator: "<".to_string(),
     *     value: 12,
     *   },
     *   Row {
     *     key: "greater than".to_string(),
     *     operator: ">".to_string(),
     *     value: 10,
     *   },
     * ]);
     * ```
     *
     * ### Required row fields
     *
     * Any field that is marked as `required` inside `element_schema` makes it
     * mandatory to create a valid row to the Array Field.
     */
    elementSchema: QuerySchema;
};

/**
 * A request for a provider to provide auto-suggestions.
 */
export type AutoSuggestRequest = {
    /**
     * The value of the field being typed by the user, up to the focus offset.
     */
    query: string;

    /**
     * The query type of the provider we're requesting suggestions for.
     */
    query_type: string;

    /**
     * The field in the query form we're requesting suggestions for.
     */
    field: string;

    /**
     * Some other fields of the cell data.
     * The choice of which other fields are sent in the request is
     * left to the caller.
     * The encoding of the other fields is left to the implementation
     * in Studio, and follows the format of
     * cells [Query Data](crate::ProviderCell::query_data).
     */
    other_field_data?: string;
};

/**
 * Binary blob for passing data in arbitrary encodings.
 *
 * Binary blobs are both consumed and produced by providers. Note that for many
 * use-cases, we use agreed on MIME types as defined in
 * [RFC 47](https://www.notion.so/fiberplane/RFC-47-Data-Model-for-Providers-2-0-0b5b1716dbc8450f882d33effb388c5b).
 * Providers are able to use custom MIME types if they desire.
 *
 * We can also store blobs in cells, but for this we use [EncodedBlob] to allow
 * JSON serialization.
 */
export type Blob = {
    /**
     * Raw data.
     */
    data: Uint8Array;

    /**
     * MIME type to use for interpreting the raw data.
     *
     * We keep track of this, so that we can elide unnecessary calls to
     * `extract_data()`, and are able to perform migrations on data specified
     * in any of the `application/vnd.fiberplane.*` types. For other types of
     * data, providers are responsible for migrations, and they are able to
     * include version numbers in their MIME type strings, if desired.
     */
    mimeType: string;
};

/**
 * Representation of a single notebook cell.
 */
export type Cell =
    | { type: "checkbox" } & CheckboxCell
    | { type: "code" } & CodeCell
    | { type: "discussion" } & DiscussionCell
    | { type: "divider" } & DividerCell
    | { type: "graph" } & GraphCell
    | { type: "heading" } & HeadingCell
    | { type: "image" } & ImageCell
    | { type: "list_item" } & ListItemCell
    | { type: "log" } & LogCell
    | { type: "provider" } & ProviderCell
    | { type: "table" } & TableCell
    | { type: "timeline" } & TimelineCell
    | { type: "text" } & TextCell;

export type CheckboxCell = {
    id: string;
    checked: boolean;
    content: string;

    /**
     * Optional formatting to be applied to the cell's content.
     */
    formatting?: Formatting;
    level?: number;
    readOnly?: boolean;
};

/**
 * Defines a field that produces a boolean value.
 *
 * For JSON/YAML encoding, the value will be represented as a native boolean.
 * In the case of "application/x-www-form-urlencoded", it will be represented
 * by the value defined in the `value` field, which will be either present or
 * not, similar to the encoding of HTML forms.
 */
export type CheckboxField = {
    /**
     * Whether the checkbox should be initially checked if no query data is
     * present.
     */
    checked: boolean;

    /**
     * Suggested label to display along the checkbox.
     */
    label: string;

    /**
     * Name of the field as it will be included in the encoded query or config
     * object.
     */
    name: string;

    /**
     * Whether the checkbox must be checked.
     *
     * This allows for the use case of implementing Terms of Service checkboxes
     * in config forms.
     */
    required: boolean;

    /**
     * Value of the field as it will be included in the encoded query. Note
     * that only checked checkboxes will be included.
     *
     * If the data is encoded using either JSON or YAML, the checkbox state is
     * encoded as a boolean and this value will not be used.
     */
    value: string;
};

export type CodeCell = {
    id: string;
    content: string;
    readOnly?: boolean;

    /**
     * Optional MIME type to use for syntax highlighting.
     */
    syntax?: string;
};

export type ConfigField =
    | { type: "checkbox" } & CheckboxField
    | { type: "integer" } & IntegerField
    | { type: "select" } & SelectField
    | { type: "text" } & TextField;

export type ConfigSchema = Array<ConfigField>;

/**
 * Defines a field that produces two `DateTime` values, a "from" and a "to"
 * value.
 *
 * For JSON/YAML encoding, the value will be represented as an object with
 * `from` and `to` fields. In the case of "application/x-www-form-urlencoded",
 * it will be represented as a single string and the "from" and "to" parts will
 * be separated by a space.
 */
export type DateTimeRangeField = {
    /**
     * Suggested label to display along the field.
     */
    label: string;

    /**
     * Name of the field as it will be included in the encoded query or config
     * object.
     */
    name: string;

    /**
     * Suggested placeholder to display when there is no value.
     */
    placeholder: string;

    /**
     * Whether a value is required.
     */
    required: boolean;
};

export type DiscussionCell = {
    id: string;
    threadId: string;
    readOnly?: boolean;
};

export type DividerCell = {
    id: string;
    readOnly?: boolean;
};

/**
 * base64-encoded version of [Blob].
 */
export type EncodedBlob = {
    /**
     * Raw data, encoded using base64 so it can be serialized using JSON.
     */
    data: string;

    /**
     * MIME type to use for interpreting the raw data.
     *
     * See [Blob::mime_type].
     */
    mimeType: string;
};

export type Error =
    | { type: "unsupported_request" }
    | {
        type: "validation_error";

        /**
         * List of errors, so all fields that failed validation can
         * be highlighted at once.
         */
        errors: Array<ValidationError>;
    }
    | { type: "http"; error: HttpRequestError }
    | { type: "data"; message: string }
    | { type: "deserialization"; message: string }
    | { type: "config"; message: string }
    | { type: "not_found" }
    | { type: "proxy_disconnected" }
    | { type: "invocation"; message: string }
    | { type: "other"; message: string };

/**
 * Defines a field that allows files to be uploaded as part of the query data.
 *
 * Query data that includes files will be encoded using "multipart/form-data".
 */
export type FileField = {
    /**
     * Name of the field as it will be included in the encoded query or config
     * object.
     */
    name: string;

    /**
     * Suggested label to display along the field.
     */
    label: string;

    /**
     * Whether multiple files may be uploaded.
     */
    multiple: boolean;

    /**
     * Whether a file is required.
     */
    required: boolean;
};

export type Formatting = Array<AnnotationWithOffset>;

export type GraphCell = {
    id: string;

    /**
     * Links to the data to render in the graph.
     */
    dataLinks?: Array<string>;
    graphType: GraphType;
    readOnly?: boolean;
    stackingType: StackingType;
};

export type GraphType =
    | "bar"
    | "line";

export type HeadingCell = {
    id: string;
    headingType: HeadingType;
    content: string;

    /**
     * Optional formatting to be applied to the cell's content.
     */
    formatting?: Formatting;
    readOnly?: boolean;
};

export type HeadingType =
    | "h1"
    | "h2"
    | "h3";

/**
 * HTTP request options.
 */
export type HttpRequest = {
    url: string;
    method: HttpRequestMethod;
    headers?: Record<string, string>;
    body?: Uint8Array;
};

/**
 * Possible errors that may happen during an HTTP request.
 */
export type HttpRequestError =
    | { type: "offline" }
    | { type: "no_route" }
    | { type: "connection_refused" }
    | { type: "timeout" }
    | { type: "response_too_big" }
    | { type: "server_error"; statusCode: number; response: Uint8Array }
    | { type: "other"; reason: string };

/**
 * HTTP request method.
 */
export type HttpRequestMethod =
    | "DELETE"
    | "GET"
    | "HEAD"
    | "OPTIONS"
    | "PATCH"
    | "POST"
    | "PUT";

/**
 * Response to an HTTP request.
 */
export type HttpResponse = {
    body: Uint8Array;
    headers: Record<string, string>;
    statusCode: number;
};

export type ImageCell = {
    id: string;
    fileId?: string;

    /**
     * Used to indicates the upload progress.
     * If file_id is set this shouldn't be set
     * Also: if no progress is set and no file_id exists
     * it means the cell is in the initial state (ready for upload)
     */
    progress?: number;
    readOnly?: boolean;
    width?: number;
    height?: number;

    /**
     * Will contain a hash to show as a preview for the image
     */
    preview?: string;

    /**
     * URL of the image if it was originally hosted on a remote server.
     * This will not be set if the image was uploaded through the
     * Fiberplane Studio.
     */
    url?: string;
};

/**
 * Defines a field that allows integer numbers to be entered.
 */
export type IntegerField = {
    /**
     * Name of the field as it will be included in the encoded query or config
     * object.
     */
    name: string;

    /**
     * Suggested label to display along the field.
     */
    label: string;

    /**
     * Optional maximum value to be entered.
     */
    max?: number;

    /**
     * Optional minimal value to be entered.
     */
    min?: number;

    /**
     * Suggested placeholder to display when there is no value.
     */
    placeholder: string;

    /**
     * Whether a value is required.
     */
    required: boolean;

    /**
     * Specifies the granularity that any specified numbers must adhere to.
     *
     * If omitted, `step` defaults to "1", meaning only integers are allowed.
     */
    step?: number;
};

/**
 * Labels that are associated with a Notebook.
 */
export type Label = {
    /**
     * The key of the label. Should be unique for a single Notebook.
     */
    key: string;

    /**
     * The value of the label. Can be left empty.
     */
    value: string;
};

/**
 * Defines a field that allows labels to be selected.
 *
 * For JSON/YAML encoding, the value will be represented as a string or an
 * array of strings, depending on the value of the `multiple` field. In the
 * case of "application/x-www-form-urlencoded", the value is always a single
 * string and multiple labels will be space-separated.
 */
export type LabelField = {
    /**
     * Name of the field as it will be included in the encoded query or config
     * object.
     */
    name: string;

    /**
     * Suggested label to display along the field (not to be confused with
     * labels to be selected).
     */
    label: string;

    /**
     * Whether multiple labels may be selected.
     */
    multiple: boolean;

    /**
     * Suggested placeholder to display when there is no value.
     */
    placeholder: string;

    /**
     * Whether a value is required.
     */
    required: boolean;
};

export type ListItemCell = {
    id: string;
    content: string;

    /**
     * Optional formatting to be applied to the cell's content.
     */
    formatting?: Formatting;
    listType: ListType;
    level?: number;
    readOnly?: boolean;
    startNumber?: number;
};

export type ListType =
    | "ordered"
    | "unordered";

export type LogCell = {
    id: string;

    /**
     * Links to the data to render in the log.
     */
    dataLinks?: Array<string>;
    readOnly?: boolean;
    displayFields?: Array<string>;
    hideSimilarValues?: boolean;
    expandedIndices?: Array<LogRecordIndex>;
    visibilityFilter?: LogVisibilityFilter;
    selectedIndices?: Array<LogRecordIndex>;
    highlightedIndices?: Array<LogRecordIndex>;
};

/**
 * A single expanded row of log records, as identified by [key] and [index]
 * pointing into the source data of the LogCell.
 */
export type LogRecordIndex = {
    /**
     * Index of the data link that produced the log record.
     */
    linkIndex: number;

    /**
     * Index of the record within the data of a single data link.
     */
    recordIndex: number;
};

export type LogVisibilityFilter =
    | "all"
    | "selected"
    | "highlighted";

/**
 * Annotation for the mention of a user.
 *
 * Mentions do not have a start and end offset. Instead, they occur at the
 * start offset only and are expected to run up to the end of the name of
 * the mentioned user. If however, for unforeseen reasons, the plain text
 * being annotated does not align with the name inside the mention, the
 * mention will stop at the first non-matching character. Mentions for
 * which the first character of the name does not align must be ignored in
 * their entirety.
 */
export type Mention = {
    name: string;
    userId: string;
};

/**
 * A single metric value.
 *
 * Metric values are taken at a specific timestamp and contain a floating-point
 * value as well as OpenTelemetry metadata.
 */
export type Metric = {
    time: Timestamp;
    value: number;
} & OtelMetadata;

/**
 * Metadata following the OpenTelemetry metadata spec.
 */
export type OtelMetadata = {
    attributes: Record<string, any>;
    resource: Record<string, any>;
    traceId?: OtelTraceId;
    spanId?: OtelSpanId;
};

/**
 * SeverityNumber, as specified by OpenTelemetry:
 *  https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#field-severitynumber
 */
export type OtelSeverityNumber = number;

/**
 * Span ID, as specified by OpenTelemetry:
 *  https://opentelemetry.io/docs/reference/specification/overview/#spancontext
 */
export type OtelSpanId = Uint8Array;

/**
 * Trace ID, as specified by OpenTelemetry:
 *  https://opentelemetry.io/docs/reference/specification/overview/#spancontext
 */
export type OtelTraceId = Uint8Array;

export type ProviderCell = {
    id: string;

    /**
     * The intent served by this provider cell.
     *
     * See: https://www.notion.so/fiberplane/RFC-45-Provider-Protocol-2-0-Revised-4ec85a0233924b2db0010d8cdae75e16#c8ed5dfbfd764e6bbd5c5b79333f9d6e
     */
    intent: string;

    /**
     * Query data encoded as `"<mime-type>,<data>"`, where the MIME type is
     * either `"application/x-www-form-urlencoded"` or `"multipart/form-data"`.
     * This is used for storing data for the Query Builder.
     *
     * Note: The format follows the specification for data URLs, without the
     *       `data:` prefix. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs
     */
    queryData?: string;

    /**
     * Optional response data from the provider.
     */
    response?: EncodedBlob;

    /**
     * Optional list of generated output cells.
     */
    output?: Array<Cell>;
    readOnly?: boolean;
};

export type ProviderConfig = any;

/**
 * A single event that is used within providers.
 *
 * Events occur at a given time and optionally last until a given end time.
 * They may contain both event-specific metadata as well as OpenTelemetry
 * metadata.
 */
export type ProviderEvent = {
    time: Timestamp;
    endTime?: Timestamp;
    title: string;
    description?: string;
    severity?: OtelSeverityNumber;
    labels: Record<string, string>;
} & OtelMetadata;

export type ProviderRequest = {
    /**
     * Query type that is part of the
     * [Intent](https://www.notion.so/fiberplane/RFC-45-Provider-Protocol-2-0-Revised-4ec85a0233924b2db0010d8cdae75e16#c8ed5dfbfd764e6bbd5c5b79333f9d6e)
     * through which the provider is invoked.
     */
    queryType: string;

    /**
     * Query data.
     *
     * This is usually populated from the [ProviderCell::query_data] field,
     * meaning the MIME type will be `"application/x-www-form-urlencoded"`
     * when produced by Studio's Query Builder.
     */
    queryData: Blob;

    /**
     * Configuration for the data source.
     */
    config: ProviderConfig;

    /**
     * Optional response from a previous invocation.
     * May be used for implementing things like filtering without additional
     * server roundtrip.
     */
    previousResponse?: Blob;
};

/**
 * Response type for status requests.
 *
 * To be serialized using the `application/vnd.fiberplane.provider-status`
 * MIME type.
 */
export type ProviderStatus = {
    /**
     * Indicates whether the provider is available to be queried.
     */
    status: Result<void, Error>;

    /**
     * Version string of the provider.
     *
     * Arbitrary strings may be used, such as commit hashes, but release
     * versions of providers are expected to report semver versions.
     */
    version?: string;

    /**
     * Human-readable timestamp at which the provider was built.
     *
     * Only used for diagnostics.
     */
    builtAt?: string;
};

export type QueryField =
    | { type: "array" } & ArrayField
    | { type: "checkbox" } & CheckboxField
    | { type: "date_time_range" } & DateTimeRangeField
    | { type: "file" } & FileField
    | { type: "label" } & LabelField
    | { type: "integer" } & IntegerField
    | { type: "select" } & SelectField
    | { type: "text" } & TextField;

export type QuerySchema = Array<QueryField>;

/**
 * A result that can be either successful (`Ok`) or represent an error (`Err`).
 */
export type Result<T, E> =
    /**
     * Represents a successful result.
     */
    | { Ok: T }
    /**
     * Represents an error.
     */
    | { Err: E };

/**
 * Defines a field that allows selection from a predefined list of options.
 *
 * Values to be selected from can be either hard-coded in the schema, or
 * (only for query forms) fetched on-demand the same way as auto-suggestions.
 */
export type SelectField = {
    /**
     * Name of the field as it will be included in the encoded query or config
     * object.
     */
    name: string;

    /**
     * Suggested label to display along the field.
     */
    label: string;

    /**
     * Whether multiple values may be selected.
     */
    multiple: boolean;

    /**
     * A list of options to select from.
     *
     * In addition to the options in this list, the auto-suggest mechanism
     * can also fetch options when the user starts typing in this field. In
     * this case, `supports_suggestions` should be set to `true`.
     */
    options: Array<string>;

    /**
     * Suggested placeholder to display when there is no value.
     */
    placeholder: string;

    /**
     * An optional list of fields that should be filled in before allowing the
     * user to fill in this field. This forces a certain ordering in the data
     * entry, which enables richer auto-suggestions, since the filled in
     * prerequisite fields can provide additional context.
     */
    prerequisites: Array<string>;

    /**
     * Whether a value is required.
     */
    required: boolean;

    /**
     * Whether the provider supports auto-suggestions for this field.
     */
    supportsSuggestions: boolean;
};

export type StackingType =
    | "none"
    | "stacked"
    | "percentage";

/**
 * A suggestion for a provider's auto-suggest functionality.
 */
export type Suggestion = {
    /**
     * The offset to start applying the suggestion,
     *
     * All text should be replaced from that offset up to the end of the
     * query in AutoSuggestRequest.
     *
     * When missing, append the suggestion to the cursor
     */
    from?: number;
    text: string;
    description?: string;
};

/**
 * Defines a query type supported by a provider.
 */
export type SupportedQueryType = {
    /**
     * User-friendly label to use for the query type.
     */
    label: string;

    /**
     * The query type supported by the provider.
     *
     * There are predefined query types, such as "table" and "log", but
     * providers may also implement custom query types, which it should prefix
     * with "x-".
     */
    queryType: string;

    /**
     * The query schema defining the format of the `query_data` to be submitted
     * with queries of this type.
     */
    schema: QuerySchema;

    /**
     * MIME types supported for extraction. Any MIME type specified here should
     * be valid as an argument to `extract_data()` when passed a response from
     * queries of this type.
     *
     * E.g.:
     * ```
     * vec![
     *     "application/vnd.fiberplane.events",
     *     "application/vnd.fiberplane.metrics"
     * ];
     * ```
     */
    mimeTypes: Array<string>;
};

export type TableCell = {
    id: string;
    readOnly?: boolean;

    /**
     * Describes which key in the TableRow element to render
     * and the order of definitions also determines the order
     * of the columns
     */
    columnDefs?: Array<TableColumnDefinition>;

    /**
     * Holds the values/data
     */
    rows?: Array<TableRowData>;
};

export type TableCellValue =
    | { type: "empty" }
    | { type: "cell"; cell: Cell };

export type TableColumnDefinition = {
    /**
     * Key under which data for this colum is stored in the row data
     */
    key: string;

    /**
     * Table heading text.
     */
    title: string;
};

export type TableRowData = Record<string, TableCellValue>;

export type TextCell = {
    id: string;
    content: string;

    /**
     * Optional formatting to be applied to the cell's content.
     */
    formatting?: Formatting;
    readOnly?: boolean;
};

/**
 * Defines a free-form text entry field.
 *
 * This is commonly used for filter text and query entry.
 */
export type TextField = {
    /**
     * Suggested label to display along the form field.
     */
    label: string;

    /**
     * Whether multi-line input is useful for this provider.
     */
    multiline: boolean;

    /**
     * Whether multiple values may be inserted.
     */
    multiple: boolean;

    /**
     * Name of the field as it will be included in the encoded query or config
     * object.
     */
    name: string;

    /**
     * Suggested placeholder to display when there is no value.
     */
    placeholder: string;

    /**
     * An optional list of fields that should be filled in before allowing the
     * user to fill in this field. This forces a certain ordering in the data
     * entry, which enables richer auto-suggestions, since the filled in
     * prerequisite fields can provide additional context.
     */
    prerequisites: Array<string>;

    /**
     * Whether a value is required.
     */
    required: boolean;

    /**
     * Whether the provider supports auto-suggestions for this field.
     */
    supportsSuggestions: boolean;
};

export type TimelineCell = {
    id: string;

    /**
     * Links to the data to render in the timeline.
     */
    dataLinks?: Array<string>;
    readOnly?: boolean;
};

export type TimeRange = {
    from: Timestamp;
    to: Timestamp;
};
  
/**
 * A series of metrics over time, with metadata.
 */
export type Timeseries = {
    name: string;
    labels: Record<string, string>;
    metrics: Array<Metric>;

    /**
     * Whether the series should be rendered. Can be toggled by the user.
     */
    visible: boolean;
} & OtelMetadata;

export type Timestamp = string;

export type ValidationError = {
    /**
     * Refers to a field from the query schema.
     */
    fieldName: string;

    /**
     * Description of why the validation failed.
     */
    message: string;
};
