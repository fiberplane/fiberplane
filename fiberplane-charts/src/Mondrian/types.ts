import type {
  GraphType,
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
};

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
