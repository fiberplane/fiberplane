import type { Axis } from "../../types";
import type { Buckets } from "../types";
import { extendMinMax } from "./extendMinMax";
import { getInitialMinMax } from "./getInitialMinMax";
import { getYAxisForConstantValue } from "./getYAxisForConstantValue";

/**
 * Detects the range to display along the Y axis by looking at all the totals
 * inside the buckets.
 *
 * This function is used for stacked charts. When rendering a normal chart, use
 * `calculateYAxisRange()` instead.
 */
export function calculateStackedYAxisRange<T>(
  buckets: Buckets<T>,
  getTotalValue: (bucket: T) => number,
): Axis {
  if (buckets.size === 0) {
    return getYAxisForConstantValue(0);
  }

  const minMax = getInitialMinMax(0);
  for (const value of buckets.values()) {
    extendMinMax(minMax, getTotalValue(value));
  }

  const [minValue, maxValue] = minMax;
  if (minValue === maxValue) {
    return getYAxisForConstantValue(minValue);
  }

  return { minValue, maxValue };
}
