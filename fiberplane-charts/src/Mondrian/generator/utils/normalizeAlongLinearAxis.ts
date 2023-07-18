import type { Axis } from "../../types";

/**
 * Takes an absolute value and normalizes it to a value between 0.0 and 1.0 for
 * the given axis.
 */
export function normalizeAlongLinearAxis(value: number, axis: Axis): number {
  return (value - axis.minValue) / (axis.maxValue - axis.minValue);
}
