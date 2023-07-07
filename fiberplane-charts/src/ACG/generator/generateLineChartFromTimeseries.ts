import type {
  AbstractChart,
  Axis,
  TimeseriesSourceData,
  Shape,
  ShapeList,
} from "../types";
import {
  detectYAxisRange,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  normalizeAlongLinearAxis,
} from "./utils";
import type { Metric, Timeseries } from "../../providerTypes";

export function generateLineChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis = detectYAxisRange(input.timeseriesData);

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: getShapes(timeseries.metrics, xAxis, yAxis),
      source: timeseries,
    }));

  return {
    shapeLists,
    xAxis,
    yAxis,
  };
}

function getShapes(
  metrics: Array<Metric>,
  xAxis: Axis,
  yAxis: Axis,
): Array<Shape<Metric>> {
  switch (metrics.length) {
    case 0:
      return [];
    case 1:
      return [
        {
          type: "point",
          x: normalizeAlongLinearAxis(getTime(metrics[0]), xAxis),
          y: normalizeAlongLinearAxis(metrics[0].value, yAxis),
          source: metrics[0],
        },
      ];
    default:
      return [
        {
          type: "line",
          points: metrics.map((metric) => ({
            x: normalizeAlongLinearAxis(getTime(metric), xAxis),
            y: normalizeAlongLinearAxis(metric.value, yAxis),
            source: metric,
          })),
        },
      ];
  }
}

function getTime(metric: Metric): number {
  return getTimeFromTimestamp(metric.time);
}
