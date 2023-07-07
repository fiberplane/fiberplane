import type {
  AbstractChart,
  Axis,
  Shape,
  ShapeList,
  TimeseriesSourceData,
} from "../types";
import {
  detectYAxisRange,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  normalizeAlongLinearAxis,
} from "../utils";
import type { Metric, Timeseries } from "../../providerTypes";

export function generateBarChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis = detectYAxisRange(input.timeseriesData);

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
    xMin: x - 0.05, // FIXME
    xMax: x + 0.05, // FIXME
    yMin: 0,
    yMax: normalizeAlongLinearAxis(metric.value, yAxis),
    source: metric,
  };
}

function getTime(metric: Metric): number {
  return getTimeFromTimestamp(metric.time);
}
