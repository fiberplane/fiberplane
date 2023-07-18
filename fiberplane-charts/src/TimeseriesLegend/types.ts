import type { AbstractChart, ShapeList } from "../Mondrian";
import type { Metric, Timeseries } from "../providerTypes";

export type TimeseriesLegendProps = {
  /**
   * Array of timeseries data to display in the legend.
   */
  chart: AbstractChart<Timeseries, Metric>;

  /**
   * Handler that is invoked when the focused shape list is changed.
   */
  onFocusedShapeListChange?: (
    shapeList: ShapeList<Timeseries, Metric> | null,
  ) => void;

  /**
   * Handler that is invoked when the user toggles the visibility of a
   * timeseries.
   *
   * If no handler is specified, no UI for toggling the visibility of timeseries
   * is presented.
   */
  onToggleTimeseriesVisibility?: (event: ToggleTimeseriesEvent) => void;

  /**
   * Whether the chart is read-only.
   *
   * Set to `true` to disable interactive controls.
   */
  readOnly?: boolean;

  /**
   * Show the footer with the expand button & results text (default: true).
   */
  footerShown?: boolean;

  /**
   * Array of colors to use for the timeseries.
   */
  colors: Array<string>;
};

export type ToggleTimeseriesEvent = {
  /**
   * The timeseries that was toggled.
   */
  timeseries: Timeseries;

  /**
   * If `true`, the visibility should be toggled of all timeseries *except* the
   * one specified.
   */
  toggleOthers: boolean;
};
