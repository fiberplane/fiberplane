import type {
  GraphType,
  Metric,
  StackingType,
  TimeRange,
  Timeseries,
} from "../providerTypes";

export type { GraphType, Metric, StackingType, TimeRange, Timeseries };

/**
 * All the data necessary to generate an abstract chart.
 */
export type ChartInputData = {
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
 */
export type AbstractChart = {
  xAxis: Axis;
  yAxis: Axis;
  metrics: Array<ShapeList>;
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
};

/**
 * List of shapes that belongs together.
 *
 * These should be rendered in the same color.
 */
export type ShapeList = {
  shapes: Array<Shape>;

  /**
   * The original timeseries this shape list belongs to.
   */
  // TODO: We should disconnect this from the input types.
  timeseries: Timeseries;
};

export type Shape =
  | ({ type: "bar" } & Bar)
  | ({ type: "line" } & Line)
  | ({ type: "point" } & Point);

/**
 * A line to be drawn between two or more points.
 */
export type Line = {
  points: Array<Point>;
};

/**
 * A single point in the chart.
 *
 * Points can be rendered independently as a dot, or can be used to draw lines
 * between them.
 */
export type Point = {
  /**
   * X coordinate between 0.0 and 1.0.
   */
  x: number;

  /**
   * Y coordinate between 0.0 and 1.0.
   */
  y: number;
};

/**
 * A bar to be rendered parallel to the Y axis.
 */
export type Bar = {
  x: number;
  width: number;
  yMin: number;
  yMax: number;
};
