import * as styled_components from 'styled-components';
import * as react from 'react';

declare const ButtonGroup: styled_components.StyledComponent<"span", styled_components.DefaultTheme, {}, never>;

declare const ControlsSet: styled_components.StyledComponent<"div", styled_components.DefaultTheme, {}, never>;
declare const ControlsSetLabel: styled_components.StyledComponent<"span", styled_components.DefaultTheme, {}, never>;

declare const ICON_MAP: {
    readonly chart_bar: react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }>;
    readonly chart_line: react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }>;
    readonly check: react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }>;
    readonly combined: react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }>;
    readonly percentage: react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }>;
    readonly stacked: react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }>;
    readonly triangle_down: react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }>;
};

type IconType = keyof typeof ICON_MAP;
type Props$1 = React.SVGProps<SVGSVGElement> & {
    type: IconType;
};
declare function Icon({ type, ...svgProps }: Props$1): JSX.Element;

declare const IconButton: react.ForwardRefExoticComponent<react.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean | undefined;
} & react.RefAttributes<HTMLButtonElement>>;

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
 * SeverityNumber, as specified by OpenTelemetry:
 *  https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#field-severitynumber
 */
type OtelSeverityNumber = number;
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
/**
 * A single event that is used within providers.
 *
 * Events occur at a given time and optionally last until a given end time.
 * They may contain both event-specific metadata as well as OpenTelemetry
 * metadata.
 */
type ProviderEvent = {
    time: Timestamp;
    endTime?: Timestamp;
    title: string;
    description?: string;
    severity?: OtelSeverityNumber;
    labels: Record<string, string>;
} & OtelMetadata;
type StackingType = "none" | "stacked" | "percentage";
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

/**
 * All the data necessary to generate an abstract chart from an array of
 * timeseries.
 */
type TimeseriesSourceData = {
    /**
     * The type of chart to display.
     */
    graphType: GraphType;
    /**
     * The type of stacking to apply to the chart.
     */
    stackingType: StackingType;
    /**
     * Array of timeseries data to display in the chart.
     *
     * Make sure the timeseries contains data for the given time range, or you
     * may not see any results.
     */
    timeseriesData: Array<Timeseries>;
    /**
     * The time range to be displayed.
     */
    timeRange: TimeRange;
    /**
     * Additional values that will be plotted on the chart, but which are not
     * part of any timeseries. These are not plotted, but are taken into
     * account when deciding the range of the Y axis.
     */
    additionalValues: Array<number>;
};
/**
 * All the data necessary to generate an abstract chart from a combination of
 * timeseries data, events and an optional target latency.
 */
type CombinedSourceData = {
    /**
     * The type of stacking to apply to the chart.
     *
     * @warning This property is accepted for consistency, but setting it to
     *          anything except `"line"` will cause the events to be ignored.
     */
    graphType: GraphType;
    /**
     * The type of stacking to apply to the chart.
     */
    stackingType: StackingType;
    /**
     * Array of timeseries data to display in the chart.
     *
     * Make sure the timeseries contains data for the given time range, or you
     * may not see any results.
     */
    timeseriesData: Array<Timeseries>;
    /**
     * Array of events to display in the chart.
     *
     * Note that events will not be displayed if the `graphType` is anything other
     * than `"line"`.
     */
    events: Array<ProviderEvent>;
    /**
     * Optional target latency to display on the chart, in seconds.
     */
    targetLatency?: number;
    /**
     * The time range to be displayed.
     */
    timeRange: TimeRange;
};
/**
 * Source type for use with charts that contain combined data sources.
 */
type SeriesSource = ({
    type: "timeseries";
} & Timeseries) | {
    type: "events";
} | {
    type: "target_latency";
};
/**
 * An abstract chart with information about what to render and where to render
 * it.
 *
 * All coordinates in an abstract chart are normalized to run from 0.0 to 1.0,
 * so (0, 0) is the origin of the chart (typically rendered bottom left), while
 * (1, 0) is the end of the X axis and (0, 1) is the end of the Y axis.
 *
 * The generic argument `S` refers to the type of the series from which shapes
 * will be generated, while the type `P` refers to the type for individual data
 * points. When generating charts from timeseries data, these will be
 * `Timeseries` and `Metric`, respectively.
 */
