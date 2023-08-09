import type { Axis } from "../../types";

/**
 * Extends the range of the axis with the given value.
 *
 * If the given value is outside the range of the axis, the range is
 * extended to include the value. Otherwise, nothing happens.
 *
 * @note This function mutates its input axis.
 */
export function extendAxisWithValue(axis: Axis, value: number): Axis {
  if (value < axis.minValue) {
    axis.minValue = value;
  } else if (value > axis.maxValue) {
    axis.maxValue = value;
  }

  return axis;
}
