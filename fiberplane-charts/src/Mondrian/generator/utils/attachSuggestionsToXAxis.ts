import { getTimeFromTimestamp } from "./getTimeFromTimestamp";
import type { Axis } from "../../types";
import type { Buckets } from "../types";

/**
 * Adds suggestions to the axis.
 * If the min value and max value of the data are sufficiently close to the minValue and maxValue of the axis,
 * then suggestions are based on the position of the first bucket and the interval between buckets.
 *
 * Otherwise, suggestions are based on an the axis min and max values,
 * where the interval is the full length of the axis divided by the number of buckets.
 *
 * This strategy is meant to accomodate the case where the axis min and max values are far away from the data.
 * E.g., when you query data from 2pm to 6pm, but we only observed data from 3pm to 4pm
 *
 * @note This function mutates its input axis.
 */
export function attachSuggestionsToXAxis(
  xAxis: Axis,
  buckets: Buckets<unknown>,
  dataInterval: number,
) {
  const { firstBucketTimestamp, lastBucketTimestamp } =
    getBucketFirstLastTimestamps(buckets);

  if (!firstBucketTimestamp || !lastBucketTimestamp) {
    return;
  }

  if (dataInterval <= 0) {
    return;
  }

  const isAxisMinFarAwayFromFirstBucket =
    firstBucketTimestamp - xAxis.minValue > 2 * dataInterval;

  const isAxisMaxFarAwayFromLastBucket =
    xAxis.maxValue - lastBucketTimestamp > 2 * dataInterval;

  const canUseBucketsAsSuggestsions =
    !isAxisMinFarAwayFromFirstBucket && !isAxisMaxFarAwayFromLastBucket;

  // if (!canUseBucketsAsSuggestsions) {
  //   return;
  // }

  let interval;
  let suggestion;
  if (canUseBucketsAsSuggestsions) {
    interval = dataInterval;
    suggestion = firstBucketTimestamp;
  } else {
    // Use fallback interval to divide the axis into equal parts
    interval = (xAxis.maxValue - xAxis.minValue) / buckets.size;
    suggestion = xAxis.minValue + interval;
  }

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