type AbstractChart<S, P> = {
    xAxis: Axis;
    yAxis: Axis;
    shapeLists: Array<ShapeList<S, P>>;
};
/**
 * Defines the range of values that are displayed along a given axis.
 */
type Axis = {
    /**
     * The value to display at the chart origin.
     */
    minValue: number;
    /**
     * The value to display at the end of the axis.
     */
    maxValue: number;
    /**
     * Optional suggestion of where to draw ticks based on the detected bucket
     * intervals.
     *
     * Ticks are expressed as values between `minValue` and `maxValue`.
     */
    tickSuggestions?: Array<number>;
};
/**
 * List of shapes that belongs together.
 *
 * These should be rendered in the same color.
 */
type ShapeList<S, P> = {
    shapes: Array<Shape<P>>;
    /**
     * The original source this shape list belongs to.
     *
     * This would be the type of input data the chart was generated from, such as
     * `Timeseries`.
     */
    source: S;
};
type Shape<P> = ({
    type: "area";
} & Area<P>) | ({
    type: "line";
} & Line<P>) | ({
    type: "point";
} & Point<P>) | ({
    type: "rectangle";
} & Rectangle<P>);
/**
 * An area to be drawn between two lines that share their X coordinates.
 *
 * Area points move from left to right.
 */
type Area<P> = {
    points: Array<AreaPoint<P>>;
    /**
     * Optional array specifying the pattern of dashes and gaps used to draw the
     * outline surrounding the area.
     *
     * The interpretation of this property corresponds to the SVG
     * `stroke-dasharray` attribute: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
     *
     * This property only supports unitless numbers, leaving the exact
     * interpretation of values to the renderer.
     *
     * If omitted, the outline is drawn as a solid line.
     */
    strokeDasharray?: Array<number>;
};
/**
 * A single data point in an area shape.
 */
type AreaPoint<P> = {
    /**
     * X coordinate between 0.0 and 1.0.
     */
    x: number;
    /**
     * Y coordinate between 0.0 and 1.0 for the bottom of the area.
     */
    yMin: number;
    /**
     * Y coordinate between 0.0 and 1.0 for the top of the area.
     */
    yMax: number;
    /**
     * The source this point was generated from.
     *
     * This would be a `Metric` if the chart was generated from `Timeseries`.
     */
    source: P;
};
/**
 * A line to be drawn between two or more points.
 */
type Line<P> = {
    points: Array<Point<P>>;
    /**
     * Optional array specifying the pattern of dashes and gaps used to draw the
     * line.
     *
     * The interpretation of this property corresponds to the SVG
     * `stroke-dasharray` attribute: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
     *
     * This property only supports unitless numbers, leaving the exact
     * interpretation of values to the renderer.
     *
     * If omitted, the line is drawn as a solid line.
     */
    strokeDasharray?: Array<number>;
};
/**
 * A single point in the chart.
 *
 * Points can be rendered independently as a dot, or can be used to draw lines
 * between them.
 */
type Point<P> = {
    /**
     * X coordinate between 0.0 and 1.0.
     */
    x: number;
    /**
     * Y coordinate between 0.0 and 1.0.
     */
    y: number;
    /**
     * The source this point was generated from.
     *
     * This would be a `Metric` if the chart was generated from `Timeseries`.
     */
    source: P;
};
/**
 * A rectangle to be rendered inside the chart.
 */
type Rectangle<P> = {
    x: number;
    y: number;
    width: number;
    height: number;
    /**
     * The source this rectangle was generated from.
     *
     * This would be a `Metric` if the chart was generated from `Timeseries`.
     */
    source: P;
};

/**
 * Generates an abstract chart from a combination of timeseries data, events and
 * an optional target latency.
 */
declare function generate({ graphType, stackingType, timeseriesData, events, targetLatency, timeRange, }: CombinedSourceData): AbstractChart<SeriesSource, Metric | ProviderEvent | null>;
/**
 * Generates an abstract chart from the given timeseries data.
 */
declare function generateFromTimeseries(input: TimeseriesSourceData): AbstractChart<Timeseries, Metric>;

