import type { Axis } from "../../types";

/**
 * Returns the Y axis to display results if all results have the same value.
 *
 * For values larger than 1 or smaller than -1, the results will be centered
 * along the Y axis. For values closer to zero, the zero value is kept at the
 * bottom (for zero and positive values) or top (for negative values) of the
 * axis.
 */
export function getYAxisForConstantValue(value: number): Axis {
  let axis: Axis;
  if (value > 1 || value < -1) {
    axis = { minValue: value - 1, maxValue: value + 1 };
  } else if (value >= 0) {
    axis = { minValue: 0, maxValue: value + 1 };
  } else {
    axis = { minValue: value - 1, maxValue: 0 };
  }

  const tickSuggestions = [value];
  if (axis.minValue !== value) {
    tickSuggestions.unshift(axis.minValue);
  }
  if (axis.maxValue !== value) {
    tickSuggestions.push(axis.maxValue);
  }

  axis.tickSuggestions = tickSuggestions;
  return axis;
}
