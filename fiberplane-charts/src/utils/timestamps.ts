import type { Timestamp } from "../providerTypes";

export const secondsToTimestamp = (seconds: number): Timestamp =>
  new Date(seconds * 1000).toISOString();

export const timestampToSeconds = (timestamp: Timestamp): number =>
  new Date(timestamp).getTime() / 1000;
