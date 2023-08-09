import type { ChartControlsProps } from "./ChartControls";
import type {
  CloseTooltipFn,
  CoreChartProps,
  TooltipAnchor,
  VirtualElement,
} from "../CoreChart";
import type { Metric, ProviderEvent, Timeseries } from "../providerTypes";
import type { SeriesSource, TimeseriesSourceData } from "../Mondrian";
import type { TimeseriesLegendProps } from "../TimeseriesLegend";

export type MetricsChartProps = Omit<
  CoreChartProps<SeriesSource, Metric | ProviderEvent | null>,
  | "chart"
  | "colors"
  | "focusedShapeList"
  | "getShapeListColor"
  | "onFocusedShapeListChange"
> &
  Pick<
    TimeseriesLegendProps<Timeseries, Metric>,
    "footerShown" | "onToggleTimeseriesVisibility"
  > &
  Omit<ChartControlsProps, "stackingControlsShown"> &
  Omit<TimeseriesSourceData, "additionalValues"> & {
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

export type { CloseTooltipFn, TooltipAnchor, VirtualElement };
