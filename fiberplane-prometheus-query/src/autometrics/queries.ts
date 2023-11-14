import type { TimeRange } from "../providerTypes";
import { getPrometheusWindowFromTimeRange } from "../utils";
import {
  LatencyObjective,
  Objective,
  ScopedFunction,
  SuccessRateObjective,
} from "./types";

/**
 * The list of metric types supported by Autometrics.
 *
 * Please do not rely on the length or order of this array. Adding new metric
 * types to this array will not be considered a breaking change.
 *
 * If you want to know whether a given string is a valid metric type, you may
 * want to use the {@link isMetricType()} type guard.
 */
export const metricTypes = ["request_rate", "error_ratio", "latency"] as const;

/**
 * Type of metric supported by Autometrics for generating queries.
 */
export type MetricType = typeof metricTypes[number];

/**
 * Returns whether the given string is a valid {@link MetricType}.
 */
export function isMetricType(metricType: string): metricType is MetricType {
  return metricTypes.includes(metricType as MetricType);
}

/**
 * Information necessary for generating a query related to a given
 * Autometricized function.
 */
export type FunctionQuery = {
  functionName: string;
  moduleName?: string;
  interval?: string;
  buildInfoInterval?: string;
};

/**
 * Information necessary for generating a query related to the top 5
 * Autometricized functions.
 */
export type Top5FunctionQuery = {
  interval?: string;
  buildInfoInterval?: string;
};

/**
 * Generates the PromQL query for a given metric type related to a given
 * Autometricized function.
 */
export function createFunctionQuery(
  metricType: MetricType,
  query: FunctionQuery,
): string {
  switch (metricType) {
    case "error_ratio":
      return createFunctionErrorRatioQuery(query);
    case "request_rate":
      return createFunctionRequestRateQuery(query);
    case "latency":
      return createFunctionLatencyQuery(query);
  }
}

/**
 * Generates the PromQL query to determine how many errors happened in a given
 * time window.
 */
export function createErrorCountQuery({
  functionName,
  moduleName,
  interval,
}: Omit<FunctionQuery, "buildInfoInterval">) {
  // To find out how many errors happened in a given time window using our
  // counter metric, we can use the `sum()` function along with the `increase()`
  // function.
  //
  // The `increase()` function calculates the rate of increase of a counter
  // metric over the specified time range, and `sum()` then adds up the
  // calculated rates, giving us the total count of invocations.
  return `
sum by (function, module) (
  increase({
    __name__=~"function_calls(_count)?(_total)?", 
    result="error",
    function="${functionName}"${addModuleLabelIfDefined(moduleName, 4)}
  }[${interval}])
)`.trim();
}

/**
 * Generates the PromQL query for the latency chart (99th and 95th percentile)
 * for an Autometricized function.
 */
export function createFunctionLatencyQuery({
  functionName,
  moduleName,
  interval = "5m",
  buildInfoInterval,
}: FunctionQuery) {
  return `
  label_replace(
    histogram_quantile(
      0.99,
      sum by (le, function, module, commit, version, service_name) (
        rate({
          __name__=~"function_calls_duration(_seconds)?_bucket",
          function=~"${functionName}"${addModuleLabelIfDefined(moduleName, 8)}
        }[${interval}])
        # Attach the version and commit labels from the build_info metric
        ${getBuildInfoQuery({ indent: 6, interval: buildInfoInterval })}
      )
    ),
    # Add the label {percentile_latency="99"} to the time series
    "percentile_latency", "99", "", ""
  )
  
  or
  
  label_replace(
    histogram_quantile(
      0.95,
      sum by (le, function, module, commit, version, service_name) (
        rate({
          __name__=~"function_calls_duration(_seconds)?_bucket",
          function=~"${functionName}"${addModuleLabelIfDefined(moduleName, 8)}
        }[${interval}])
        # Attach the version and commit labels from the build_info metric
        ${getBuildInfoQuery({ indent: 6, interval: buildInfoInterval })}
      )
    ),
    # Add the label {percentile_latency="95"} to the time series
    "percentile_latency", "95", "", ""
  )`.trim();
}

/**
 * Generates the PromQL query for the error rate for an Autometricized function.
 */
