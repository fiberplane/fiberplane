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
    | { type: "timestamp"; timestamp: string }
    | { type: "start_strikethrough" }
    | { type: "end_strikethrough" }
    | { type: "start_underline" }
    | { type: "end_underline" }
    | { type: "label" } & Label;

/**
 * Newtype representing `(offset, Annotation)` tuples.
 *
 * Used inside the `Formatting` vector.
 */
export type AnnotationWithOffset = {
    offset: number;
} & Annotation;

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
    | "POST";

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

    /**
     * Optional title to assign the cell.
     */
    title: string;

    /**
     * Optional formatting to apply to the title.
     */
    formatting?: Formatting;
    readOnly?: boolean;
};

export type ProviderConfig = any;

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

export type QueryField =
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
