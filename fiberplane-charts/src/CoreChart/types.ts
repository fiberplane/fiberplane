import type { ScaleLinear } from "d3-scale";

import type { AbstractChart, ShapeList } from "../Mondrian";
import type { TimeRange } from "../providerTypes";

/**
 * Coordinats within the chart, normalized to values between 0.0 and 1.0.
 */
export type ChartCoordinates = { x: number; y: number };

export type CoreChartProps<S, P> = {
  /**
   * The chart to render.
   */
  chart: AbstractChart<S, P>;

  /**
   * Override the colors that the charts will use. If not specified several colors of the theme are used
   */
  colors?: Array<string>;

  /**
   * Indicates which of the shape lists should be focused.
   *
   * `null` is used to indicate no shape list is focused.
   */
  focusedShapeList: ShapeList<S, P> | null;

  /**
   * Show the line/border at the outer edge of the chart. (default: true)
   */
  gridBordersShown?: boolean;

  /**
   * Show the grid column (vertical) lines. (default: true)
   */
  gridColumnsShown?: boolean;

  /**
   * Customize the grid line style. (defaults to a solid line). This parameter is passed
   * directly to the svg's stroke-dasharray attribute for several of the lines in the chart.
   */
  gridDashArray?: string;

  /**
   * Show the grid row (horizontal) lines. (default: true)
   */
  gridRowsShown?: boolean;

  /**
   * Override the color of the grid lines. (defaults to the theme's grid color)
   */
  gridStrokeColor?: string;

  /**
   * Handler that is invoked when the time range is changed.
   *
   * If no handler is specified, no UI for changing the time range is
   * presented.
   */
  onChangeTimeRange?: (timeRange: TimeRange) => void;

  /**
   * Handler that is invoked when the focused shape list is changed.
   */
  onFocusedShapeListChange?: (shapeList: ShapeList<S, P> | null) => void;

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
  showTooltip?: ShowTooltipFn<S, P>;

  /**
   * The time range for which to display the data.
   *
   * Make sure the timeseries contains data for the given time range, or you
   * may not see any results.
   */
  timeRange: TimeRange;
};

export type Dimensions = { xMax: number; yMax: number };

export type Scale = ScaleLinear<number, number>;

export type Scales = Dimensions & {
  xScale: Scale;
  yScale: Scale;
};

export type ShowTooltipFn<S, P> = (
  anchor: TooltipAnchor,
  closestSource: [S, P],
) => CloseTooltipFn;

/**
 * Function to invoke to close the tooltip.
 */
export type CloseTooltipFn = () => void;

/**
 * Anchor to determine where the tooltip should be positioned.
 *
 * Positioning relative to the anchor is left to the callback provided.
 */
export type TooltipAnchor = HTMLElement | VirtualElement;

export type VirtualElement = {
  getBoundingClientRect: () => DOMRect;
  contextElement: Element;
};
