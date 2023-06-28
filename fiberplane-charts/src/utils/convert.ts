import { compact } from "./compact";
import type { Timeseries } from "../providerTypes";

export const dateKey: unique symbol = Symbol("date");

export type DataItem = { [dateKey]: string; data: Map<Timeseries, number> };

type TimestampRecord = Record<string, number>;

export function getTimestamp(d: DataItem): number {
  return new Date(d[dateKey]).getTime();
}

export function dataToPercentages(dataItems: Array<DataItem>): Array<DataItem> {
  return dataItems.map((item): DataItem => {
    let total = 0;
    for (const value of item.data.values()) {
      total += value;
    }

    if (total === 0) {
      return item;
    }

    const data: Map<Timeseries, number> = new Map();
    for (const [key, value] of item.data) {
      data.set(key, (value / total) * 100);
    }

    return {
      [dateKey]: item[dateKey],
      data,
    };
  });
}

export function toDataItems(
  timeseriesData: ReadonlyArray<Timeseries>,
): Array<DataItem> {
  const timestampSet = new Set<string>();
  const annotatedFilteredDataIn = compact(
    timeseriesData.map((series): null | [Timeseries, TimestampRecord] => {
      if (!series.visible) {
        return null;
      }

      // Make it easy to look up points by timestamp when assembling result:
      const data: TimestampRecord = {};
      for (const metric of series.metrics) {
        data[metric.time] = metric.value;
        timestampSet.add(metric.time);
      }

      return [series, data];
    }),
  );

  return [...timestampSet].sort().map((timestamp): DataItem => {
    const data = new Map();
    for (const [series, record] of annotatedFilteredDataIn) {
      data.set(series, record[timestamp] ?? 0);
    }

    return { [dateKey]: timestamp, data };
  });
}
