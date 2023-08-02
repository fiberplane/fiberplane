import type {
  AbstractChart,
  SeriesSource,
  TimeseriesAndEventsSourceData,
  TimeseriesSourceData,
} from "../types";
import { generateBarChartFromTimeseries } from "./generateBarChartFromTimeseries";
import { generateLineChartFromTimeseries } from "./generateLineChartFromTimeseries";
import { generateShapeListFromEvents } from "./generateShapeListFromEvents";
import { generateStackedBarChartFromTimeseries } from "./generateStackedBarChartFromTimeseries";
import { generateStackedLineChartFromTimeseries } from "./generateStackedLineChartFromTimeseries";
import type { Timeseries, Metric, ProviderEvent } from "../../providerTypes";

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

/**
 * Generates an abstract chart from the given timeseries data.
 */
export function generateFromTimeseriesAndEvents(
  input: TimeseriesAndEventsSourceData,
): AbstractChart<SeriesSource, Metric | ProviderEvent> {
  const timeseriesChart = generateFromTimeseries(input);

  const chart: AbstractChart<SeriesSource, Metric | ProviderEvent> = {
    ...timeseriesChart,
    shapeLists: timeseriesChart.shapeLists.map((list) => ({
      ...list,
      source: { ...list.source, type: "timeseries" },
    })),
  };

  if (input.graphType === "line" && input.events.length > 0) {
    chart.shapeLists.push(
      generateShapeListFromEvents(chart.xAxis, input.events),
    );
  }

  return chart;
}
