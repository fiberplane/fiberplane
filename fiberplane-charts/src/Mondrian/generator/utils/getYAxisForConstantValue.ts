import type { Axis } from "../../types";

// NOTE - These constants account for floating point artifacts in the input data
//        E.g., we want to treat 1.0 and 1.0000000000000002 as the same value
//        Otherwise, we'll end up graphing a value like 1.0000000000000002 as a straight line in the middle of the graph
const ONE = 1.0 + Number.EPSILON;
const NEGATIVE_ONE = -1.0 - Number.EPSILON;
const POSITIVE_ZERO = Number.EPSILON;

/**
 * Returns the Y axis to display results if all results have the same value.
 *
 * For values larger than 1 or smaller than -1, the results will be centered
 * along the Y axis.
 *
 * For values that are functionally 0 (between 0 and EPSILON), the results will be at the very bottom of the chart,
 * and the max will be 1.
 *
 * For values that are functionally 1 (between 1 and 1+EPSILON),
 * the resulting line or dot will be at the very top of the chart, and the max will be the value itself.
 *
 * For values closer to zero, the zero value is kept at the
 * bottom 1/8th (for positive values) or top 1/8th (for negative values) of the
 * axis.
 */
export function getYAxisForConstantValue(value: number): Axis {
  let axis: Axis;
  if (value > ONE || value < NEGATIVE_ONE) {
    axis = { minValue: value - 1, maxValue: value + 1 };
  } else if (value >= 0 && value <= POSITIVE_ZERO) {
    axis = { minValue: 0, maxValue: 1 };
  } else if (value >= 1 && value <= ONE) {
    axis = { minValue: 0, maxValue: value };
  } else if (value > 0) {
    // HACK - value * 8 ensures that we'll have enough room to display the tick label for the value
    axis = { minValue: 0, maxValue: value * 8 };
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

  attachTickSuggestions(axis, tickSuggestions);

  return axis;
}

/**
 * If the first two tick suggestions are the min and max values, then we
 * divide the tick suggestions into 8 equal parts.
 *
 * If the first two tick suggestions are not the min and max values, then we
 * use the those two suggestions as the interval, and give suggestions with that interval
 * until we reach the max value.
 *
 * @note This function mutates the axis object
 */
function attachTickSuggestions(axis: Axis, suggestions: number[]) {
  if (suggestions.length < 2) {
    axis.tickSuggestions = suggestions;
    return;
  }

  const [firstTick, secondTick] = suggestions;

  let interval: number;
  if (firstTick === axis.minValue && secondTick === axis.maxValue) {
    interval = (secondTick - firstTick) / 8;
  } else {
    interval = secondTick - firstTick;
  }

  if (interval < Number.EPSILON) {
    axis.tickSuggestions = suggestions;
    return;
  }

  axis.tickSuggestions = [];

  let currentTick = firstTick;

  while (currentTick <= axis.maxValue) {
    axis.tickSuggestions.push(currentTick);
    currentTick += interval;
  }
}
