import type { Metric, Timeseries } from "../../providerTypes";
import { compact } from "../../utils";
import type {
  AbstractChart,
  Axis,
  Shape,
  ShapeList,
  TimeseriesSourceData,
} from "../types";
import type { StackedChartBuckets } from "./types";
import {
  attachSuggestionsToXAxis,
  calculateBarWidth,
  calculateBucketsAndAxesForStackedChart,
  calculateSmallestTimeInterval,
  extendAxisWithInterval,
  extendAxisWithValue,
  getTimeFromTimestamp,
  normalizeAlongLinearAxis,
} from "./utils";

export function generateStackedBarChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const { buckets, isPercentage, xAxis, yAxis } =
    calculateBucketsAndAxesForStackedChart(input);

  for (const value of input.additionalValues) {
    extendAxisWithValue(yAxis, value);
  }

  const interval = calculateSmallestTimeInterval(buckets);
  if (interval) {
    extendAxisWithInterval(xAxis, interval);
    attachSuggestionsToXAxis(xAxis, buckets, interval);
  }

  const barWidth = calculateBarWidth(xAxis, interval ?? 0, 1);
  const barArgs: BarArgs = { barWidth, buckets, isPercentage, xAxis, yAxis };

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: timeseries.visible
        ? compact(
            timeseries.metrics.map((metric) => getBarShape(metric, barArgs)),
          )
        : [],
      source: timeseries,
    }));

  return { shapeLists, xAxis, yAxis };
}

type BarArgs = {
  barWidth: number;
  buckets: StackedChartBuckets;
  isPercentage: boolean;
  xAxis: Axis;
  yAxis: Axis;
};

function getBarShape(
  metric: Metric,
  { xAxis, yAxis, barWidth, isPercentage, buckets }: BarArgs,
): Shape<Metric> | null {
  const bucketValue = buckets.get(metric.time);
  if (!bucketValue || Number.isNaN(metric.value)) {
    return null;
  }

  const time = getTimeFromTimestamp(metric.time);
  const value = isPercentage ? metric.value / bucketValue.total : metric.value;

  const x = normalizeAlongLinearAxis(time, xAxis) - 0.5 * barWidth;
  const y = bucketValue.currentY;

  const height = normalizeAlongLinearAxis(value, yAxis);
  bucketValue.currentY += height;

  return { type: "rectangle", x, y, width: barWidth, height, source: metric };
}
