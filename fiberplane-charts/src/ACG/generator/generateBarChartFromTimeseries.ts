import type {
  AbstractChart,
  Axis,
  Shape,
  ShapeList,
  TimeseriesSourceData,
} from "../types";
import {
  calculateBarWidth,
  calculateBarX,
  calculateSmallestTimeInterval,
  calculateYAxisRange,
  createMetricBuckets,
  extendAxisWithInterval,
  extendMinMax,
  getInitialMinMax,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  MinMax,
  normalizeAlongLinearAxis,
} from "./utils";
import { identity } from "../../utils";
import type { Metric, Timeseries } from "../../providerTypes";

export function generateBarChartFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  const visibleTimeseriesData = input.timeseriesData.filter(
    (timeseries) => timeseries.visible,
  );

  const buckets = createMetricBuckets(
    visibleTimeseriesData,
    (maybeMinMax: MinMax | undefined, value) =>
      maybeMinMax ? extendMinMax(maybeMinMax, value) : getInitialMinMax(value),
  );

  const xAxis = getXAxisFromTimeRange(input.timeRange);
  const yAxis = calculateYAxisRange(buckets, identity);

  const numShapeLists = visibleTimeseriesData.length;
  const smallestInterval = calculateSmallestTimeInterval(buckets);
  if (smallestInterval) {
    extendAxisWithInterval(xAxis, smallestInterval);
  }

  const barWidth = calculateBarWidth(
    xAxis,
    smallestInterval ?? 0,
    numShapeLists,
  );

  const shapeArgs: ShapeArgs = { xAxis, yAxis, barWidth, numShapeLists };

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: timeseries.visible
        ? timeseries.metrics.map((metric) =>
            getBarShape(
              metric,
              visibleTimeseriesData.indexOf(timeseries),
              shapeArgs,
            ),
          )
        : [],
      source: timeseries,
    }));

  return {
    shapeLists,
    xAxis,
    yAxis,
  };
}

type ShapeArgs = {
  xAxis: Axis;
  yAxis: Axis;
  barWidth: number;
  numShapeLists: number;
};

function getBarShape(
  metric: Metric,
  barIndex: number,
  { xAxis, yAxis, barWidth, numShapeLists: numVisibleTimeseries }: ShapeArgs,
): Shape<Metric> {
  const groupX = normalizeAlongLinearAxis(
    getTimeFromTimestamp(metric.time),
    xAxis,
  );
  return {
    type: "rectangle",
    x: calculateBarX(groupX, barWidth, barIndex, numVisibleTimeseries),
    width: barWidth,
    y: 0,
    height: normalizeAlongLinearAxis(metric.value, yAxis),
    source: metric,
  };
}