type CoreChartProps<S, P> = {
    /**
     * Show a gradient under Line or Area shapes in the chart. (default: true)
     */
    areaGradientShown?: boolean;
    /**
     * The chart to render.
     */
    chart: AbstractChart<S, P>;
    /**
     * Indicates which of the shape lists should be focused.
     *
     * `null` is used to indicate no shape list is focused.
     */
    focusedShapeList: ShapeList<S, P> | null;
    /**
     * Callback used to determine the color for a shape list.
     */
    getShapeListColor: (source: S, index: number) => string;
    /**
     * Show the line/border at the outer edge of the chart. (default: true)
     */
    gridBordersShown?: boolean;
    /**
     * Show the grid column (vertical) lines. (default: true)
     */
    gridColumnsShown?: boolean;
    /**
     * Customize the grid line style. (defaults to a solid line). This parameter is passed
     * directly to the SVG `stroke-dasharray` attribute for several of the lines in the chart.
     */
    gridDasharray?: string;
    /**
     * Show the grid row (horizontal) lines. (default: true)
     */
    gridRowsShown?: boolean;
    /**
     * Whether the grid is shown at all. (default: true)
     */
    gridShown?: boolean;
    /**
     * Override the color of the grid lines. (defaults to the theme's grid color)
     */
    gridStrokeColor?: string;
    /**
     * Handler that is invoked when the time range is changed.
     *
     * If no handler is specified, no UI for changing the time range is
     * presented.
     */
    onChangeTimeRange?: (timeRange: TimeRange) => void;
    /**
     * Handler that is invoked when the focused shape list is changed.
     */
    onFocusedShapeListChange?: (shapeList: ShapeList<S, P> | null) => void;
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
    showTooltip?: ShowTooltipFn<S, P>;
    /**
     * Functions for formatting the ticks that are displayed along the axes.
     */
    tickFormatters: TickFormatters | TickFormattersFactory;
    /**
     * The time range for which to display the data.
     *
     * Make sure the timeseries contains data for the given time range, or you
     * may not see any results.
     */
    timeRange: TimeRange;
};
type TickFormatters = {
    /**
     * Formats the ticks displayed along the X axis.
     */
    xFormatter(value: number): string;
    /**
     * Formats the ticks displayed along the Y axis.
     */
    yFormatter(value: number): string;
};
type TickFormattersFactory = (xAxis: Axis, yAxis: Axis) => TickFormatters;
type ShowTooltipFn<S, P> = (anchor: TooltipAnchor, closestSource: [S, P]) => CloseTooltipFn;
/**
 * Function to invoke to close the tooltip.
 */
type CloseTooltipFn = () => void;
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

