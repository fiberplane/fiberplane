import type { ChartControlsProps } from "./ChartControls";
import type { CoreChartProps } from "../CoreChart";
import type { Metric, Timeseries } from "../providerTypes";
import type { TimeseriesLegendProps } from "../TimeseriesLegend";
import type { TimeseriesSourceData } from "../ACG";

export type MetricsChartProps = Omit<
  CoreChartProps<Timeseries, Metric>,
  "chart"
> &
  ChartControlsProps &
  TimeseriesLegendProps &
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
     * Show the stacking controls. (default: true)
     */
    stackingControlsShown?: boolean;
  };
