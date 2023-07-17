import type { InteractiveControlsState } from "../CoreChart";
import { secondsToTimestamp, timestampToSeconds } from "../utils";
import type { TimeRange } from "../providerTypes";

/**
 * Translates a time-range based on the active zoom state.
 */
export function translateTimeRange(
  timeRange: TimeRange,
  controlsState: InteractiveControlsState,
  xMax: number,
): TimeRange {
  if (controlsState.type === "drag") {
    const { start, end } = controlsState;
    if (end !== undefined && start !== end) {
      const from = timestampToSeconds(timeRange.from);
      const to = timestampToSeconds(timeRange.to);
      const delta = ((start - end) / xMax) * (to - from);
      return {
        from: secondsToTimestamp(from + delta),
        to: secondsToTimestamp(to + delta),
      };
    }
  }

  return timeRange;
}
