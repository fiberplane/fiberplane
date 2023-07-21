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
  const tickSuggestions = [value];

  if (value > 1 || value < -1) {
    return { minValue: value - 1, maxValue: value + 1, tickSuggestions };
  } else if (value >= 0) {
    return { minValue: 0, maxValue: value + 1, tickSuggestions };
  } else {
    return { minValue: value - 1, maxValue: 0, tickSuggestions };
  }
}
