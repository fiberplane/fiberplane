import { TimeRange } from "./providerTypes";

export function getPrometheusWindowFromTimeRange(timeRange: TimeRange) {
  const from = +new Date(timeRange.from) / 1000;
  const to = +new Date(timeRange.to) / 1000;

  return `${Math.floor(to - from)}s`;
}
