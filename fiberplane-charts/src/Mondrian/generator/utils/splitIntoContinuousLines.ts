import type { Metric } from "../../../providerTypes";
import { getTimeFromTimestamp } from "./getTimeFromTimestamp";

/**
 * Takes an array of metrics and divides it into a lines of metrics without
 * gaps.
 *
 * Any metric that has a `NaN` value, or that follows more than `1.5 * interval`
 * after the previous metric is considered to introduce a gap in the metrics.
 */
export function splitIntoContinuousLines(
  metrics: Array<Metric>,
  interval?: number,
): Array<Array<Metric>> {
  const lines: Array<Array<Metric>> = [];
  let currentLine: Array<Metric> = [];
  let previousTime: number | null = null;

  for (const metric of metrics) {
    if (Number.isNaN(metric.value)) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [];
      }

      continue;
    }

    const newTime = getTimeFromTimestamp(metric.time);
    if (previousTime && interval && newTime - previousTime > 1.5 * interval) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [metric];
      }
    } else {
      currentLine.push(metric);
    }

    previousTime = newTime;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}
