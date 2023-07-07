import type {
  AbstractChart,
  Axis,
  TimeseriesSourceData,
  Shape,
  ShapeList,
} from "../types";
import {
  detectStackedYAxisRange,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  normalizeAlongLinearAxis,
} from "../utils";
import type { Metric, Timeseries } from "../../providerTypes";

export function generateStackedBarChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis =
    input.stackingType === "percentage"
      ? { minValue: 0, maxValue: 100 }
      : detectStackedYAxisRange(input.timeseriesData);

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
  return {
    type: "bar",
    x: normalizeAlongLinearAxis(getTime(metric), xAxis),
    width: 0.1, // FIXME
    yMin: 0, // FIXME
    yMax: normalizeAlongLinearAxis(metric.value, yAxis),
    source: metric,
  };
}

function getTime(metric: Metric): number {
  return getTimeFromTimestamp(metric.time);
}