export function createFunctionErrorRatioQuery({
  functionName,
  moduleName,
  interval = "5m",
  buildInfoInterval,
}: FunctionQuery) {
  return `
  (
    sum by(function, module, version, commit, service_name) (
      rate(
        {
          __name__=~"function_calls(_count)?(_total)?",
          result="error", 
          function=~"${functionName}"${addModuleLabelIfDefined(moduleName, 8)}
        }[${interval}]
      )
      ${getBuildInfoQuery({ indent: 4, interval: buildInfoInterval })}
    )) / (
    sum by(function, module, version, commit, service_name) (
      rate(
        {
          __name__=~"function_calls(_count)?(_total)?",
          function=~"${functionName}"${addModuleLabelIfDefined(moduleName, 8)}
        }[${interval}]
      )
      ${getBuildInfoQuery({ indent: 4, interval: buildInfoInterval })}
    ) > 0
  )`.trim();
}

/**
 * Generates the PromQL query for the request rate for an Autometricized
 * function.
 */
export function createFunctionRequestRateQuery({
  functionName,
  moduleName,
  interval = "5m",
  buildInfoInterval,
}: FunctionQuery) {
  return `
  sum by (function, module, version, commit, service_name) (
    rate(
      {
        __name__=~"function_calls(_count)?(_total)?",
        function=~"${functionName}"${addModuleLabelIfDefined(moduleName, 6)}
      }[${interval}]
    )
    ${getBuildInfoQuery({ indent: 2, interval: buildInfoInterval })}
  )`.trim();
}

/**
 * Generates the PromQL query for an Autometrics-defined objective.
 */
export function createObjectiveQuery(
  objective: Objective,
  timeRange: TimeRange,
  scopedFunction?: ScopedFunction,
): string {
  switch (objective.metric) {
    case "latency":
      return createSloQueryLatencyUnderThreshold(
        objective,
        timeRange,
        scopedFunction,
      );

    case "success_rate":
      return createSloQuerySuccessRate(objective, timeRange, scopedFunction);
  }
}

/**
 * Generates the PromQL query to determine how many function call happened in a
 * given time window.
 */
export function createRequestCountQuery({
  functionName,
  moduleName,
  interval,
}: Omit<FunctionQuery, "buildInfoInterval">) {
  // To find out how many function calls happened in a given time window using
  // our counter metric, we can use the `sum()` function along with the
  // `increase()` function.
  //
  // The `increase()` function calculates the rate of increase of a counter
  // metric over the specified time range, and `sum()` then adds up the
  // calculated rates, giving us the total count of invocations.
  return `
sum by (function, module) (
  increase({
    __name__=~"function_calls(_count)?(_total)?", 
    function="${functionName}"${addModuleLabelIfDefined(moduleName, 4)}
  }[${interval}])
)`.trim();
}

export function createSloQueryLatencyUnderThreshold(
  objective: LatencyObjective,
  timeRange: TimeRange,
  function_?: { name: string; module: string },
): string {
  const objectiveName = objective.name;
  // FIXME
  const latencyThreshold = objective.target.threshold;
  const rateInterval = getPrometheusWindowFromTimeRange(timeRange);
  let query = `
(
  sum(
    rate(
      {
        __name__=~"function_calls_duration(_seconds)?_bucket",
        objective_name="${objectiveName}",
        le="${latencyThreshold}"
      }[${rateInterval}]
    )
  ) or on() vector(0)
) / (
    sum(
      rate(
        {
          __name__=~"function_calls_duration(_seconds)?_count",
          objective_name="${objectiveName}"
        }[${rateInterval}]
      )
    ) > 0
  )
`.trim();

  // INVESTIGATE - should this query not include the objective_name?
  // That way we can look at data before the objective was defined...
  if (function_) {
    query = query.replace(
      '__name__=~"function_calls_duration(_seconds)?_bucket",',
      `__name__=~"function_calls_duration(_seconds)?_bucket",\nfunction="${function_.name}",\nmodule="${function_.module}",\n`.trim(),
    );

    query = query.replace(
      `__name__=~"function_calls_duration(_seconds)?_count",`,
      `__name__=~"function_calls_duration(_seconds)?_count",\nfunction="${function_.name}",\nmodule="${function_.module}",\n`.trim(),
    );
  }

  return query;
}

/**
 * Generate a query that will return a list of series, one for each
 * function/module pair and each series will contain the calculated percentage
 * of requests under the objective latency threshold for that function.
 *
 * Intended for use with the SLO Details page.
 *
 * If there were no requests for a given function pair, the series will not
 * contain data for that function.
 */
