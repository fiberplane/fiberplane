import type { ChartControlsProps } from "./ChartControls";
import type { ChartInputData } from "../ACG";
import type { ChartLegendProps } from "../ChartLegend";
import type { CoreChartProps } from "../CoreChart";

export type MetricsTypeProps = CoreChartProps &
  ChartControlsProps &
  ChartLegendProps &
  ChartInputData & {
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
