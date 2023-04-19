import type { Timeseries } from "../providerTypes";

/**
 * Return a list of keys whose values vary across series (or don't exist
 * everywhere).
 */
export function findUniqueKeys(timeseriesData: Array<Timeseries>) {
  let constantKeys: Set<string> | undefined;
  let detectedValues: Record<string, string> = {};

  for (const timeseries of timeseriesData) {
    const keys = Object.keys(timeseries.labels);

    if (constantKeys === undefined) {
      constantKeys = new Set(keys);
      detectedValues = { ...timeseries.labels };
    } else {
      for (const key of keys) {
        if (detectedValues[key] !== timeseries.labels[key]) {
          constantKeys.delete(key);
        }

        detectedValues[key] = timeseries.labels[key] || "";
      }
    }
  }

  const allKeys = Object.keys(detectedValues);
  return allKeys.filter(
    (key) => constantKeys === undefined || constantKeys.has(key) === false,
  );
}
