import type { MinMax } from "../types";

/**
 * Extends the given min-max, if necessary, with the given value.
 *
 * @note This function mutates its input min-max.
 */
export function extendMinMax(minMax: MinMax, value: number): MinMax {
  if (value < minMax[0]) {
    minMax[0] = value;
  } else if (value > minMax[1]) {
    minMax[1] = value;
  }

  return minMax;
}
