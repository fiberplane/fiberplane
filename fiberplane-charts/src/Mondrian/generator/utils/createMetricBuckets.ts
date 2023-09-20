import type { Timeseries } from "../../../providerTypes";
import type { Buckets } from "../types";

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
