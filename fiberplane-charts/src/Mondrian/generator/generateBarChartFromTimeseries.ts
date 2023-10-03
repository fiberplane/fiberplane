import type { Metric, Timeseries } from "../../providerTypes";
import { compact, identity } from "../../utils";
import type {
  AbstractChart,
  Axis,
  Shape,
  ShapeList,
  TimeseriesSourceData,
} from "../types";
import type { MinMax } from "./types";
import {
  attachSuggestionsToXAxis,
  calculateBarWidth,
  calculateBarX,
  calculateSmallestTimeInterval,
  calculateYAxisRange,
  createMetricBuckets,
  extendAxisWithInterval,
  extendAxisWithValue,
  extendMinMax,
  getInitialMinMax,
  getTimeFromTimestamp,
  getXAxisFromTimeRange,
  normalizeAlongLinearAxis,
} from "./utils";

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

  for (const value of input.additionalValues) {
    extendAxisWithValue(yAxis, value);
  }

  const numShapeLists = visibleTimeseriesData.length;

  const interval = calculateSmallestTimeInterval(buckets);
  if (interval) {
    extendAxisWithInterval(xAxis, interval);
    attachSuggestionsToXAxis(xAxis, buckets, interval);
  }

  const barWidth = calculateBarWidth(xAxis, interval ?? 0, numShapeLists);
  const barArgs: BarArgs = { barWidth, numShapeLists, xAxis, yAxis };

  const shapeLists: Array<ShapeList<Timeseries, Metric>> =
    input.timeseriesData.map((timeseries) => ({
      shapes: timeseries.visible
        ? compact(
            timeseries.metrics.map((metric) =>
              getBarShape(
                metric,
                visibleTimeseriesData.indexOf(timeseries),
                barArgs,
              ),
            ),
          )
        : [],
      source: timeseries,
    }));

  return { shapeLists, xAxis, yAxis };
}

type BarArgs = {
  barWidth: number;
  numShapeLists: number;
  xAxis: Axis;
  yAxis: Axis;
};

function getBarShape(
  metric: Metric,
  barIndex: number,
  { xAxis, yAxis, barWidth, numShapeLists: numVisibleTimeseries }: BarArgs,
): Shape<Metric> | null {
  if (Number.isNaN(metric.value)) {
    return null;
  }

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
