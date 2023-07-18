import type { Axis } from "../../types";

/**
 * Extends the range of an axis with the given interval.
 *
 * The range of the interval is divided among ends of the axis. The purpose of
 * this is to extend the axis with enough space to display the bars for the
 * first and last buckets displayed on the bar chart.
 *
 * @note This function mutates its input axis.
 */
export function extendAxisWithInterval(axis: Axis, interval: number): Axis {
  const halfInterval = 0.5 * interval;
  axis.minValue -= halfInterval;
  axis.maxValue += halfInterval;

  return axis;
}
