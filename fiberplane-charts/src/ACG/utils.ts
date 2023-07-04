import { Axis, TimeRange, Timeseries } from "./types";

export function detectYAxisRange(timeseriesData: Array<Timeseries>): Axis {
  const minMax = detectTimeseriesArrayMinMax(timeseriesData);
  if (!minMax) {
    // Nothing to show, but at least we return a range instead of a collapsed line.
    return { minValue: 0, maxValue: 1 };
  }

  const [minValue, maxValue] = minMax;

  if (minValue === maxValue) {
    // A boring flat line. Well, let's center it in the chart.
    return { minValue: minValue - 0.5, maxValue: maxValue + 0.5 };
  }

  return { minValue, maxValue };
}

export function detectTimeseriesArrayMinMax(
  timeseriesData: Array<Timeseries>,
): [min: number, max: number] | undefined {
  let minMax: [min: number, max: number] | undefined;

  for (const timeseries of timeseriesData) {
    const timeseriesMinMax = detectTimeseriesMinMax(timeseries);
    if (timeseriesMinMax) {
      if (!minMax) {
        minMax = timeseriesMinMax;
        continue;
      }

      if (timeseriesMinMax[0] < minMax[0]) {
        minMax[0] = timeseriesMinMax[0];
      }
      if (timeseriesMinMax[1] > minMax[1]) {
        minMax[1] = timeseriesMinMax[1];
      }
    }
  }

  return minMax;
}

export function detectTimeseriesMinMax(
  timeseries: Timeseries,
): [min: number, max: number] | undefined {
  let minMax: [min: number, max: number] | undefined;

  for (const { value } of timeseries.metrics) {
    if (!minMax) {
      minMax = [value, value];
    } else if (value < minMax[0]) {
      minMax[0] = value;
    } else if (value > minMax[1]) {
      minMax[1] = value;
    }
  }

  return minMax;
}

export function getTimeFromTimestamp(timestamp: string): number {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) {
    throw new TypeError(`Invalid timestamp: ${timestamp}`);
  }

  return time;
}

export function getXAxisFromTimeRange(timeRange: TimeRange): Axis {
  return {
    minValue: getTimeFromTimestamp(timeRange.from),
    maxValue: getTimeFromTimestamp(timeRange.to),
  };
}

export function normalizeAlongLinearAxis(value: number, axis: Axis) {
  return (value - axis.minValue) / (axis.maxValue - axis.minValue);
}
