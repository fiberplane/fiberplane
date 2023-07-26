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

type QueryPrometheusOptions = RequestInit & {
    /**
     * Base URL to the Prometheus service, without trailing slash.
     */
    baseUrl: string;
};
/**
 * Fetches timeseries data from the Prometheus `query_range` endpoint.
 *
 * @param query Prometheus query string.
 * @param timeRange Time range to fetch the data for.
 */
declare function querySeries(query: string, timeRange: TimeRange, { baseUrl, mode, ...requestInit }: QueryPrometheusOptions): Promise<Array<Timeseries>>;
/**
 * Maps an entry from the result array returned by the Prometheus API to a
 * Timeseries object.
 *
 * @param entry An entry returned by the Prometheus `query_range` API.
 */
declare function metricEntryToTimeseries(entry: unknown): Timeseries;
/**
 * Rounds the timestamp to a "grid" with intervals defined by the step size.
 * This assures that when we scroll a chart forward or backward in time, we
 * "snap" to the same grid, to avoid the issue of bucket realignment, giving
 * unexpected jumps in the graph.
 *
 * @param timestamp The timestamp to round.
 * @param stepSeconds The amount of seconds used for the step size.
 * @param round The rounding function to use. Use `Math.floor` for the start
 *              of the time range, and `Math.ceil` for the end.
 */
declare function roundToGrid(timestamp: Timestamp, stepSeconds: number, round: typeof Math.round): Timestamp;
/**
 * Calculates the step size to be used in Prometheus queries.
 *
 * @returns Step size, both as a string to use with Prometheus, and a number of
 *          seconds.
 */
declare function getStepFromTimeRange(timeRange: TimeRange): [string, number];

export { Metric, OtelMetadata, OtelSpanId, OtelTraceId, QueryPrometheusOptions, TimeRange, Timeseries, Timestamp, getStepFromTimeRange, metricEntryToTimeseries, querySeries, roundToGrid };
