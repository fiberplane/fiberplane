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

export function generateAbstractLineChart(
  input: ChartInputData,
): AbstractChart {
  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis = detectYAxisRange(input.timeseriesData);

  const metrics: Array<ShapeList> = input.timeseriesData.map((timeseries) => ({
    shapes: getShapes(timeseries.metrics, xAxis, yAxis),
    timeseries,
  }));

  return {
    metrics,
    xAxis,
    yAxis,
  };
}

function getShapes(
  metrics: Array<Metric>,
  xAxis: Axis,
  yAxis: Axis,
): Array<Shape> {
  switch (metrics.length) {
    case 0:
      return [];
    case 1:
      return [
        {
          type: "point",
          x: normalizeAlongLinearAxis(getTime(metrics[0]), xAxis),
          y: normalizeAlongLinearAxis(metrics[0].value, yAxis),
        },
      ];
    default:
      return [
        {
          type: "line",
          points: metrics.map((metric) => ({
            x: normalizeAlongLinearAxis(getTime(metric), xAxis),
            y: normalizeAlongLinearAxis(metric.value, yAxis),
          })),
        },
      ];
  }
}

function getTime(metric: Metric): number {
  return getTimeFromTimestamp(metric.time);
}
