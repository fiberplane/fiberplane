import type {
  AbstractChart,
  SeriesSource,
  CombinedSourceData,
  TimeseriesSourceData,
} from "../types";
import { generateBarChartFromTimeseries } from "./generateBarChartFromTimeseries";
import { generateLineChartFromTimeseries } from "./generateLineChartFromTimeseries";
import { generateShapeListFromEvents } from "./generateShapeListFromEvents";
import { generateShapeListFromTargetLatency } from "./generateShapeListFromTargetLatency";
import { generateStackedBarChartFromTimeseries } from "./generateStackedBarChartFromTimeseries";
import { generateStackedLineChartFromTimeseries } from "./generateStackedLineChartFromTimeseries";
import type { Timeseries, Metric, ProviderEvent } from "../../providerTypes";

/**
 * Generates an abstract chart from a combination of timeseries data, events and
 * an optional target latency.
 */
export function generate({
  graphType,
  stackingType,
  timeseriesData,
  events,
  targetLatency,
  timeRange,
}: CombinedSourceData): AbstractChart<
  SeriesSource,
  Metric | ProviderEvent | null
> {
  const timeseriesChart = generateFromTimeseries({
    graphType,
    stackingType,
    timeseriesData,
    timeRange,
    additionalValues: targetLatency ? [targetLatency] : [],
  });

  const chart: AbstractChart<SeriesSource, Metric | ProviderEvent | null> = {
    ...timeseriesChart,
    shapeLists: timeseriesChart.shapeLists.map((list) => ({
      ...list,
      source: { ...list.source, type: "timeseries" },
    })),
  };

  if (graphType === "line" && events.length > 0) {
    chart.shapeLists.push(generateShapeListFromEvents(chart.xAxis, events));
  }

  if (targetLatency) {
    chart.shapeLists.push(
      generateShapeListFromTargetLatency(chart.yAxis, targetLatency),
    );
  }

  return chart;
}

/**
 * Generates an abstract chart from the given timeseries data.
 */
export function generateFromTimeseries(
  input: TimeseriesSourceData,
): AbstractChart<Timeseries, Metric> {
  if (input.graphType === "line") {
    return input.stackingType === "none"
      ? generateLineChartFromTimeseries(input)
      : generateStackedLineChartFromTimeseries(input);
  } else {
    return input.stackingType === "none"
      ? generateBarChartFromTimeseries(input)
      : generateStackedBarChartFromTimeseries(input);
  }
}