type TimeseriesLegendProps<S extends Timeseries, P> = {
    getShapeListColor: (source: S, index: number) => string;
    /**
     * Handler that is invoked when the focused shape list is changed.
     */
    onFocusedShapeListChange?: (shapeList: ShapeList<S, P> | null) => void;
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
     * Show the footer with the expand button & results text (default: true).
     */
    footerShown?: boolean;
    /**
     * Array of shape lists for the timeseries data to display in the legend.
     */
    shapeLists: Array<ShapeList<S, P>>;
};
type ToggleTimeseriesEvent = {
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

type ChartControlsProps = {
    children?: JSX.Element;
    graphType: GraphType;
    onChangeGraphType?: (graphType: GraphType) => void;
    onChangeStackingType?: (stackingType: StackingType) => void;
    stackingControlsShown: boolean;
    stackingType: StackingType;
};

type MetricsChartProps = Omit<CoreChartProps<SeriesSource, Metric | ProviderEvent | null>, "chart" | "colors" | "focusedShapeList" | "getShapeListColor" | "onFocusedShapeListChange"> & Pick<TimeseriesLegendProps<Timeseries, Metric>, "footerShown" | "onToggleTimeseriesVisibility"> & Omit<ChartControlsProps, "stackingControlsShown"> & Omit<TimeseriesSourceData, "additionalValues"> & {
    /**
     * Show the chart controls. (default: true)
     *
     * Setting this to false will also hide the stacking controls
     */
    chartControlsShown?: boolean;
    /**
     * Override the colors to use for the timeseries.
     *
     * If not specified, several colors from the theme are used.
     */
    colors?: Array<string>;
    /**
     * Optional custom controls to show in the controls toolbar, in addition to
     * the built-in controls (such as for toggling chart type).
     */
    customChartControls?: JSX.Element;
    /**
     * Optional events to display on the chart.
     */
    events?: Array<ProviderEvent>;
    /**
     * Override for the color to use for events.
     *
     * If not specified, a color from the theme is used.
     */
    eventColor?: string;
    /**
     * Show the legend. (default: true)
     */
    legendShown?: boolean;
    /**
     * Show the stacking controls. (default: true)
     */
    stackingControlsShown?: boolean;
    /**
     * Optional target latency to draw on the chart, in seconds.
     *
     * You will also need to specify the `targetLatencyColor` for the latency
     * to appear.
     */
    targetLatency?: number;
    /**
     * The color to use for drawing target latencies.
     *
     * If not specified, no target latency can be drawn.
     */
    targetLatencyColor?: string;
};

declare function MetricsChart(props: MetricsChartProps): JSX.Element;

type Props = Pick<CoreChartProps<Timeseries, Metric>, "onChangeTimeRange" | "areaGradientShown"> & Omit<TimeseriesSourceData, "additionalValues"> & {
    /**
     * Override the colors for the timeseries. If not specified several colors
     * of the theme are used.
     */
    colors?: Array<string>;
};
declare function SparkChart({ areaGradientShown, colors, graphType, stackingType, timeRange, timeseriesData, onChangeTimeRange, }: Props): JSX.Element;

type FormatterKind = 
/**
 * Formats a number of bytes.
 *
 * ## Examples
 *
 * `0.1B`, `10B`, `10kB`.
 */
"bytes"
/**
 * Formats a duration expressed in seconds.
 *
 * ## Examples
 *
 * `0.1s`, `10s`, `2h47`.
 */
 | "duration"
/**
 * Formats a value with an optional exponent component, also referred to as
 * "E notation".
 *
 * ## Examples
 *
 * `0.1`, `10`, `1.0e4`.
 */
 | "exponent"
/**
 * Formats a percentage value.
 *
 * ## Examples
 *
 * `0.1%`, `10%`, `10000%`.
 */
 | "percentage"
/**
 * Formats a value using scientific notation.
 *
 * ## Examples
 *
 * `100m`, `10`, `10k`.
 */
 | "scientific"
/**
 * Formats a time stamp expressed in seconds since the UNIX epoch.
 *
 * For brevity, the formatter omits the most significant parts of the time
 * that are constant across the axis.
 *
 * Currently, only UTC formatting is supported.
 *
 * ## Examples
 *
 * `Fri 13`, `17:15`, `57.200`
 */
 | "time";
type TickFormatter = (value: number) => string;
declare function getFormatterForAxis(axis: Axis, kind: FormatterKind): TickFormatter;
declare function getBytesFormatterForAxis(axis: Axis): TickFormatter;
declare function getDurationFormatterForAxis(axis: Axis): TickFormatter;
declare function getExponentFormatter(): TickFormatter;
declare function getPercentageFormatter(): TickFormatter;
declare function getScientificFormatterForAxis(axis: Axis): TickFormatter;
declare function getTimeFormatterForAxis(axis: Axis): TickFormatter;

export { AbstractChart, Area, AreaPoint, Axis, ButtonGroup, ChartTheme, CloseTooltipFn, CombinedSourceData, ControlsSet, ControlsSetLabel, FormatterKind, GraphType, Icon, IconButton, Line, Metric, MetricsChart, MetricsChartProps, OtelMetadata, Point, ProviderEvent, Rectangle, SeriesSource, Shape, ShapeList, SparkChart, StackingType, TickFormatter, TickFormatters, TickFormattersFactory, TimeRange, Timeseries, TimeseriesSourceData, Timestamp, ToggleTimeseriesEvent, TooltipAnchor, VirtualElement, generate, generateFromTimeseries, getBytesFormatterForAxis, getDurationFormatterForAxis, getExponentFormatter, getFormatterForAxis, getPercentageFormatter, getScientificFormatterForAxis, getTimeFormatterForAxis };
