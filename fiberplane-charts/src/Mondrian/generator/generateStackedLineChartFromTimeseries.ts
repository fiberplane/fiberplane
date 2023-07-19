import type {
  AbstractChart,
  AreaPoint,
  Shape,
  ShapeList,
  TimeseriesSourceData,
} from "../types";
import {
  attachSuggestionsToXAxis,
  calculateBucketsAndAxesForStackedChart,
  calculateSmallestTimeInterval,
  getTimeFromTimestamp,
  normalizeAlongLinearAxis,
  splitIntoContinuousLines,
} from "./utils";
import { compact } from "../../utils";
import type { Metric, Timeseries } from "../../providerTypes";

type AxesAndBuckets = ReturnType<typeof calculateBucketsAndAxesForStackedChart>;

export function generateStackedLineChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const axesAndBuckets = calculateBucketsAndAxesForStackedChart(input);
  const { buckets, xAxis, yAxis } = axesAndBuckets;

  const interval = calculateSmallestTimeInterval(buckets);
  if (interval) {
    attachSuggestionsToXAxis(xAxis, buckets, interval);
  }

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: timeseries.visible
        ? getShapes(timeseries.metrics, axesAndBuckets, interval)
        : [],
      source: timeseries,
    }));

  return { shapeLists, xAxis, yAxis };
}

function getShapes(
  metrics: Array<Metric>,
  axesAndBuckets: AxesAndBuckets,
  interval: number | null,
): Array<Shape<Metric>> {
  const lines = splitIntoContinuousLines(metrics, interval ?? undefined);
  return lines.map((line) => ({
    type: "area",
    points: compact(
      line.map((metric) => getPointForMetric(metric, axesAndBuckets)),
    ),
  }));
}

function getPointForMetric(
  metric: Metric,
  { buckets, isPercentage, xAxis, yAxis }: AxesAndBuckets,
): AreaPoint<Metric> | null {
  const bucketValue = buckets.get(metric.time);
  if (!bucketValue) {
    return null;
  }

  const time = getTimeFromTimestamp(metric.time);
  const value = isPercentage ? metric.value / bucketValue.total : metric.value;

  const yMin = bucketValue.currentY;
  const yMax = yMin + normalizeAlongLinearAxis(value, yAxis);
  bucketValue.currentY = yMax;

  return {
    x: normalizeAlongLinearAxis(time, xAxis),
    yMin,
    yMax,
    source: metric,
  };
}
