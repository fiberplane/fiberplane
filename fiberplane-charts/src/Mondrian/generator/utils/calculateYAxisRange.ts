import type { Axis } from "../../types";
import type { Buckets, MinMax } from "../types";
import { getYAxisForConstantValue } from "./getYAxisForConstantValue";

/**
 * Detects the range to display along the Y axis by looking at all the min-max
 * values inside the buckets.
 *
 * When rendering a stacked chart, use `calculateStackedYAxisRange()` instead.
 */
export function calculateYAxisRange<T>(
  buckets: Buckets<T>,
  getMinMax: (bucket: T) => MinMax,
): Axis {
  const minMax = getBucketsMinMax(buckets, getMinMax);
  if (!minMax) {
    return getYAxisForConstantValue(0);
  }

  const [minValue, maxValue] = minMax;

  if (minValue === maxValue) {
    return getYAxisForConstantValue(minValue);
  }

  return { minValue, maxValue };
}

function getBucketsMinMax<T>(
  buckets: Buckets<T>,
  getMinMax: (bucketValue: T) => MinMax,
): MinMax | undefined {
  let minMax: MinMax | undefined;

  for (const value of buckets.values()) {
    const bucketMinMax = getMinMax(value);
    if (!minMax) {
      minMax = bucketMinMax;
      continue;
    }

    if (bucketMinMax[0] < minMax[0]) {
      minMax[0] = bucketMinMax[0];
    }
    if (bucketMinMax[1] > minMax[1]) {
      minMax[1] = bucketMinMax[1];
    }
  }

  return minMax;
}
