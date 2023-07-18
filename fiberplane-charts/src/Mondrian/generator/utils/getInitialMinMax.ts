import type { MinMax } from "../types";

/**
 * Returns the initial min-max based on a single value.
 */
export function getInitialMinMax(value: number): MinMax {
  return [value, value];
}
