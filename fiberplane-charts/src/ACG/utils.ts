import { Axis, TimeRange, Timeseries } from "./types";

/**
 * Detects the range to display along the Y axis by looking at all the visible
 * data in the given timeseries.
 *
 * When rendering a stacked chart, use `detectStackedYAxisRange()` instead.
 */
export function detectYAxisRange(timeseriesData: Array<Timeseries>): Axis {
  const minMax = detectTimeseriesArrayMinMax(timeseriesData);
  if (!minMax) {
    return getYAxisForConstantValue(0);
  }

  const [minValue, maxValue] = minMax;

  if (minValue === maxValue) {
    getYAxisForConstantValue(minValue);
  }

  return { minValue, maxValue };
}

/**
 * Detects the range to display along the Y axis by looking at all the visible
 * data in the given timeseries.
 *
 * This function is used for stacked charts. When rendering a normal chart, use
 * `detectYAxisRange()` instead.
 */
export function detectStackedYAxisRange(
  timeseriesData: Array<Timeseries>,
): Axis {
  const buckets = new Map<string, { total: number }>();

  for (const timeseries of timeseriesData) {
    if (!timeseries.visible) {
      continue;
    }

    for (const { time, value } of timeseries.metrics) {
      const bucket = buckets.get(time);
      if (bucket) {
        bucket.total += value;
      } else {
        buckets.set(time, { total: value });
      }
    }
  }

  if (buckets.size === 0) {
    return getYAxisForConstantValue(0);
  }

  let minValue = 0;
  let maxValue = 0;
  for (const { total } of buckets.values()) {
    if (total > maxValue) {
      maxValue = total;
    } else if (total < minValue) {
      minValue = total; // If total is negative, try to make the best of it.
    }
  }

  if (minValue === maxValue) {
    return getYAxisForConstantValue(minValue);
  }

  return { minValue, maxValue };
}

function detectTimeseriesArrayMinMax(
  timeseriesData: Array<Timeseries>,
): [min: number, max: number] | undefined {
  let minMax: [min: number, max: number] | undefined;

  for (const timeseries of timeseriesData) {
    if (!timeseries.visible) {
      continue;
    }

    const timeseriesMinMax = detectTimeseriesMinMax(timeseries);
    if (timeseriesMinMax) {
      if (!minMax) {
        minMax = timeseriesMinMax;
        continue;
      }

      if (timeseriesMinMax[0] < minMax[0]) {
        minMax[0] = timeseriesMinMax[0];
      }
      if (timeseriesMinMax[1] > minMax[1]) {
        minMax[1] = timeseriesMinMax[1];
      }
    }
  }

  return minMax;
}

function detectTimeseriesMinMax(
  timeseries: Timeseries,
): [min: number, max: number] | undefined {
  let minMax: [min: number, max: number] | undefined;

  for (const { value } of timeseries.metrics) {
    if (!minMax) {
      minMax = [value, value];
    } else if (value < minMax[0]) {
      minMax[0] = value;
    } else if (value > minMax[1]) {
      minMax[1] = value;
    }
  }

  return minMax;
}

/**
 * Converts an RFC 3339-formatted timestamp to a time expressed in milliseconds.
 */
export function getTimeFromTimestamp(timestamp: string): number {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) {
    throw new TypeError(`Invalid timestamp: ${timestamp}`);
  }

  return time;
}

/**
 * Returns the X axis to display results for the given time range.
 */
export function getXAxisFromTimeRange(timeRange: TimeRange): Axis {
  return {
    minValue: getTimeFromTimestamp(timeRange.from),
    maxValue: getTimeFromTimestamp(timeRange.to),
  };
}

/**
 * Returns the Y axis to display results if all results have the same value.
 *
 * For values larger than 1 or smaller than -1, the results will be centered
 * along the Y axis. For values closer to zero, the zero value is kept at the
 * bottom (for zero and positive values) or top (for negative values) of the
 * axis.
 */
function getYAxisForConstantValue(value: number): Axis {
  if (value > 1 || value < -1) {
    return { minValue: value - 1, maxValue: value + 1 };
  } else if (value >= 0) {
    return { minValue: 0, maxValue: value + 1 };
  } else {
    return { minValue: value - 1, maxValue: 0 };
  }
}

/**
 * Takes an absolute value and normalizes it to a value between 0.0 and 1.0 for
 * the given axis.
 */
export function normalizeAlongLinearAxis(value: number, axis: Axis) {
  return (value - axis.minValue) / (axis.maxValue - axis.minValue);
}
