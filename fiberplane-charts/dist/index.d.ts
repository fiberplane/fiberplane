/// <reference types="react" />
declare module "colors" {
    import type { DefaultTheme } from "styled-components";
    export type SupportColors = keyof DefaultTheme;
    export function getChartColor(i: number): keyof DefaultTheme;
}
declare module "constants" {
    export const HEIGHT = 275;
    export const MARGINS: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}
declare module "providerTypes" {
    /**
     * A rich-text annotation.
     *
     * Annotations are typically found inside a `Formatting` vector.
     */
    export type Annotation = {
        type: "start_bold";
    } | {
        type: "end_bold";
    } | {
        type: "start_code";
    } | {
        type: "end_code";
    } | {
        type: "start_highlight";
    } | {
        type: "end_highlight";
    } | {
        type: "start_italics";
    } | {
        type: "end_italics";
    } | {
        type: "start_link";
        url: string;
    } | {
        type: "end_link";
    } | ({
        type: "mention";
    } & Mention) | {
        type: "timestamp";
        timestamp: Timestamp;
    } | {
        type: "start_strikethrough";
    } | {
        type: "end_strikethrough";
    } | {
        type: "start_underline";
    } | {
        type: "end_underline";
    } | ({
        type: "label";
    } & Label);
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
    export type Cell = ({
        type: "checkbox";
    } & CheckboxCell) | ({
        type: "code";
    } & CodeCell) | ({
        type: "discussion";
    } & DiscussionCell) | ({
        type: "divider";
    } & DividerCell) | ({
        type: "graph";
    } & GraphCell) | ({
        type: "heading";
    } & HeadingCell) | ({
        type: "image";
    } & ImageCell) | ({
        type: "list_item";
    } & ListItemCell) | ({
        type: "log";
    } & LogCell) | ({
        type: "provider";
    } & ProviderCell) | ({
        type: "table";
    } & TableCell) | ({
        type: "timeline";
    } & TimelineCell) | ({
        type: "text";
    } & TextCell);
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
    export type ConfigField = ({
        type: "checkbox";
    } & CheckboxField) | ({
        type: "integer";
    } & IntegerField) | ({
        type: "select";
    } & SelectField) | ({
        type: "text";
    } & TextField);
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
    export type Error = {
        type: "unsupported_request";
    } | {
        type: "validation_error";
        /**
           * List of errors, so all fields that failed validation can
           * be highlighted at once.
           */
        errors: Array<ValidationError>;
    } | {
        type: "http";
        error: HttpRequestError;
    } | {
        type: "data";
        message: string;
    } | {
        type: "deserialization";
        message: string;
    } | {
        type: "config";
        message: string;
    } | {
        type: "not_found";
    } | {
        type: "proxy_disconnected";
    } | {
        type: "invocation";
        message: string;
    } | {
        type: "other";
        message: string;
    };
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
    export type GraphType = "bar" | "line";
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
    export type HeadingType = "h1" | "h2" | "h3";
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
    export type HttpRequestError = {
        type: "offline";
    } | {
        type: "no_route";
    } | {
        type: "connection_refused";
    } | {
        type: "timeout";
    } | {
        type: "response_too_big";
    } | {
        type: "server_error";
        statusCode: number;
        response: Uint8Array;
    } | {
        type: "other";
        reason: string;
    };
    /**
     * HTTP request method.
     */
    export type HttpRequestMethod = "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT";
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
    export type ListType = "ordered" | "unordered";
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
    export type LogVisibilityFilter = "all" | "selected" | "highlighted";
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
    export type QueryField = ({
        type: "array";
    } & ArrayField) | ({
        type: "checkbox";
    } & CheckboxField) | ({
        type: "date_time_range";
    } & DateTimeRangeField) | ({
        type: "file";
    } & FileField) | ({
        type: "label";
    } & LabelField) | ({
        type: "integer";
    } & IntegerField) | ({
        type: "select";
    } & SelectField) | ({
        type: "text";
    } & TextField);
    export type QuerySchema = Array<QueryField>;
    /**
     * A result that can be either successful (`Ok`) or represent an error (`Err`).
     */
    export type Result<T, E> = 
    /**
     * Represents a successful result.
     */
    {
        Ok: T;
    }
    /**
     * Represents an error.
     */
     | {
        Err: E;
    };
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
    export type StackingType = "none" | "stacked" | "percentage";
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
    export type TableCellValue = {
        type: "empty";
    } | {
        type: "cell";
        cell: Cell;
    };
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
}
declare module "types" {
    import type { Timestamp } from "providerTypes";
    export type { GraphType, Metric, OtelMetadata, StackingType, Timeseries, Timestamp, } from "providerTypes";
    /**
     * Function to invoke to close the tooltip.
     */
    export type CloseTooltipFn = () => void;
    /**
     * Function to display a tooltip relative to the given anchor containing the
     * given React content.
     *
     * Should return a function to close the tooltip.
     */
    export type ShowTooltipFn = (anchor: TooltipAnchor, content: React.ReactNode) => CloseTooltipFn;
    export type TimeRange = {
        from: Timestamp;
        to: Timestamp;
    };
    /**
     * Anchor to determine where the tooltip should be positioned.
     *
     * Positioning relative to the anchor is left to the callback provided.
     */
    export type TooltipAnchor = HTMLElement | VirtualElement;
    export type VirtualElement = {
        getBoundingClientRect: () => DOMRect;
        contextElement: Element;
    };
}
declare module "utils/closestPoints" {
    import type { TimeScale, ValueScale } from "MetricsChart/scales";
    export function toClosestPointArgs(args: {
        event: React.MouseEvent<SVGElement>;
        xScale: TimeScale;
        yScale: ValueScale;
        /**
         * Determine square boundaries within which to search for the closest point.
         *
         * The square side is 2 * EPS pixels.
         *
         * By default the value of 20 is used
         */
        EPS?: number;
    }): {
        xRange: Boundary;
        yRange: Boundary;
    };
    export type Boundary = {
        value: number;
        high: number;
        low: number;
    };
    type GetBoundaryArgs = {
        value: number;
        EPS: number;
        scale: TimeScale | ValueScale;
    };
    export function getBoundary({ value, EPS, scale }: GetBoundaryArgs): Boundary;
    export type ClosestPointArgs = {
        xRange: Boundary;
        yRange: Boundary;
    };
    export function insideRange(value: number, range: Boundary): boolean;
}
declare module "utils/compact" {
    /**
     * Strips all falsy values from an array.
     */
    export function compact<T>(items: Array<T | false | undefined | null | 0 | "">): Array<T>;
}
declare module "utils/convert" {
    import type { Timeseries } from "providerTypes";
    export const dateKey: unique symbol;
    export type DataItem = {
        [dateKey]: string;
        data: Map<Timeseries, number>;
    };
    export function getTimestamp(d: DataItem): number;
    export function dataToPercentages(dataItems: Array<DataItem>): Array<DataItem>;
    export function toDataItems(timeseriesData: ReadonlyArray<Timeseries>): Array<DataItem>;
}
declare module "utils/findUniqueKeys" {
    import type { Timeseries } from "providerTypes";
    /**
     * Return a list of keys whose values vary across series (or don't exist
     * everywhere).
     */
    export function findUniqueKeys(timeseriesData: Array<Timeseries>): string[];
}
declare module "utils/sortBy" {
    /**
     * Sorts an array ascending by priority.
     *
     * *Warning:* As this function uses `Array#sort()` it also mutates the input
     * array.
     */
    export function sortBy<T, U extends number | string>(array: Array<T>, getPriorityFn: (item: T) => U, reverse?: boolean): T[];
}
declare module "utils/formatTimeseries" {
    import type { Timeseries } from "types";
    /**
     * Format metric to string. This is used to generate human readable strings
     *
     * Sorting of the labels is optional, but in the UI can be handy to more quickly find
     * a specific label in the text
     */
    export function formatTimeseries(timeseries: Timeseries, { sortLabels }?: {
        sortLabels?: boolean;
    }): string;
    export const FormattedTimeseries: import("react").NamedExoticComponent<{
        metric: Timeseries;
        sortLabels?: boolean;
        emphasizedKeys?: string[];
    }>;
}
declare module "utils/mergeRefs" {
    /**
     * Taken from: https://github.com/gregberge/react-merge-refs
     *
     * Copyright (c) 2020 Greg Bergé
     *
     * @license MIT
     */
    export function mergeRefs<T extends HTMLElement>(refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>): React.RefCallback<T>;
}
declare module "utils/noop" {
    export function noop(): void;
}
declare module "utils/preventDefault" {
    export function preventDefault(event: Event | React.SyntheticEvent): void;
}
declare module "utils/scaleFormatter" {
    import type { NumberValue, ScaleBand } from "d3-scale";
    import type { TickFormatter } from "@visx/axis";
    export function getTimeFormatter(scale: ScaleBand<number>): TickFormatter<Date | NumberValue>;
}
declare module "utils/timestamps" {
    import type { Timestamp } from "providerTypes";
    export const dateToSeconds: (date: Date) => number;
    export const secondsToTimestamp: (seconds: number) => Timestamp;
    export const timestampToDate: (timestamp: Timestamp) => Date;
    export const timestampToSeconds: (timestamp: Timestamp) => number;
    export const timestampToMs: (value: Timestamp) => number;
}
declare module "utils/useragent" {
    export const isMac: boolean;
}
declare module "utils/index" {
    export * from "utils/closestPoints";
    export * from "utils/compact";
    export * from "utils/convert";
    export * from "utils/findUniqueKeys";
    export * from "utils/formatTimeseries";
    export * from "utils/mergeRefs";
    export * from "utils/noop";
    export * from "utils/preventDefault";
    export * from "utils/scaleFormatter";
    export * from "utils/sortBy";
    export * from "utils/timestamps";
    export * from "utils/useragent";
}
declare module "context/ChartSizeContext" {
    export type ChartSizeContextValue = {
        width: number;
        height: number;
        xMax: number;
        yMax: number;
    };
    /**
     * Context for tracking the size of the chart.
     */
    export const ChartSizeContext: import("react").Context<ChartSizeContextValue>;
}
declare module "context/CoreControlsContext" {
    export type CoreControls = {
        zoom(factor: number, focusRatio?: number): void;
        move(deltaRation: number): void;
    };
    /**
     * Context that handles the result of useCoreControls hooks
     */
    export const CoreControlsContext: import("react").Context<CoreControls>;
}
declare module "context/FocusedTimeseriesApiContext" {
    import type { Timeseries } from "types";
    export type FocusedTimeseriesApi = {
        setFocusedTimeseries: (focusedTimeseries: Timeseries | null) => void;
    };
    export const FocusedTimeseriesApiContext: import("react").Context<FocusedTimeseriesApi>;
}
declare module "context/FocusedTimeseriesStateContext" {
    import type { Timeseries } from "types";
    export type FocusedTimeseriesState = {
        focusedTimeseries: Timeseries | null;
    };
    export const FocusedTimeseriesStateContext: import("react").Context<FocusedTimeseriesState>;
}
declare module "context/InteractiveControlsContext" {
    export type InteractiveControls = {
        reset(): void;
        startDrag(start: number | null): void;
        startZoom(start: number | null): void;
        updateEndValue(end: number): void;
    };
    /**
     * One of two parts of the useInteractiveControlState hook results
     *
     * This is the api/functional part
     */
    export const InteractiveControlsContext: import("react").Context<InteractiveControls>;
}
declare module "context/InteractiveControlsStateContext" {
    export type InteractiveControlsState = {
        type: "none";
    } | {
        type: "drag";
        start: number;
        end?: number;
    } | {
        type: "zoom";
        start: number;
        end?: number;
    };
    export const defaultControlsState: InteractiveControlsState;
    /**
     * Holds the interactive control state as returned by the useInteractiveControlState
     */
    export const InteractiveControlsStateContext: import("react").Context<InteractiveControlsState>;
}
declare module "context/TooltipApiContext" {
    import type { SupportColors } from "colors";
    export type GraphTooltip = {
        top: number;
        left: number;
        element: SVGSVGElement;
        colorName: SupportColors;
        metric: JSX.Element;
    };
    export type TooltipApi = {
        showTooltip: (tooltip: GraphTooltip) => void;
        hideTooltip: () => void;
    };
    export const TooltipContext: import("react").Context<TooltipApi>;
}
declare module "context/index" {
    export * from "context/ChartSizeContext";
    export * from "context/CoreControlsContext";
    export * from "context/FocusedTimeseriesApiContext";
    export * from "context/FocusedTimeseriesStateContext";
    export * from "context/InteractiveControlsContext";
    export * from "context/InteractiveControlsStateContext";
    export * from "context/TooltipApiContext";
}
declare module "MetricsChart/scales" {
    import type { InteractiveControlsState } from "context/index";
    import type { Metric, StackingType, TimeRange, Timeseries } from "types";
    export const x: (metric: Metric) => number;
    export const y: (metric: Metric) => number;
    export function getTimeScale(timeRange: TimeRange, xMax: number): import("d3-scale").ScaleTime<number, number, never>;
    export type TimeScale = ReturnType<typeof getTimeScale>;
    /**
     * In short: get two scales. This is used for bar charts (no `stackingType`),
     * where there's an `xScale` chart which contains the timeseries and a
     * `groupScale` for each of the metrics for each timestamp.
     */
    export function getGroupedScales(timeseriesData: Array<Timeseries>, controlsState: InteractiveControlsState, xMax: number): {
        xScale: import("d3-scale").ScaleBand<number>;
        groupScale: import("d3-scale").ScaleBand<string>;
    };
    export type GroupedScales = ReturnType<typeof getGroupedScales>;
    export type XScaleTypes = TimeScale | GroupedScales["xScale"];
    export function getValueScale({ timeseriesData, yMax, stackingType, }: {
        timeseriesData: Array<Timeseries>;
        yMax: number;
        stackingType?: StackingType;
    }): import("d3-scale").ScaleLinear<number, number, never>;
    export type ValueScale = ReturnType<typeof getValueScale>;
}
declare module "MetricsChart/types" {
    import type { GraphType, StackingType, Timeseries, TimeRange, ShowTooltipFn } from "types";
    import type { GroupedScales, TimeScale } from "MetricsChart/scales";
    export type MetricsChartProps = {
        /**
         * The type of chart to display.
         */
        graphType: GraphType;
        /**
         * Handler that is invoked when the graph type is changed.
         *
         * If no handler is specified, no UI for changing the graph type is presented.
         */
        onChangeGraphType?: (graphType: GraphType) => void;
        /**
         * Handler that is invoked when the time range is changed.
         *
         * If no handler is specified, no UI for changing the time range is presented.
         */
        onChangeTimeRange?: (timeRange: TimeRange | null) => void;
        /**
         * Handler that is invoked when the stacking type is changed.
         *
         * If no handler is specified, no UI for changing the stacking type is
         * presented.
         */
        onChangeStackingType?: (stackingType: StackingType) => void;
        /**
         * Whether the chart is read-only.
         *
         * Set to `true` to disable interactive controls.
         */
        readOnly?: boolean;
        /**
         * Callback for showing tooltips.
         *
         * If no callback is provided, no tooltips will be shown.
         */
        showTooltip?: ShowTooltipFn;
        /**
         * The type of stacking to apply to the chart.
         */
        stackingType: StackingType;
        /**
         * The time range for which to display the data.
         *
         * Make sure the timeseries contains data for the given time range, or you may
         * not see any results.
         */
        timeRange: TimeRange;
        /**
         * Array of timeseries data to display in the chart.
         *
         * Make sure the timeseries contains data for the given time range, or you may
         * not see any results.
         */
        timeseriesData: Array<Timeseries>;
    };
    export type TotalBarType = {
        graphType: "bar";
        stackingType: "none";
    } & GroupedScales;
    export type LineBarType = {
        graphType: "line";
        stackingType: StackingType;
        xScale: TimeScale;
    };
    export type StackedBarType = {
        graphType: "bar";
        stackingType: Exclude<StackingType, "none">;
        xScale: TimeScale;
    };
    export type XScaleProps = TotalBarType | LineBarType | StackedBarType;
}
declare module "BaseComponents/ButtonGroup" {
    export const ButtonGroup: import("styled-components").StyledComponent<"span", import("styled-components").DefaultTheme, {}, never>;
}
declare module "BaseComponents/Containers" {
    export const Box: import("styled-components").StyledComponent<"div", import("styled-components").DefaultTheme, {}, never>;
    export const Container: import("styled-components").StyledComponent<"div", import("styled-components").DefaultTheme, {}, never>;
}
declare module "BaseComponents/Controls" {
    export const ControlsContainer: import("styled-components").StyledComponent<"div", import("styled-components").DefaultTheme, {}, never>;
    export const ControlsGroup: import("styled-components").StyledComponent<"div", import("styled-components").DefaultTheme, {}, never>;
    export const ControlsSet: import("styled-components").StyledComponent<"div", import("styled-components").DefaultTheme, {}, never>;
    export const ControlsSetLabel: import("styled-components").StyledComponent<"span", import("styled-components").DefaultTheme, {}, never>;
}
declare module "BaseComponents/Icon/IconMap" {
    export const ICON_MAP: {
        readonly chart_bar: import("react").FunctionComponent<import("react").SVGProps<SVGSVGElement> & {
            title?: string;
        }>;
        readonly chart_line: import("react").FunctionComponent<import("react").SVGProps<SVGSVGElement> & {
            title?: string;
        }>;
        readonly check: import("react").FunctionComponent<import("react").SVGProps<SVGSVGElement> & {
            title?: string;
        }>;
        readonly combined: import("react").FunctionComponent<import("react").SVGProps<SVGSVGElement> & {
            title?: string;
        }>;
        readonly percentage: import("react").FunctionComponent<import("react").SVGProps<SVGSVGElement> & {
            title?: string;
        }>;
        readonly stacked: import("react").FunctionComponent<import("react").SVGProps<SVGSVGElement> & {
            title?: string;
        }>;
        readonly triangle_down: import("react").FunctionComponent<import("react").SVGProps<SVGSVGElement> & {
            title?: string;
        }>;
    };
}
declare module "BaseComponents/Icon/Icon" {
    import { ICON_MAP } from "BaseComponents/Icon/IconMap";
    type IconType = keyof typeof ICON_MAP;
    type Props = React.SVGProps<SVGSVGElement> & {
        type: IconType;
    };
    export function Icon({ type, ...svgProps }: Props): JSX.Element;
}
declare module "BaseComponents/Icon/index" {
    export * from "BaseComponents/Icon/Icon";
}
declare module "BaseComponents/IconButton" {
    import { DefaultTheme } from "styled-components";
    export const buttonStyling: import("styled-components").FlattenInterpolation<import("styled-components").ThemeProps<DefaultTheme>>;
    export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
        active?: boolean;
    };
    export const IconButton: import("react").ForwardRefExoticComponent<import("react").ButtonHTMLAttributes<HTMLButtonElement> & {
        active?: boolean;
    } & import("react").RefAttributes<HTMLButtonElement>>;
}
declare module "BaseComponents/index" {
    export * from "BaseComponents/ButtonGroup";
    export * from "BaseComponents/Containers";
    export * from "BaseComponents/Controls";
    export * from "BaseComponents/Icon/index";
    export * from "BaseComponents/IconButton";
}
declare module "MetricsChart/ChartControls" {
    import type { GraphType, StackingType } from "types";
    type Props = {
        graphType: GraphType;
        onChangeGraphType?: (graphType: GraphType) => void;
        onChangeStackingType?: (stackingType: StackingType) => void;
        showStackingControls: boolean;
        stackingType: StackingType;
    };
    /**
     * Control what kind fo chart you're viewing (and more)
     */
    export function ChartControls({ graphType, onChangeGraphType, onChangeStackingType, showStackingControls, stackingType, }: Props): JSX.Element | null;
}
declare module "hooks/useHandler" {
    export function useHandler<Handler extends Function>(handler: Handler): Handler;
}
declare module "hooks/useCoreControls" {
    import type { CoreControls } from "context/index";
    import type { MetricsChartProps } from "MetricsChart/types";
    /**
     * Hook for creating convenient move/zoom functions
     */
    export function useCoreControls({ timeRange, onChangeTimeRange, }: MetricsChartProps): CoreControls;
}
declare module "hooks/useExpandable" {
    type Options = {
        /**
         * Default height (assumed to be in pixels).
         */
        defaultHeight: number;
    };
    type Result<T> = {
        /**
         * Component you should include in your output to allow the user to toggle
         * the expanded state, if relevant.
         */
        expandButton?: JSX.Element;
        /**
         * Component you may need to include in your output to display the gradient
         * to indicate the collapsed state, if relevant.
         */
        gradient?: JSX.Element;
        /**
         * Whether the expandable container is currently expanded.
         */
        isExpanded: boolean;
        /**
         * Scroll event listener to attach to the container.
         */
        onScroll: (event: React.UIEvent<T, UIEvent>) => void;
        /**
         * Ref to attach to the container.
         */
        ref: React.RefCallback<T>;
    };
    /**
     * Implements all the logic needed to create an expandable container.
     */
    export function useExpandable<T extends HTMLElement = HTMLDivElement>({ defaultHeight, }: Options): Result<T>;
}
declare module "hooks/useForceUpdate" {
    export function useForceUpdate(): () => void;
}
declare module "hooks/useInteractiveControls" {
    import { InteractiveControls, InteractiveControlsState } from "context/index";
    /**
     * Returns zoom/drag handlers and state.
     */
    export function useInteractiveControls(): {
        interactiveControls: InteractiveControls;
        interactiveControlsState: InteractiveControlsState;
    };
}
declare module "hooks/useIntersectionObserver" {
    export function useIntersectionObserver(ref: React.RefObject<HTMLElement>, options?: IntersectionObserverInit): IntersectionObserverEntry[];
}
declare module "hooks/useMeasure" {
    type Dimensions = {
        width: number;
        height: number;
    };
    export function useMeasure<T extends HTMLElement>(): [
        React.RefCallback<T>,
        Dimensions
    ];
}
declare module "hooks/useMouseControls" {
    import { MouseEventHandler, Ref } from "react";
    import type { TimeRange } from "types";
    /**
     * Hook for setting up mouse handlers to control dragging & zoom
     */
    export function useMouseControls({ timeRange, onChangeTimeRange, }: {
        timeRange: TimeRange;
        onChangeTimeRange?: (timeRange: TimeRange | null) => void;
    }): {
        onMouseDown: MouseEventHandler<HTMLElement>;
        onMouseMove: MouseEventHandler<HTMLElement>;
        onMouseUp: MouseEventHandler<HTMLElement>;
        onMouseEnter: MouseEventHandler<HTMLElement>;
        graphContentRef: Ref<SVGGElement>;
    };
}
declare module "hooks/useScales" {
    import type { MetricsChartProps, XScaleProps } from "MetricsChart/types";
    export function useScales({ graphType, timeseriesData, stackingType, timeRange, }: MetricsChartProps): {
        xScaleProps: XScaleProps;
        yScale: import("d3-scale").ScaleLinear<number, number, never>;
    };
}
declare module "hooks/useTooltip" {
    import type { ShowTooltipFn } from "types";
    import type { GraphTooltip } from "context/index";
    export function useTooltip(showTooltip: ShowTooltipFn | undefined): {
        graphTooltip: GraphTooltip;
        showTooltip: (tip: GraphTooltip) => void;
        hideTooltip: () => void;
    };
}
declare module "hooks/index" {
    export * from "hooks/useCoreControls";
    export * from "hooks/useExpandable";
    export * from "hooks/useForceUpdate";
    export * from "hooks/useHandler";
    export * from "hooks/useInteractiveControls";
    export * from "hooks/useIntersectionObserver";
    export * from "hooks/useMeasure";
    export * from "hooks/useMouseControls";
    export * from "hooks/useScales";
    export * from "hooks/useTooltip";
}
declare module "MetricsChart/ChartSizeContainerProvider" {
    type Props = {
        children: React.ReactNode;
        className?: string;
    };
    export function ChartSizeContainerProvider({ children, className }: Props): JSX.Element;
}
declare module "MetricsChart/FocusedTimeseriesContextProvider" {
    export function FocusedTimeseriesContextProvider(props: {
        children?: React.ReactNode;
    }): JSX.Element;
}
declare module "ChartLegend/types" {
    import type { Timeseries } from "providerTypes";
    export type { Timeseries };
    export type ChartLegendProps = {
        /**
         * Handler that is invoked when the user toggles the visibility of a
         * timeseries.
         *
         * If no handler is specified, no UI for toggling the visibility of timeseries
         * is presented.
         */
        onToggleTimeseriesVisibility?: (event: ToggleTimeseriesEvent) => void;
        /**
         * Whether the chart is read-only.
         *
         * Set to `true` to disable interactive controls.
         */
        readOnly?: boolean;
        /**
         * Array of timeseries data to display in the legend.
         */
        timeseriesData: Array<Timeseries>;
    };
    export type ToggleTimeseriesEvent = {
        /**
         * The timeseries that was toggled.
         */
        timeseries: Timeseries;
        /**
         * If `true`, the visibility should be toggled of all timeseries *except* the
         * one specified.
         */
        toggleOthers: boolean;
    };
}
declare module "ChartLegend/ChartLegendItem" {
    import type { ChartLegendProps, Timeseries } from "ChartLegend/types";
    type Props = {
        color: string;
        onHover: () => void;
        onToggleTimeseriesVisibility: ChartLegendProps["onToggleTimeseriesVisibility"];
        readOnly: boolean;
        setSize: (value: number) => void;
        timeseries: Timeseries;
        uniqueKeys: Array<string>;
    };
    export function ChartLegendItem({ color, onHover, onToggleTimeseriesVisibility, readOnly, setSize, timeseries, uniqueKeys, }: Props): JSX.Element;
}
declare module "ChartLegend/ChartLegend" {
    import type { ChartLegendProps } from "ChartLegend/types";
    export const Legend: import("react").NamedExoticComponent<ChartLegendProps>;
}
declare module "ChartLegend/index" {
    export * from "ChartLegend/ChartLegend";
}
declare module "MetricsChart/ChartContent/TimeseriesTable" {
    export const TimeseriesTableCaption: import("styled-components").StyledComponent<"caption", import("styled-components").DefaultTheme, {}, never>;
    export const TimeseriesTableTd: import("styled-components").StyledComponent<"td", import("styled-components").DefaultTheme, {}, never>;
}
declare module "MetricsChart/ChartContent/Areas" {
    import type { Timeseries } from "types";
    import { TimeScale, ValueScale } from "MetricsChart/scales";
    type Props = {
        timeseriesData: Array<Timeseries>;
        xScale: TimeScale;
        yScale: ValueScale;
        asPercentage?: boolean;
    };
    export const Areas: import("react").NamedExoticComponent<Props>;
}
declare module "MetricsChart/ChartContent/BarsStacked/utils" {
    export function calculateBandwidth(width: number, steps: number): number;
}
declare module "MetricsChart/ChartContent/BarsStacked/hooks" {
    import { DataItem } from "utils/index";
    import type { Timeseries } from "types";
    import type { TimeScale, ValueScale } from "MetricsChart/scales";
    type Params = {
        dataItems: Array<DataItem>;
        timeseriesData: Array<Timeseries>;
        xScale: TimeScale;
        yScale: ValueScale;
        asPercentage: boolean;
    };
    type Handlers = {
        onMouseMove: React.MouseEventHandler;
        onMouseLeave: React.MouseEventHandler;
    };
    /**
     * Hook managing tooltips/mouseevents for BarStacked component
     */
    export function useTooltips(params: Params): Handlers;
}
declare module "MetricsChart/ChartContent/BarsStacked/BarsStacked" {
    import type { TimeScale, ValueScale } from "MetricsChart/scales";
    import type { Timeseries } from "types";
    type Props = {
        timeseriesData: Array<Timeseries>;
        xScale: TimeScale;
        yScale: ValueScale;
        asPercentage?: boolean;
    };
    export const BarsStacked: import("react").NamedExoticComponent<Props>;
}
declare module "MetricsChart/ChartContent/BarsStacked/index" {
    export * from "MetricsChart/ChartContent/BarsStacked/BarsStacked";
}
declare module "MetricsChart/ChartContent/DefaultBars/utils" {
    import { ScaleBand } from "d3-scale";
    import { DefaultTheme } from "styled-components";
    import type { GraphTooltip } from "context/index";
    import type { Metric, Timeseries } from "types";
    import { ValueScale } from "MetricsChart/scales";
    /**
     * Returns the relative value inside a band.
     *
     * Use case: get the X value as it is inside a specific band (useful when you
     * have scales inside scales)
     */
    export function getValueInsideScale<T extends {
        toString(): string;
    }>(value: number, scale: ScaleBand<T>): number;
    export function clamp(min: number, value: number, max: number): number;
    /**
     * Convenient object to store information about a possible candidate
     */
    export type Candidate = {
        timeseriesIndex: number;
        timeseries: Timeseries;
        metric: Metric;
    };
    type GetCandidatesArgs = {
        x: number;
        xScale: ScaleBand<string>;
        y: number;
        yScale: ValueScale;
        timeseriesData: Array<Timeseries>;
        activeTimestamp: string;
    };
    export function getCandidate({ x, xScale, y, yScale, timeseriesData, activeTimestamp, }: GetCandidatesArgs): Candidate | null;
    /**
     * BandScales don't have an invert function
     *
     * This function re-implements the logic and takes paddingOuter/inner into
     * consideration so we can do more than just set a single padding value
     */
    export function invert<T extends {
        toString(): string;
    }>(scale: ScaleBand<T>, value: number): T | undefined;
    /**
     * Retrieve a range of possible values in the domain
     */
    export function invertRange<T extends {
        toString(): string;
    }>(scale: ScaleBand<T>, range: {
        low: number;
        high: number;
    }): Array<T>;
    type GetTooltipArgs = {
        candidate: Candidate;
        groupScale: ScaleBand<string>;
        xScale: ScaleBand<number>;
        yScale: ValueScale;
        element: SVGSVGElement;
        theme: DefaultTheme;
    };
    export function getTooltipData({ candidate, groupScale, xScale, yScale, element, }: GetTooltipArgs): GraphTooltip | null;
}
declare module "MetricsChart/ChartContent/DefaultBars/hooks" {
    import type { ScaleBand } from "d3-scale";
    import type { Timeseries } from "types";
    import { ValueScale } from "MetricsChart/scales";
    type Params = {
        groupScale: ScaleBand<string>;
        timeseriesData: Array<Timeseries>;
        xScale: ScaleBand<number>;
        yScale: ValueScale;
    };
    type Handlers = {
        onMouseMove: React.MouseEventHandler;
        onMouseLeave: React.MouseEventHandler;
    };
    /**
     * Hook managing tooltips/mouseevents for BarStacked component
     */
    export function useTooltips(params: Params): Handlers;
}
declare module "MetricsChart/ChartContent/DefaultBars/DefaultBars" {
    import { GroupedScales, ValueScale } from "MetricsChart/scales";
    import type { Timeseries } from "types";
    type Props = {
        timeseriesData: Array<Timeseries>;
        yScale: ValueScale;
    } & GroupedScales;
    export const DefaultBars: import("react").NamedExoticComponent<Props>;
}
declare module "MetricsChart/ChartContent/DefaultBars/index" {
    export * from "MetricsChart/ChartContent/DefaultBars/DefaultBars";
}
declare module "MetricsChart/ChartContent/Lines/Series" {
    import { AxisScale } from "@visx/axis";
    import type { Metric } from "types";
    import { ValueScale } from "MetricsChart/scales";
    type Props = {
        id: string;
        metrics: Metric[];
        xScale: AxisScale<number>;
        yScale: ValueScale;
        yMax: number;
        fillColor: string;
        strokeColor: string;
        highlight?: boolean;
    };
    export const Series: import("react").NamedExoticComponent<Props>;
}
declare module "MetricsChart/ChartContent/Lines/Line" {
    import type { Metric } from "types";
    import { TimeScale, ValueScale } from "MetricsChart/scales";
    type Props = {
        index: number;
        xScale: TimeScale;
        yScale: ValueScale;
        metrics: Array<Metric>;
        yMax: number;
        highlight?: boolean;
    };
    export const Line: import("react").NamedExoticComponent<Props>;
}
declare module "MetricsChart/ChartContent/Lines/Lines" {
    import type { Metric, Timeseries } from "types";
    import type { ValueScale, TimeScale } from "MetricsChart/scales";
    export const x: (metric: Metric) => number;
    export const y: (metric: Metric) => number;
    type Props = {
        timeseriesData: Array<Timeseries>;
        xScale: TimeScale;
        yScale: ValueScale;
    };
    export const Lines: import("react").NamedExoticComponent<Props>;
}
declare module "MetricsChart/ChartContent/Lines/index" {
    export * from "MetricsChart/ChartContent/Lines/Lines";
}
declare module "MetricsChart/ChartContent/ChartContent" {
    import type { Timeseries } from "types";
    import type { ValueScale } from "MetricsChart/scales";
    import type { XScaleProps } from "MetricsChart/types";
    type Props = {
        timeseriesData: Array<Timeseries>;
        xScaleProps: XScaleProps;
        yScale: ValueScale;
    };
    export function ChartContent({ timeseriesData, xScaleProps, yScale, }: Props): JSX.Element;
}
declare module "MetricsChart/ChartContent/index" {
    export * from "MetricsChart/ChartContent/ChartContent";
}
declare module "MetricsChart/GridWithAxes/Bottom" {
    import { TickFormatter } from "@visx/axis";
    import { NumberValue } from "d3-scale";
    import { XScaleTypes } from "MetricsChart/scales";
    type Props = {
        xMax: number;
        yMax: number;
        xScale: XScaleTypes;
        xScaleFormatter?: TickFormatter<Date | NumberValue>;
    };
    function Bottom({ yMax, xScale, xScaleFormatter }: Props): JSX.Element;
    const _default: import("react").MemoExoticComponent<typeof Bottom>;
    export default _default;
}
declare module "MetricsChart/GridWithAxes/GridWithAxes" {
    import { TickFormatter } from "@visx/axis";
    import { NumberValue } from "d3-scale";
    import { ValueScale, XScaleTypes } from "MetricsChart/scales";
    type Props = {
        xMax: number;
        yMax: number;
        xScale: XScaleTypes;
        yScale: ValueScale;
        xScaleFormatter?: TickFormatter<Date | NumberValue>;
    };
    export const GridWithAxes: import("react").NamedExoticComponent<Props>;
}
declare module "MetricsChart/GridWithAxes/index" {
    export * from "MetricsChart/GridWithAxes/GridWithAxes";
}
declare module "MetricsChart/ZoomBar" {
    export function ZoomBar(): JSX.Element | null;
}
declare module "MetricsChart/MainChartContent" {
    import type { MetricsChartProps } from "MetricsChart/types";
    export function MainChartContent(props: MetricsChartProps): JSX.Element;
}
declare module "MetricsChart/MetricsChart" {
    import type { MetricsChartProps } from "MetricsChart/types";
    export function MetricsChart(props: MetricsChartProps): JSX.Element;
}
declare module "MetricsChart/index" {
    export type * from "MetricsChart/types";
    export { MetricsChart } from "MetricsChart/MetricsChart";
}
declare module "index" {
    export type { ChartTheme } from "./styled-components";
    export * from "MetricsChart/index";
}
declare module "utils/formatTimeseries.test" { }
