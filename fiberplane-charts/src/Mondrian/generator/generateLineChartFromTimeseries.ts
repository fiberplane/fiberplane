import type {
  AbstractChart,
  Axis,
  Point,
  Shape,
  ShapeList,
  TimeseriesSourceData,
} from "../types";
import {
  calculateSmallestTimeInterval,
  calculateYAxisRange,
  createMetricBuckets,
  extendMinMax,
  getInitialMinMax,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  normalizeAlongLinearAxis,
  splitIntoContinuousLines,
} from "./utils";
import { identity } from "../../utils";
import type { Metric, Timeseries } from "../../providerTypes";
import type { MinMax } from "./types";

export function generateLineChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const buckets = createMetricBuckets(
    input.timeseriesData,
    (maybeMinMax: MinMax | undefined, value) =>
      maybeMinMax ? extendMinMax(maybeMinMax, value) : getInitialMinMax(value),
  );

  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis = calculateYAxisRange(buckets, identity);

  const interval = calculateSmallestTimeInterval(buckets);

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: timeseries.visible
        ? getShapes(timeseries.metrics, xAxis, yAxis, interval)
        : [],
      source: timeseries,
    }));

  return { shapeLists, xAxis, yAxis };
}

function getShapes(
  metrics: Array<Metric>,
  xAxis: Axis,
  yAxis: Axis,
  interval: number | null,
): Array<Shape<Metric>> {
  switch (metrics.length) {
    case 0:
      return [];
    case 1: {
      const metric = metrics[0];
      return Number.isNaN(metric.value)
        ? []
        : [{ type: "point", ...getPointForMetric(metric, xAxis, yAxis) }];
    }
    default: {
      const lines = splitIntoContinuousLines(metrics, interval ?? undefined);
      return lines.map((line) => ({
        type: "line",
        points: line.map((metric) => getPointForMetric(metric, xAxis, yAxis)),
      }));
    }
  }
}

function getPointForMetric(
  metric: Metric,
  xAxis: Axis,
  yAxis: Axis,
): Point<Metric> {
  const time = getTimeFromTimestamp(metric.time);

  return {
    x: normalizeAlongLinearAxis(time, xAxis),
    y: normalizeAlongLinearAxis(metric.value, yAxis),
    source: metric,
  };
}
