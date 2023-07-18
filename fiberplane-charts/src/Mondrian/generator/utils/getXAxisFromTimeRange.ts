import type { Axis, TimeRange } from "../../types";
import { getTimeFromTimestamp } from "./getTimeFromTimestamp";

/**
 * Returns the X axis to display results for the given time range.
 */
export function getXAxisFromTimeRange(timeRange: TimeRange): Axis {
  return {
    minValue: getTimeFromTimestamp(timeRange.from),
    maxValue: getTimeFromTimestamp(timeRange.to),
  };
}
