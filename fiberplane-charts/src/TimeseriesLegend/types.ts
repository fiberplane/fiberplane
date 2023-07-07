import type { AbstractChart } from "../ACG";
import type { Timeseries } from "../providerTypes";

export type ChartLegendProps<S, P> = {
  /**
   * Array of timeseries data to display in the legend.
   */
  chart: AbstractChart<S, P>;

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