export function createSloQueryLatencyUnderThresholdByFunction(
  objective: LatencyObjective,
  timeRange: TimeRange,
): string {
  const objectiveName = objective.name;
  // FIXME
  const latencyThreshold = objective.target.threshold;
  const rateInterval = getPrometheusWindowFromTimeRange(timeRange);
  return `
(
  sum by (function, module) (
    rate(
      {
        __name__=~"function_calls_duration(_seconds)?_bucket",
        objective_name="${objectiveName}",
        le="${latencyThreshold}"
      }[${rateInterval}]
    )
  ) or on() vector(0)
) / (
    sum by (function, module) (
      rate(
        {
          __name__=~"function_calls_duration(_seconds)?_count",
          objective_name="${objectiveName}"
        }[${rateInterval}]
      )
    ) > 0
  )
`.trim();
}

export function createSloQuerySuccessRate(
  objective: Objective,
  timeRange: TimeRange,
  function_?: { name: string; module: string },
) {
  const objectiveName = objective.name;
  const rateInterval = getPrometheusWindowFromTimeRange(timeRange);

  if (function_) {
    return `
1 - (
  sum(
    rate(
      {
        __name__=~"function_calls(_count)?(_total)?", 
        objective_name="${objectiveName}",
        result="error",
        function="${function_.name}",
        module="${function_.module}"
      }[${rateInterval}])
    ) or on() vector(0)
  ) / (
    sum(
      rate(
        {
          __name__=~"function_calls(_count)?(_total)?", 
          objective_name="${objectiveName}",
          function="${function_.name}",
          module="${function_.module}"
        }[${rateInterval}]
      )
    ) > 0
  )
    `.trim();
  }

  return `
1 - (
  sum(
    rate(
      {
        __name__=~"function_calls(_count)?(_total)?", 
        objective_name="${objectiveName}", 
        result="error"
      }[${rateInterval}])
    ) or on() vector(0)
  ) / (
    sum(
      rate(
        {
          __name__=~"function_calls(_count)?(_total)?", 
          objective_name="${objectiveName}"
        }[${rateInterval}]
      )
    ) > 0
  )
    `.trim();
}

/**
 * Generates the query for the latency chart (99th and 95th percentile)
 * for a single function.
 */
export function createSloAllFunctionsLatencyQuery(
  objective: LatencyObjective,
  timeRange: TimeRange,
  buildInfoInterval?: string,
) {
  const { name: objectiveName } = objective;
  const {
    target: { percentile: latencyPercentile, threshold: latencyThreshold },
  } = objective;
  const interval = getPrometheusWindowFromTimeRange(timeRange);
  const promQlPercentile =
    translateObjectivePercentileToPromQlPercentile(latencyPercentile);

  return `
label_replace(
  histogram_quantile(
    ${promQlPercentile},
    sum by (le, function, module, commit, version, service_name) (
      rate({
        __name__=~"function_calls_duration(_seconds)?_bucket",
        objective_name="${objectiveName}",
        objective_percentile="${latencyPercentile}",
        objective_latency_threshold="${latencyThreshold}"
      }[${interval}])
      # Attach the version and commit labels from the build_info metric
      ${getBuildInfoQuery({ indent: 6, interval: buildInfoInterval })}
    )
  ),
  # Add the label {percentile_latency="${latencyPercentile}"} to the time series
  "percentile_latency", "${latencyPercentile}", "", ""
)
`.trim();
}

export function createSloAllFunctionsSuccessRateQuery(
  objective: SuccessRateObjective,
  timeRange: TimeRange,
  buildInfoInterval?: string,
) {
  const { name: objectiveName } = objective;
  const {
    target: { percentile },
  } = objective;

  const interval = getPrometheusWindowFromTimeRange(timeRange);

  return `
(
  sum by(function, module, version, commit, service_name) (
    rate(
      {
        __name__=~"function_calls(_count)?(_total)?",
        result="ok", 
        objective_name="${objectiveName}",
        objective_percentile="${percentile}"
      }[${interval}]
    )
    ${getBuildInfoQuery({ indent: 4, interval: buildInfoInterval })}
  )) / (
  sum by(function, module, version, commit, service_name) (
    rate(
      {
        __name__=~"function_calls(_count)?(_total)?",
        objective_name="${objectiveName}",
        objective_percentile="${percentile}"

      }[${interval}]
    )
    ${getBuildInfoQuery({ indent: 4, interval: buildInfoInterval })}
  ) > 0
)`.trim();
}

/**
 * Generates the PromQL query for the top 5 Autometricized functions for a given
 * metric type.
 */
