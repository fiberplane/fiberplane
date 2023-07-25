/**
 * A single metric value.
 *
 * Metric values are taken at a specific timestamp and contain a floating-point
 * value as well as OpenTelemetry metadata.
 */
type Metric = {
    time: Timestamp;
    value: number;
} & OtelMetadata;
/**
 * Metadata following the OpenTelemetry metadata spec.
 */
type OtelMetadata = {
    attributes: Record<string, any>;
    resource: Record<string, any>;
    traceId?: OtelTraceId;
    spanId?: OtelSpanId;
};
/**
 * Span ID, as specified by OpenTelemetry:
 *  https://opentelemetry.io/docs/reference/specification/overview/#spancontext
 */
type OtelSpanId = Uint8Array;
/**
 * Trace ID, as specified by OpenTelemetry:
 *  https://opentelemetry.io/docs/reference/specification/overview/#spancontext
 */
type OtelTraceId = Uint8Array;
type TimeRange = {
    from: Timestamp;
    to: Timestamp;
};
/**
 * A series of metrics over time, with metadata.
 */
type Timeseries = {
    name: string;
    labels: Record<string, string>;
    metrics: Array<Metric>;
    /**
     * Whether the series should be rendered. Can be toggled by the user.
     */
    visible: boolean;
} & OtelMetadata;
type Timestamp = string;

type QueryPrometheusOptions = {
    /**
     * Base URL to the Prometheus service, without trailing slash.
     */
    baseUrl: string;
    /**
     * Optional headers to pass along the request.
     */
    headers?: HeadersInit;
};
/**
 * Fetches timeseries data from the Prometheus `query_range` endpoint.
 *
 * @param query Prometheus query string.
 * @param timeRange Time range to fetch the data for.
 */
declare function querySeries(query: string, timeRange: TimeRange, { baseUrl, headers }: QueryPrometheusOptions): Promise<Array<Timeseries>>;

export { Metric, OtelMetadata, OtelSpanId, OtelTraceId, QueryPrometheusOptions, TimeRange, Timeseries, Timestamp, querySeries };
