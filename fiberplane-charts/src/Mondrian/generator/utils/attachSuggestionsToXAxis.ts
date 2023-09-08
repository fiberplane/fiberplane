import type { Axis } from "../../types";
import type { Buckets } from "../types";
import { getTimeFromTimestamp } from "./getTimeFromTimestamp";

/**
 * Adds suggestions to the axis based on the position of the first bucket and
 * the interval between buckets.
 *
 * @note This function mutates its input axis.
 */
export function attachSuggestionsToXAxis(
  xAxis: Axis,
  buckets: Buckets<unknown>,
  interval: number,
) {
  if (interval <= 0) {
    return;
  }

  const firstBucketTime = getFirstBucketTime(buckets);
  if (!firstBucketTime) {
    return;
  }

  const suggestions = [];

  let suggestion = firstBucketTime;
  while (suggestion < xAxis.maxValue) {
    if (suggestion >= xAxis.minValue) {
      suggestions.push(suggestion);
    }

    suggestion += interval;
  }

  xAxis.tickSuggestions = suggestions;
}

function getFirstBucketTime(buckets: Buckets<unknown>): number | undefined {
  let firstBucketTimestamp: string | undefined;
  for (const timestamp of buckets.keys()) {
    if (!firstBucketTimestamp || timestamp < firstBucketTimestamp) {
      firstBucketTimestamp = timestamp;
    }
  }

  return firstBucketTimestamp
    ? getTimeFromTimestamp(firstBucketTimestamp)
    : undefined;
}
