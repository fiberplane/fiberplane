import type { ChartControlsProps } from "./ChartControls";
import type { ChartTheme } from "../styled-components";
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
     * Optional custom controls to show in the controls toolbar, in addition to
     * the built-in controls (such as for toggling chart type).
     */
    customChartControls?: JSX.Element;

    /**
     * Optional events to display on the chart.
     */
    events?: Array<ProviderEvent>;

    /**
     * Show the legend. (default: true)
     */
    legendShown?: boolean;

    /**
     * Show the stacking controls. (default: true)
     */
    stackingControlsShown?: boolean;

    theme: ChartTheme;
  };

export type { CloseTooltipFn, TooltipAnchor, VirtualElement };
