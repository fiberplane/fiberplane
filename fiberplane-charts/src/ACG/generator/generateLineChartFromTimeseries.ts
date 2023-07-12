import type {
  AbstractChart,
  Axis,
  Point,
  Shape,
  ShapeList,
  TimeseriesSourceData,
} from "../types";
import {
  calculateYAxisRange,
  createMetricBuckets,
  extendMinMax,
  getInitialMinMax,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  MinMax,
  normalizeAlongLinearAxis,
} from "./utils";
import { identity } from "../../utils";
import type { Metric, Timeseries } from "../../providerTypes";

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

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: timeseries.visible
        ? getShapes(timeseries.metrics, xAxis, yAxis)
        : [],
      source: timeseries,
    }));

  return { shapeLists, xAxis, yAxis };
}

function getShapes(
  metrics: Array<Metric>,
  xAxis: Axis,
  yAxis: Axis,
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
    default:
      // TODO: Implement gap detection: https://github.com/autometrics-dev/explorer/issues/35
      return [
        {
          type: "line",
          points: metrics.map((metric) =>
            getPointForMetric(metric, xAxis, yAxis),
          ),
        },
      ];
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
