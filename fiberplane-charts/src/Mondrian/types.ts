import type {
  GraphType,
  ProviderEvent,
  StackingType,
  TimeRange,
  Timeseries,
} from "../providerTypes";

export type { GraphType, StackingType, TimeRange };

/**
 * All the data necessary to generate an abstract chart from an array of
 * timeseries.
 */
export type TimeseriesSourceData = {
  /**
   * The type of chart to display.
   */
  graphType: GraphType;

  /**
   * The type of stacking to apply to the chart.
   */
  stackingType: StackingType;

  /**
   * Array of timeseries data to display in the chart.
   *
   * Make sure the timeseries contains data for the given time range, or you
   * may not see any results.
   */
  timeseriesData: Array<Timeseries>;

  /**
   * The time range to be displayed.
   */
  timeRange: TimeRange;

  /**
   * Additional values that will be plotted on the chart, but which are not
   * part of any timeseries. These are not plotted, but are taken into
   * account when deciding the range of the Y axis.
   */
  additionalValues: Array<number>;
};

/**
 * All the data necessary to generate an abstract chart from a combination of
 * timeseries data, events and an optional target latency.
 */
export type CombinedSourceData = {
  /**
   * The type of stacking to apply to the chart.
   *
   * @warning This property is accepted for consistency, but setting it to
   *          anything except `"line"` will cause the events to be ignored.
   */
  graphType: GraphType;

  /**
   * The type of stacking to apply to the chart.
   */
  stackingType: StackingType;

  /**
   * Array of timeseries data to display in the chart.
   *
   * Make sure the timeseries contains data for the given time range, or you
   * may not see any results.
   */
  timeseriesData: Array<Timeseries>;

  /**
   * Array of events to display in the chart.
   *
   * Note that events will not be displayed if the `graphType` is anything other
   * than `"line"`.
   */
  events: Array<ProviderEvent>;

  /**
   * Optional target latency to display on the chart, in seconds.
   */
  targetLatency?: number;

  /**
   * The time range to be displayed.
   */
  timeRange: TimeRange;
};

/**
 * Source type for use with charts that contain combined data sources.
 */
export type SeriesSource =
  | ({ type: "timeseries" } & Timeseries)
  | { type: "events" }
  | { type: "target_latency" };

/**
 * An abstract chart with information about what to render and where to render
 * it.
 *
 * All coordinates in an abstract chart are normalized to run from 0.0 to 1.0,
 * so (0, 0) is the origin of the chart (typically rendered bottom left), while
 * (1, 0) is the end of the X axis and (0, 1) is the end of the Y axis.
 *
 * The generic argument `S` refers to the type of the series from which shapes
 * will be generated, while the type `P` refers to the type for individual data
 * points. When generating charts from timeseries data, these will be
 * `Timeseries` and `Metric`, respectively.
 */
export type AbstractChart<S, P> = {
  xAxis: Axis;
  yAxis: Axis;
  shapeLists: Array<ShapeList<S, P>>;
};

/**
 * Defines the range of values that are displayed along a given axis.
 */
export type Axis = {
  /**
   * The value to display at the chart origin.
   */
  minValue: number;

  /**
   * The value to display at the end of the axis.
   */
  maxValue: number;

  /**
   * Optional suggestion of where to draw ticks based on the detected bucket
   * intervals.
   *
   * Ticks are expressed as values between `minValue` and `maxValue`.
   */
  tickSuggestions?: Array<number>;
};

/**
 * List of shapes that belongs together.
 *
 * These should be rendered in the same color.
 */
export type ShapeList<S, P> = {
  shapes: Array<Shape<P>>;

  /**
   * The original source this shape list belongs to.
   *
   * This would be the type of input data the chart was generated from, such as
   * `Timeseries`.
   */
  source: S;
};

export type Shape<P> =
  | ({ type: "area" } & Area<P>)
  | ({ type: "line" } & Line<P>)
  | ({ type: "point" } & Point<P>)
  | ({ type: "rectangle" } & Rectangle<P>);

/**
 * An area to be drawn between two lines that share their X coordinates.
 *
 * Area points move from left to right.
 */
export type Area<P> = {
  points: Array<AreaPoint<P>>;

  /**
   * Optional boolean that allows for overriding the areaGradientShown property on the CoreChart per individual Area
   */
  areaGradientShown?: boolean;

  /**
   * Optional array specifying the pattern of dashes and gaps used to draw the
   * outline surrounding the area.
   *
   * The interpretation of this property corresponds to the SVG
   * `stroke-dasharray` attribute: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
   *
   * This property only supports unitless numbers, leaving the exact
   * interpretation of values to the renderer.
   *
   * If omitted, the outline is drawn as a solid line.
   */
  strokeDasharray?: Array<number>;
};

/**
 * A single data point in an area shape.
 */
export type AreaPoint<P> = {
  /**
   * X coordinate between 0.0 and 1.0.
   */
  x: number;

  /**
   * Y coordinate between 0.0 and 1.0 for the bottom of the area.
   */
  yMin: number;

  /**
   * Y coordinate between 0.0 and 1.0 for the top of the area.
   */
  yMax: number;

  /**
   * The source this point was generated from.
   *
   * This would be a `Metric` if the chart was generated from `Timeseries`.
   */
  source: P;
};

/**
 * A line to be drawn between two or more points.
 */
export type Line<P> = {
  points: Array<Point<P>>;

  /**
   * Optional boolean that allows for overriding the areaGradientShown property on the CoreChart per individual Line
   */
  areaGradientShown?: boolean;

  /**
   * Optional array specifying the pattern of dashes and gaps used to draw the
   * line.
   *
   * The interpretation of this property corresponds to the SVG
   * `stroke-dasharray` attribute: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
   *
   * This property only supports unitless numbers, leaving the exact
   * interpretation of values to the renderer.
   *
   * If omitted, the line is drawn as a solid line.
   */
  strokeDasharray?: Array<number>;
};

/**
 * A single point in the chart.
 *
 * Points can be rendered independently as a dot, or can be used to draw lines
 * between them.
 */
export type Point<P> = {
  /**
   * X coordinate between 0.0 and 1.0.
   */
  x: number;

  /**
   * Y coordinate between 0.0 and 1.0.
   */
  y: number;

  /**
   * The source this point was generated from.
   *
   * This would be a `Metric` if the chart was generated from `Timeseries`.
   */
  source: P;
};

/**
 * A rectangle to be rendered inside the chart.
 */
export type Rectangle<P> = {
  x: number;
  y: number;
  width: number;
  height: number;

  /**
   * The source this rectangle was generated from.
   *
   * This would be a `Metric` if the chart was generated from `Timeseries`.
   */
  source: P;
};
