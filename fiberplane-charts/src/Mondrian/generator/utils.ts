import type { Axis, TimeseriesSourceData } from "../types";
import type { TimeRange, Timeseries } from "../../providerTypes";

const BAR_PADDING = 0.2;
const BAR_PLUS_PADDING = 1 + BAR_PADDING;
const HALF_PADDING = 0.5 * BAR_PADDING;

/**
 * A map that holds arbitrary values per timestamp.
 *
 * The keys in the map represent timestamps, while the values are generic and
 * are calculated over all the metrics matching that timestamp.
 */
export type Buckets<T> = Map<string, T>;

/**
 * Represents the minimum and maximum values inside a series of numbers.
 */
export type MinMax = [min: number, max: number];

export type StackedChartBuckets = Buckets<StackedChartBucketValue>;

export type StackedChartBucketValue = {
  /**
   * Used to keep track of how much a bucket is "filled" while calculating the
   * area shapes.
   */
  currentY: number;

  /**
   * The sum of all values in the bucket.
   */
  total: number;
};

/**
 * Calculates the width of bars in bar charts.
 */
export function calculateBarWidth(
  xAxis: Axis,
  interval: number,
  numBarsPerGroup: number,
): number {
  const numGroups =
    interval === 0
      ? 1
      : Math.round((xAxis.maxValue - xAxis.minValue) / interval) + 1;
  const numBars = numGroups * numBarsPerGroup;
  return 1 / (numBars * BAR_PLUS_PADDING);
}

/**
 * Calculates the (left) X coordinate for a bar in a bar chart.
 *
 * `groupX` is the center coordinate for the bar group that contains all the
 * bars for a given bucket. `barWidth` is the width of an individual bar.
 *
 * `barIndex` and `numShapeLists` define the index of the bar within the group,
 * and how many bars may exist in the group in total, respectively.
 */
export function calculateBarX(
  groupX: number,
  barWidth: number,
  barIndex: number,
  numShapeLists: number,
): number {
  return (
    groupX +
    (barIndex - 0.5 * numShapeLists) * (barWidth * BAR_PLUS_PADDING) -
    barWidth * HALF_PADDING
  );
}

/**
 * Wrapper around `createMetricBuckets()` and axes creation specialized for
 * usage with stacked charts.
 */
export function calculateBucketsAndAxesForStackedChart(
  input: TimeseriesSourceData,
) {
  const buckets = createMetricBuckets(
    input.timeseriesData,
    ({ currentY, total }, value) => ({ currentY, total: total + value }),
    { currentY: 0, total: 0 } as StackedChartBucketValue,
  );

  const isPercentage = input.stackingType === "percentage";

  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis = isPercentage
    ? { minValue: 0, maxValue: 1 }
    : calculateStackedYAxisRange(buckets, ({ total }) => total);

  return { buckets, isPercentage, xAxis, yAxis };
}

/**
 * Calculates the smallest interval between any two timestamps present in the
 * given buckets.
 *
 * Returns `null` if there are insufficient timestamps to calculate an interval.
 */
export function calculateSmallestTimeInterval(
  buckets: Buckets<unknown>,
): number | null {
  const timestamps = Array.from(buckets.keys(), getTimeFromTimestamp);
  if (timestamps.length < 2) {
    return null;
  }

  timestamps.sort();

  let smallestInterval = Infinity;
  for (let i = 1; i < timestamps.length; i++) {
    const interval = timestamps[i] - timestamps[i - 1];
    if (interval < smallestInterval) {
      smallestInterval = interval;
    }
  }

  return smallestInterval;
}

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

/**
 * Creates buckets from timeseries, and reduces the metrics to calculated
 * values per bucket.
 *
 * For each unique timestamp encountered among the metrics, we create a new
 * bucket, while the value inside each bucket represents the reduced value for
 * all metrics matching that timestamp.
 */
export function createMetricBuckets<T>(
  timeseriesData: Array<Timeseries>,
  reducer: (current: T | undefined, metricValue: number) => T,
  initialValue: void,
): Buckets<T>;
export function createMetricBuckets<T>(
  timeseriesData: Array<Timeseries>,
  reducer: (current: T, metricValue: number) => T,
  initialValue: T,
): Buckets<T>;
export function createMetricBuckets<T>(
  timeseriesData: Array<Timeseries>,
  reducer: (current: T, metricValue: number) => T,
  initialValue: T,
): Buckets<T> {
  const buckets = new Map<string, T>();

  for (const timeseries of timeseriesData) {
    if (!timeseries.visible) {
      continue;
    }

    for (const { time, value } of timeseries.metrics) {
      if (!Number.isNaN(value)) {
        buckets.set(time, reducer(buckets.get(time) ?? initialValue, value));
      }
    }
  }

  return buckets;
}

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

/**
 * Extends the given min-max, if necessary, with the given value.
 *
 * @note This function mutates its input min-max.
 */
export function extendMinMax(minMax: MinMax, value: number): MinMax {
  if (value < minMax[0]) {
    minMax[0] = value;
  } else if (value > minMax[1]) {
    minMax[1] = value;
  }

  return minMax;
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

/**
 * Returns the initial min-max based on a single value.
 */
export function getInitialMinMax(value: number): MinMax {
  return [value, value];
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
