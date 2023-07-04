import type {
  AbstractChart,
  Axis,
  ChartInputData,
  Metric,
  Shape,
  ShapeList,
} from "../types";
import {
  detectYAxisRange,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  normalizeAlongLinearAxis,
} from "../utils";

export function generateAbstractBarChart(input: ChartInputData): AbstractChart {
  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis = detectYAxisRange(input.timeseriesData);

  const metrics: Array<ShapeList> = input.timeseriesData.map((timeseries) => ({
    shapes: timeseries.metrics.map((metric) =>
      getBarShape(metric, xAxis, yAxis),
    ),
    timeseries,
  }));

  return {
    metrics,
    xAxis,
    yAxis,
  };
}

function getBarShape(metric: Metric, xAxis: Axis, yAxis: Axis): Shape {
  return {
    type: "bar",
    x: normalizeAlongLinearAxis(getTime(metric), xAxis),
    width: 0.1, // FIXME
    yMin: 0,
    yMax: normalizeAlongLinearAxis(metric.value, yAxis),
  };
}

function getTime(metric: Metric): number {
  return getTimeFromTimestamp(metric.time);
}
