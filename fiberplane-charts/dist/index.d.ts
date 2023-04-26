import * as d3_scale from 'd3-scale';

interface ChartTheme {
    colorBackground: string;
    colorForeground: string;
    colorBase100: string;
    colorBase200: string;
    colorBase300: string;
    colorBase400: string;
    colorBase500: string;
    colorBase600: string;
    colorBase700: string;
    colorBase800: string;
    colorPrimary50: string;
    colorPrimary100: string;
    colorPrimary200: string;
    colorPrimary300: string;
    colorPrimary400: string;
    colorPrimary500: string;
    colorPrimary600: string;
    colorPrimary700: string;
    colorPrimary800: string;
    colorPrimaryAlpha50: string;
    colorPrimaryAlpha100: string;
    colorPrimaryAlpha200: string;
    colorPrimaryAlpha300: string;
    colorPrimaryAlpha400: string;
    colorSupport1100: string;
    colorSupport1200: string;
    colorSupport1300: string;
    colorSupport1400: string;
    colorSupport2100: string;
    colorSupport2200: string;
    colorSupport2300: string;
    colorSupport2400: string;
    colorSupport3100: string;
    colorSupport3200: string;
    colorSupport3300: string;
    colorSupport3400: string;
    colorSupport4100: string;
    colorSupport4200: string;
    colorSupport4300: string;
    colorSupport4400: string;
    colorSupport5100: string;
    colorSupport5200: string;
    colorSupport5300: string;
    colorSupport5400: string;
    colorSupport6100: string;
    colorSupport6200: string;
    colorSupport6300: string;
    colorSupport6400: string;
    colorSupport7100: string;
    colorSupport7200: string;
    colorSupport7300: string;
    colorSupport7400: string;
    colorSupport8100: string;
    colorSupport8200: string;
    colorSupport8300: string;
    colorSupport8400: string;
    colorSupport9100: string;
    colorSupport9200: string;
    colorSupport9300: string;
    colorSupport9400: string;
    colorSupport10100: string;
    colorSupport10200: string;
    colorSupport10300: string;
    colorSupport10400: string;
    colorSupport11100: string;
    colorSupport11200: string;
    colorSupport11300: string;
    colorSupport11400: string;
    fontAxisFontSize: string;
    fontAxisFontFamily: string;
    fontAxisFontWeight: string;
    fontAxisFontStyle: string;
    fontAxisLetterSpacing: string;
    fontAxisLineHeight: string;
    fontAxisShortHand: string;
    fontControlsLetterSpacing: string;
    fontControlsShortHand: string;
    fontLegendLetterSpacing: string;
    fontLegendShortHand: string;
    fontResultsSummaryLetterSpacing: string;
    fontResultsSummaryShortHand: string;
    effectFocusOutline: string;
    effectFocus: string;
    effectNone: string;
    borderRadius300: string;
    borderRadius400: string;
    borderRadius500: string;
    borderRadius600: string;
    borderRadius700: string;
    borderRadiusNone: string;
    borderRadiusRound: string;
}

declare module "styled-components" {
    // rome-ignore lint/suspicious/noEmptyInterface: <explanation>
    export interface DefaultTheme extends ChartTheme {}
}

type GraphType = "bar" | "line";
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
type StackingType = "none" | "stacked" | "percentage";
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

/**
 * Function to invoke to close the tooltip.
 */
type CloseTooltipFn = () => void;
/**
 * Function to display a tooltip relative to the given anchor containing the
 * given React content.
 *
 * Should return a function to close the tooltip.
 */
type ShowTooltipFn = (anchor: TooltipAnchor, content: React.ReactNode) => CloseTooltipFn;
type TimeRange = {
    from: Timestamp;
    to: Timestamp;
};
/**
 * Anchor to determine where the tooltip should be positioned.
 *
 * Positioning relative to the anchor is left to the callback provided.
 */
type TooltipAnchor = HTMLElement | VirtualElement;
type VirtualElement = {
    getBoundingClientRect: () => DOMRect;
    contextElement: Element;
};

type InteractiveControlsState = {
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

declare function getTimeScale(timeRange: TimeRange, xMax: number): d3_scale.ScaleTime<number, number, never>;
type TimeScale = ReturnType<typeof getTimeScale>;
/**
 * In short: get two scales. This is used for bar charts (no `stackingType`),
 * where there's an `xScale` chart which contains the timeseries and a
 * `groupScale` for each of the metrics for each timestamp.
 */
declare function getGroupedScales(timeseriesData: Array<Timeseries>, controlsState: InteractiveControlsState, xMax: number): {
    xScale: d3_scale.ScaleBand<number>;
    groupScale: d3_scale.ScaleBand<string>;
};
type GroupedScales = ReturnType<typeof getGroupedScales>;

type MetricsChartProps = {
    /**
     * The type of chart to display.
     */
    graphType: GraphType;
    /**
     * Handler that is invoked when the graph type is changed.
     *
     * If no handler is specified, no UI for changing the graph type is
     * presented.
     */
    onChangeGraphType?: (graphType: GraphType) => void;
    /**
     * Handler that is invoked when the time range is changed.
     *
     * If no handler is specified, no UI for changing the time range is
     * presented.
     */
    onChangeTimeRange?: (timeRange: TimeRange) => void;
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
     * Make sure the timeseries contains data for the given time range, or you
     * may not see any results.
     */
    timeRange: TimeRange;
    /**
     * Array of timeseries data to display in the chart.
     *
     * Make sure the timeseries contains data for the given time range, or you
     * may not see any results.
     */
    timeseriesData: Array<Timeseries>;
};
type TotalBarType = {
    graphType: "bar";
    stackingType: "none";
} & GroupedScales;
type LineBarType = {
    graphType: "line";
    stackingType: StackingType;
    xScale: TimeScale;
};
type StackedBarType = {
    graphType: "bar";
    stackingType: Exclude<StackingType, "none">;
    xScale: TimeScale;
};
type XScaleProps = TotalBarType | LineBarType | StackedBarType;

declare function MetricsChart(props: MetricsChartProps): JSX.Element;

export { ChartTheme, CloseTooltipFn, GraphType, LineBarType, Metric, MetricsChart, MetricsChartProps, OtelMetadata, ShowTooltipFn, StackedBarType, StackingType, TimeRange, Timeseries, Timestamp, TooltipAnchor, TotalBarType, VirtualElement, XScaleProps };
