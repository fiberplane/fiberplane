import type { Timestamp } from "../providerTypes";

export const dateToSeconds = (date: Date): number => date.getTime() / 1000;

export const secondsToTimestamp = (seconds: number): Timestamp =>
  new Date(seconds * 1000).toISOString();

export const timestampToDate = (timestamp: Timestamp): Date =>
  new Date(timestamp);

export const timestampToSeconds = (timestamp: Timestamp): number =>
  new Date(timestamp).getTime() / 1000;

export const timestampToMs = (value: Timestamp) => {
  const date = new Date(value);
  return date.getTime();
};
