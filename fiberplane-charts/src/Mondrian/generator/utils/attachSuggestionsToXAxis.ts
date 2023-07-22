import { getTimeFromTimestamp } from "./getTimeFromTimestamp";
import type { Axis } from "../../types";
import type { Buckets } from "../types";

/**
 * Adds suggestions to the axis.
 * If the min value and max value of the data are sufficiently close to the minValue and maxValue of the axis,
 * then suggestions are based on the position of the first bucket and the interval between buckets.
 *
 * Otherwise, no suggestions are given.
 *
 * This is meant to accomodate the case where the axis min and max values are far away from the data.
 * E.g., when you query data from 2pm to 6pm, but we only observed data from 3pm to 4pm
 *
 * @note This function mutates its input axis.
 */
export function attachSuggestionsToXAxis(
  xAxis: Axis,
  buckets: Buckets<unknown>,
  interval: number,
) {
  const { firstBucketTimestamp, lastBucketTimestamp } =
    getBucketFirstLastTimestamps(buckets);

  if (!firstBucketTimestamp || !lastBucketTimestamp) {
    return;
  }

  if (interval <= 0) {
    return;
  }

  const isAxisMinFarAwayFromFirstBucket =
    firstBucketTimestamp - xAxis.minValue > 2 * interval;

  const isAxisMaxFarAwayFromLastBucket =
    xAxis.maxValue - lastBucketTimestamp > 2 * interval;

  const canUseBucketsAsSuggestsions =
    !isAxisMinFarAwayFromFirstBucket && !isAxisMaxFarAwayFromLastBucket;

  if (!canUseBucketsAsSuggestsions) {
    return;
  }

  let suggestion = firstBucketTimestamp;

  const suggestions = [];

  while (suggestion < xAxis.maxValue) {
    if (suggestion >= xAxis.minValue) {
      suggestions.push(suggestion);
    }

    suggestion += interval;
  }

  xAxis.tickSuggestions = suggestions;
}

function getBucketFirstLastTimestamps(buckets: Buckets<unknown>) {
  let firstBucketTimestamp: string | undefined;
  let lastBucketTimestamp: string | undefined;
  for (const timestamp of buckets.keys()) {
    if (!firstBucketTimestamp || timestamp < firstBucketTimestamp) {
      firstBucketTimestamp = timestamp;
    }
    if (!lastBucketTimestamp || timestamp > lastBucketTimestamp) {
      lastBucketTimestamp = timestamp;
    }
  }

  return {
    firstBucketTimestamp: firstBucketTimestamp
      ? getTimeFromTimestamp(firstBucketTimestamp)
      : undefined,
    lastBucketTimestamp: lastBucketTimestamp
      ? getTimeFromTimestamp(lastBucketTimestamp)
      : undefined,
  };
}
