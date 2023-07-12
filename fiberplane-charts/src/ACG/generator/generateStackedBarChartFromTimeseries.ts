import type {
  AbstractChart,
  Axis,
  TimeseriesSourceData,
  Shape,
  ShapeList,
} from "../types";
import {
  calculateStackedYAxisRange,
  createMetricBuckets,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  normalizeAlongLinearAxis,
} from "./utils";
import { identity } from "../../utils";
import type { Metric, Timeseries } from "../../providerTypes";

export function generateStackedBarChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const buckets = createMetricBuckets(
    input.timeseriesData,
    (total, value) => total + value,
    0,
  );

  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis =
    input.stackingType === "percentage"
      ? { minValue: 0, maxValue: 100 }
      : calculateStackedYAxisRange(buckets, identity);

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: timeseries.metrics.map((metric) =>
        getBarShape(metric, xAxis, yAxis),
      ),
      source: timeseries,
    }));

  return {
    shapeLists,
    xAxis,
    yAxis,
  };
}

function getBarShape(metric: Metric, xAxis: Axis, yAxis: Axis): Shape<Metric> {
  const x = normalizeAlongLinearAxis(getTime(metric), xAxis);
  return {
    type: "rectangle",
    x: x - 0.05, // FIXME
    width: 0.1, // FIXME
    y: 0, // FIXME
    height: normalizeAlongLinearAxis(metric.value, yAxis),
    source: metric,
  };
}

function getTime(metric: Metric): number {
  return getTimeFromTimestamp(metric.time);
}
