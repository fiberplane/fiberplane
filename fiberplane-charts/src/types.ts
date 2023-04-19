import type { Timestamp } from "./providerTypes";

export type {
  GraphType,
  Metric,
  OtelMetadata,
  StackingType,
  Timeseries,
  Timestamp,
} from "./providerTypes";

export type TimeRange = {
  from: Timestamp;
  to: Timestamp;
};
