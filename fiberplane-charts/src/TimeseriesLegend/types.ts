import type { ShapeList } from "../Mondrian";
import type { Timeseries } from "../providerTypes";

export type TimeseriesLegendProps<S extends Timeseries, P> = {
  getShapeListColor: (source: S, index: number) => string;

  /**
   * Handler that is invoked when the focused shape list is changed.
   */
  onFocusedShapeListChange?: (shapeList: ShapeList<S, P> | null) => void;

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
   * Array of shape lists for the timeseries data to display in the legend.
   */
  shapeLists: Array<ShapeList<S, P>>;
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
