import type { ChartControlsProps } from "./ChartControls";
import type {
  CloseTooltipFn,
  CoreChartProps,
  TooltipAnchor,
  VirtualElement,
} from "../CoreChart";
import type { Metric, Timeseries } from "../providerTypes";
import type { TimeseriesLegendProps } from "../TimeseriesLegend";
import type { TimeseriesSourceData } from "../Mondrian";

export type MetricsChartProps = Omit<
  CoreChartProps<Timeseries, Metric>,
  "chart" | "focusedShapeList" | "onFocusedShapeListChange" | "showTooltip"
> &
  Pick<TimeseriesLegendProps, "footerShown" | "onToggleTimeseriesVisibility"> &
  ChartControlsProps &
  TimeseriesSourceData & {
    /**
     * Show the chart controls. (default: true)
     *
     * Setting this to false will also hide the stacking controls
     */
    chartControlsShown?: boolean;

    /**
     * Show the legend. (default: true)
     */
    legendShown?: boolean;

    /**
     * Handler to display a tooltips with information about hovered metrics.
     */
    showTooltip?: ShowTooltipFn;

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
