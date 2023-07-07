import type { ChartControlsProps } from "./ChartControls";
import type { ChartLegendProps } from "../TimeseriesLegend";
import type { CoreChartProps } from "../CoreChart";
import type { Metric, Timeseries } from "../providerTypes";
import type { TimeseriesSourceData } from "../ACG";

export type MetricsChartProps = Omit<
  CoreChartProps<Timeseries, Metric>,
  "chart"
> &
  ChartControlsProps &
  ChartLegendProps &
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
