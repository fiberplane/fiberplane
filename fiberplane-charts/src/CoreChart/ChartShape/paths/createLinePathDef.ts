import type { CoordinateFactory } from "./types";
import { toFactory } from "./utils";

/**
 * Set of factories for producing X and Y coordinates for a line path.
 */
export type LinePathCoordinateFactories<P> = {
  x: number | CoordinateFactory<P>;
  y: number | CoordinateFactory<P>;
};

/**
 * Creates the SVG path definition for a line shape.
 *
 * @param data The data points for the line.
 * @param coordinates The factories and/or constants to produce the coordinates
 *                    from each data point.
 *
 * See also: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
 */
export function createLinePathDef<P>(
  data: Array<P>,
  coordinates: LinePathCoordinateFactories<P>,
): string {
  const len = data.length;
  if (len === 0) {
    return "";
  }

  const x = toFactory(coordinates.x);
  const y = toFactory(coordinates.y);

  const start = data[0];
  let path = `M${x(start).toFixed(1)},${y(start).toFixed(1)}`;

  // Draw a line along the data points.
  for (let i = 1; i < len; ++i) {
    const next = data[i];
    path += `L${x(next).toFixed(1)},${y(next).toFixed(1)}`;
  }

  return path;
}
