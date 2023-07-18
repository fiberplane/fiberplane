import type { Axis } from "../../types";
import { BAR_PLUS_PADDING } from "../constants";

/**
 * Calculates the width of bars in bar charts.
 */
export function calculateBarWidth(
  xAxis: Axis,
  interval: number,
  numBarsPerGroup: number,
): number {
  const numGroups =
    interval === 0
      ? 1
      : Math.round((xAxis.maxValue - xAxis.minValue) / interval) + 1;
  const numBars = numGroups * numBarsPerGroup;
  return 1 / (numBars * BAR_PLUS_PADDING);
}
