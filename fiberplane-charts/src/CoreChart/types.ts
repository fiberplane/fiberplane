import type { AbstractChart } from "../ACG";
import type { ScaleLinear } from "d3-scale";
import type { ShowTooltipFn, TimeRange } from "../types";

export type CoreChartProps<S, P> = {
  /**
   * The chart to render.
   */
  chart: AbstractChart<S, P>;

  /**
   * Handler that is invoked when the time range is changed.
   *
   * If no handler is specified, no UI for changing the time range is
   * presented.
   */
  onChangeTimeRange?: (timeRange: TimeRange) => void;

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
   * The time range for which to display the data.
   *
   * Make sure the timeseries contains data for the given time range, or you
   * may not see any results.
   */
  timeRange: TimeRange;

  /**
   * Show the grid column (vertical) lines. (default: true)
   */
  gridColumnsShown?: boolean;

  /**
   * Show the grid row (horizontal) lines. (default: true)
   */
  gridRowsShown?: boolean;

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
   * Override the color of the grid lines. (defaults to the theme's grid color)
   */
  gridStrokeColor?: string;

  /**
   * Override the colors that the charts will use. If not specified several colors of the theme are used
   */
  colors?: Array<string>;
};

export type Scale = ScaleLinear<number, number>;

export type Scales = {
  xMax: number;
  xScale: Scale;
  yMax: number;
  yScale: Scale;
};
