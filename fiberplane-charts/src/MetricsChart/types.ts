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