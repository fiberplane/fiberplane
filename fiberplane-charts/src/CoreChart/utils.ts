import type { ChartCoordinates, Dimensions, Scale } from "./types";
import { MARGINS } from "./constants";

export type Range = [from: number, to: number];

/**
 * Creates a linear scale function for the given range.
 *
 * Assumes a domain of `[0.0..1.0]` as used for our abstract chart coordinates.
 */
export function createLinearScaleForRange([from, to]: Range): Scale {
  return (value) => from + value * (to - from);
}

export function getCoordinatesForEvent(
  event: React.MouseEvent<SVGElement> | WheelEvent,
  { xMax, yMax }: Dimensions,
): ChartCoordinates | null {
  const svg = getTarget(event);
  if (!svg) {
    return null;
  }

  const rect = svg.getBoundingClientRect();

  const x = event.clientX - rect.left - MARGINS.left;
  const y = event.clientY - rect.top - MARGINS.top;
  if (x < 0 || x > xMax || y < 0 || y > yMax) {
    return null;
  }

  return { x: x / xMax, y: 1 - y / yMax };
}

/**
 * Finds the root `<svg>` element we use as target. Most event listeners are
 * directly attached to it, but some may be attached elsewhere and we need to
 * travel from the `event.target` to find it.
 */
function getTarget(
  event: React.MouseEvent<SVGElement> | WheelEvent,
): SVGSVGElement | null {
  if (event.currentTarget instanceof SVGSVGElement) {
    return event.currentTarget;
  }

  let target = event.target as HTMLElement | SVGElement | null;
  while (target) {
    if (target instanceof SVGSVGElement) {
      return target;
    }

    target = target.parentElement;
  }

  return null;
}
