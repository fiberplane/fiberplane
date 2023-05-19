import type {
    GraphType,
    StackingType,
    Timeseries,
    TimeRange,
    ShowTooltipFn,
} from "../types";
import type { GroupedScales, TimeScale } from "./scales";

export type MetricsChartProps = {
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

    /**
     * Show the legend. (default: true)
     */
    legendShown?: boolean;

    /**
     * Show the chart controls. (default: true)
     *
     * Setting this to false will also hide the stacking controls
     */
    chartControlsShown?: boolean;

    /**
     * Show the stacking controls. (default: true)
     */
    stackingControlsShown?: boolean;

    /**
     * Show the footer (which can contain the expand button & results text). (default: true)
     */
    footerShown?: boolean;

    /**
     * Show the grid column (vertical) lines. (default: true)
     */
    gridColumnsShown?: boolean;

    /**
     * Show the line/border at the outer edge of the chart. (default: true)
     */
    gridBordersShown?: boolean;

    /**
     * Customize the grid line style. (defaults to a solid line). This parameter is passed
     * directly to the svg's stroke-dasharray attribute for several of the lines in the chart.
     */
    gridDashArray?: string;

    /**
     * Override the colors that the charts will use. If not specified several colors of the theme are used
     */
    colors?: Array<string>;
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
