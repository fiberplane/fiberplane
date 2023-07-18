import type {
  AbstractChart,
  AreaPoint,
  Shape,
  ShapeList,
  TimeseriesSourceData,
} from "../types";
import {
  calculateBucketsAndAxesForStackedChart,
  getTimeFromTimestamp,
  normalizeAlongLinearAxis,
} from "./utils";
import type { Metric, Timeseries } from "../../providerTypes";
import { compact } from "../../utils";

type AxesAndBuckets = ReturnType<typeof calculateBucketsAndAxesForStackedChart>;

export function generateStackedLineChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const axesAndBuckets = calculateBucketsAndAxesForStackedChart(input);

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: timeseries.visible
        ? getShapes(timeseries.metrics, axesAndBuckets)
        : [],
      source: timeseries,
    }));

  return {
    shapeLists,
    xAxis: axesAndBuckets.xAxis,
    yAxis: axesAndBuckets.yAxis,
  };
}

function getShapes(
  metrics: Array<Metric>,
  axesAndBuckets: AxesAndBuckets,
): Array<Shape<Metric>> {
  if (metrics.length === 0) {
    return [];
  }

  // TODO: Implement gap detection: https://github.com/autometrics-dev/explorer/issues/35
  const points = compact(
    metrics.map((metric) => getPointForMetric(metric, axesAndBuckets)),
  );

  return [{ type: "area", points }];
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
