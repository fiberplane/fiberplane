import type { AbstractChart, TimeseriesSourceData } from "../types";
import { generateBarChartFromTimeseries } from "./generateBarChartFromTimeseries";
import { generateLineChartFromTimeseries } from "./generateLineChartFromTimeseries";
import { generateStackedBarChartFromTimeseries } from "./generateStackedBarChartFromTimeseries";
import { generateStackedLineChartFromTimeseries } from "./generateStackedLineChartFromTimeseries";
import type { Timeseries, Metric } from "../../providerTypes";

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
