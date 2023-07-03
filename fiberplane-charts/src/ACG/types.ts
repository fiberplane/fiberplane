import type { Timeseries } from "../providerTypes";

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
  // TODO: We should disconnect this from the concrete types.
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
