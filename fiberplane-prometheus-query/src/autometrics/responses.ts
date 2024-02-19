import type { AutometricsFunction } from "../providerTypes";
import { sortBy } from "../utils";
import {
  AmSeriesWithLatencyObjective,
  AmSeriesWithSuccessObjective,
  LatencyObjective,
  Objective,
  SuccessRateObjective,
} from "./types";

export function filterUniqueFunctions(
  functions: Array<AutometricsFunction>,
): Array<AutometricsFunction> {
  const uniqueFunctions: Array<AutometricsFunction> = [];

  for (const fn of functions) {
    const isDuplicate = uniqueFunctions.some(
      (other) =>
        other.function === fn.function &&
        other.module === fn.module &&
        other.serviceName === fn.serviceName,
    );

    if (!isDuplicate) {
      uniqueFunctions.push(fn);
    }
  }

  return uniqueFunctions;
}

function getLatencyObjectiveKey({
  objective_name,
  objective_percentile,
  objective_latency_threshold,
}: AmSeriesWithLatencyObjective): string {
  return `${objective_name}:latency:${objective_percentile}:${objective_latency_threshold}`;
}

export function getLatencyObjectiveFromSeries(
  series: Array<AmSeriesWithLatencyObjective>,
): Array<LatencyObjective> {
  const objectivesByKey: Record<string, LatencyObjective> = {};

  for (const currentSeries of series) {
    const key = getLatencyObjectiveKey(currentSeries);

    const objective = objectivesByKey[key];
    if (objective) {
      objective.series.push(currentSeries);
    } else {
      objectivesByKey[key] = {
        series: [currentSeries],
        name: currentSeries.objective_name,
        functions: [],
        metric: "latency",
        target: {
          percentile: currentSeries.objective_percentile,
          threshold: currentSeries.objective_latency_threshold,
        },
      };
    }
  }

  return transformObjectiveMetadata(objectivesByKey);
}

function getSuccessObjectiveKey({
  objective_name,
  objective_percentile,
}: AmSeriesWithSuccessObjective): string {
  return `${objective_name}:successRate:${objective_percentile}`;
}

export function getSuccessObjectiveFromSeries(
  series: Array<AmSeriesWithSuccessObjective>,
): Array<SuccessRateObjective> {
  const objectivesByKey: Record<string, SuccessRateObjective> = {};

  for (const currentSeries of series) {
    const key = getSuccessObjectiveKey(currentSeries);

    const objective = objectivesByKey[key];
    if (objective) {
      objective.series.push(currentSeries);
    } else {
      objectivesByKey[key] = {
        series: [currentSeries],
        name: currentSeries.objective_name,
        functions: [],
        metric: "success_rate",
        target: {
          percentile: currentSeries.objective_percentile,
        },
      };
    }
  }

  return transformObjectiveMetadata(objectivesByKey);
}

/**
 * Helper function for the final step of transforming objective metadata.
 */
function transformObjectiveMetadata<T extends Objective>(
  objectivesByKey: Record<string, T>,
): Array<T> {
  const objectives = Object.values(objectivesByKey);

  // NOTE - If you modify your objectives, old labels will also show up.
  //        We need some form of conflict resolution :grimace:
  for (const objective of objectives) {
    // First, find all functions associated with this SLO.
    // TODO - Should we check against the latest build? To make sure we're not
    //        using old functions that are no longer part of the SLO?
    objective.functions = filterUniqueFunctions(
      objective.series.map((entry) => ({
        function: entry.function,
        module: entry.module,
        serviceName: entry.service_name,
      })),
    );
    sortBy(objective.functions, (objective) => objective.function);
    objective.functionsCount = objective.functions.length;
  }

  return objectives;
}
