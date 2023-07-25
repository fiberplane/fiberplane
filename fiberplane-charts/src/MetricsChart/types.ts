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
  CoreChartProps<SeriesSource, Metric | ProviderEvent>,
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
  TimeseriesSourceData & {
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
  };

/**
 * Function to display a tooltip relative to the given anchor containing the
 * given React content.
 *
 * Should return a function to close the tooltip.
 */
export type ShowTooltipFn = (
  anchor: TooltipAnchor,
  content: React.ReactNode,
) => CloseTooltipFn;

export type { CloseTooltipFn, TooltipAnchor, VirtualElement };
