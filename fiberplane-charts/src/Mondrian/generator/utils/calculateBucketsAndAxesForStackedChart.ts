import type { StackedChartBucketValue } from "../types";
import type { TimeseriesSourceData } from "../../types";
import { calculateStackedYAxisRange } from "./calculateStackedYAxisRange";
import { createMetricBuckets } from "./createMetricBuckets";
import { getXAxisFromTimeRange } from "./getXAxisFromTimeRange";

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
