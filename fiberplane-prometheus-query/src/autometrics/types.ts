/**
 * Label set to refer to a function within a module and service.
 */
export type ScopedFunction = {
  name: string;
  module: string;
  service_name?: string;
};

type LatencySeriesName =
  | "function_calls_duration_count"
  | "function_calls_duration_seconds_count";

type SuccessRateSeriesName =
  | "function_calls"
  | "function_calls_count_total"
  | "function_calls_count"
  | "function_calls_total";

/**
 * General Prometheus series for an Autometricized function.
 */
type AmSeries = {
  __name__: string;
  function: string;
  module: string;
  service_name?: string;
};

/**
 * An Autometrics function call histogram series with a latency objective
 * attached via labels.
 */
export type AmSeriesWithLatencyObjective = AmSeries & {
  __name__: LatencySeriesName;
  objective_name: string;
  objective_latency_threshold: string;
  objective_percentile: string;
};

/**
 * An Autometrics function call counter series with a success rate objective
 * attached via labels.
 */
export type AmSeriesWithSuccessObjective = AmSeries & {
  __name__: SuccessRateSeriesName;
  objective_name: string;
  objective_percentile: string;
};

export type SuccessRateTarget = {
  percentile: string;
};

/**
 * An SLO based off of success rate.
 */
export type SuccessRateObjective = {
  series: Array<AmSeries>;
  name: string;
  functions: Array<ScopedFunction>;
  functionsCount?: number;
  metric: "success_rate";
  target: SuccessRateTarget;
};

export type LatencyTarget = {
  percentile: string;
  threshold: string;
};

/**
 * An SLO based off of function latency (e.g., 99% of functions must complete in
 * under 100ms).
 */
export type LatencyObjective = {
  series: Array<AmSeries>;
  name: string;
  functions: Array<ScopedFunction>;
  functionsCount?: number;
  metric: "latency";
  target: LatencyTarget;
};

export type ObjectiveTarget = SuccessRateTarget | LatencyTarget;

export type Objective = SuccessRateObjective | LatencyObjective;

/**
 * An objective with a "current value" for its metric.
 */
// TODO - add the time range to this type
export type ObjectiveWithCurrentValue = Objective & {
  currentValue: string | null;
};

export type ObjectiveMetric = ObjectiveWithCurrentValue["metric"];