export function createTop5FunctionsQuery(
  metricType: MetricType,
  buildInfoInterval?: string,
): string {
  switch (metricType) {
    case "error_ratio":
      return createTop5FunctionsErrorRatioQuery({ buildInfoInterval });
    case "latency":
      return createTop5FunctionsLatencyQuery({ buildInfoInterval });
    case "request_rate":
      return createTop5FunctionsRequestRateQuery({ buildInfoInterval });
  }
}

/**
 * Generates the PromQL query for the latency chart (99th and 95th percentile)
 * for the top 5 Autometricized functions with the highest latencies.
 */
export function createTop5FunctionsLatencyQuery({
  interval = "5m",
  percentile = 99, // You can specify the desired percentile here
  buildInfoInterval,
}: Top5FunctionQuery & { percentile?: number }) {
  return `
topk(5, label_replace(
  histogram_quantile(
    0.${percentile},
    sum by (le, function, module, commit, version, service_name) (
      rate({
        __name__=~"function_calls_duration(_seconds)?_bucket",
        function=~".*"
      }[${interval}])
      # Attach the version and commit labels from the build_info metric
      ${getBuildInfoQuery({ indent: 6, interval: buildInfoInterval })}
    )
  ),
  # Add the label {percentile_latency="${percentile}"} to the time series
  "percentile_latency", "${percentile}", "", ""
))
`.trim();
}

/**
 * Generates the PromQL query for the error ratio for the top 5 Autometricized
 * functions with the highest error ratios.
 */
export function createTop5FunctionsErrorRatioQuery({
  interval = "5m",
  buildInfoInterval,
}: Top5FunctionQuery) {
  return `
(
  topk(5, sum by(function, module, version, commit, service_name) (
    rate(
      {
        __name__=~"function_calls(_count)?(_total)?",
        result="error", 
        function=~".*"
      }[${interval}]
    )
    ${getBuildInfoQuery({ indent: 4, interval: buildInfoInterval })}
  ))) / ignoring(function) group_left (
  sum by(function, module, version, commit, service_name) (
    rate(
      {
        __name__=~"function_calls(_count)?(_total)?",
        function=~".*"
      }[${interval}]
    )
    ${getBuildInfoQuery({ indent: 4, interval: buildInfoInterval })}
  )
)
> 0
`.trim();
}

/**
 * Generates the PromQL query for the request rates for the top 5 Autometricized
 * functions with the highest request rates.
 */
export function createTop5FunctionsRequestRateQuery({
  interval = "5m",
  buildInfoInterval,
}: Top5FunctionQuery) {
  return `
topk(5, sum by (function, module, version, commit, service_name) (
  rate(
    {
      __name__=~"function_calls(_count)?(_total)?",
      function=~".*"
    }[${interval}]
  )
  ${getBuildInfoQuery({ indent: 2, interval: buildInfoInterval })}
))
`.trim();
}

/**
 * Generates the PromQL query for the known versions in which an Autometricized
 * function was present.
 */
export function createVersionQuery({
  functionName,
  moduleName,
  interval = "5m",
}: FunctionQuery) {
  return `group by (version, commit) (
    last_over_time(
      { 
        __name__=~"function_calls(_count)?(_total)?",
        function="${functionName}"${addModuleLabelIfDefined(moduleName, 8)}
      }[${interval}]
    )* on(instance, job) group_left(version, commit) (
      build_info
    )
  )`;
}

/**
 * Helper function that will add the module label to the query if it is a
 * string. This means if module is the empty string, it will be added as
 * `module=""` to the query's labels.
 */
function addModuleLabelIfDefined(moduleName?: string, padLeft = 0) {
  const padding = " ".repeat(padLeft);
  return typeof moduleName === "string"
    ? `,\n${padding}module="${moduleName}"`
    : "";
}

/**
 * Helper to return the build_info join.
 *
 * Accepts an indentation parameter to allow for pretty pretting the query in
 * the UI.
 *
 * @note - A build info interval that is significantly smaller than the scrape
 *         interval will result in a "dot-dash" pattern in the UI.
 */
function getBuildInfoQuery({
  indent = 0,
  interval = "1s",
}: {
  indent: number;
  interval?: string;
}) {
  return `
  * on (instance, job) group_left(version, commit) (
    last_over_time(build_info[${interval}])
    or on (instance, job) up
  )`
    .trim()
    .split("\n")
    .join(`\n${" ".repeat(indent)}`);
}

export function translateObjectivePercentileToPromQlPercentile(
  percentile: string,
): string {
  const promQlPercentile = Number.parseFloat(percentile) / 100;
  return promQlPercentile.toFixed(3).replace(/0$/, "");
}
