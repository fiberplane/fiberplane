import type { Buckets } from "../types";
import { getTimeFromTimestamp } from "./getTimeFromTimestamp";

/**
 * Calculates the smallest interval between any two timestamps present in the
 * given buckets.
 *
 * Returns `null` if there are insufficient timestamps to calculate an interval.
 */
export function calculateSmallestTimeInterval(
  buckets: Buckets<unknown>,
): number | null {
  const timestamps = Array.from(buckets.keys(), getTimeFromTimestamp);
  if (timestamps.length < 2) {
    return null;
  }

  timestamps.sort();

  let smallestInterval = Number.POSITIVE_INFINITY;
  for (let i = 1; i < timestamps.length; i++) {
    const interval = timestamps[i] - timestamps[i - 1];
    if (interval < smallestInterval) {
      smallestInterval = interval;
    }
  }

  return smallestInterval;
}
