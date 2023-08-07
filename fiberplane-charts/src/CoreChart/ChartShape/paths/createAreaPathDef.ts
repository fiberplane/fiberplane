import type { CoordinateFactory } from "./types";
import { toFactory } from "./utils";

/**
 * Set of factories for producing X and Y coordinates for an area shape.
 *
 * The restriction for an area path is that every data point must produce two
 * coordinates for the Y axis, and one coordinate for the X axis.
 */
export type AreaPathCoordinateFactories<P> = {
  x: number | CoordinateFactory<P>;
  y0: number | CoordinateFactory<P>;
  y1: number | CoordinateFactory<P>;
};

/**
 * Creates the SVG path definition for an area shape.
 *
 * @param data The data points for the area.
 * @param coordinates The factories and/or constants to produce the coordinates
 *                    from each data point.
 *
 * See also: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
 */
export function createAreaPathDef<P>(
  data: Array<P>,
  coordinates: AreaPathCoordinateFactories<P>,
): string {
  const len = data.length;
  if (len === 0) {
    return "";
  }

  const x = toFactory(coordinates.x);
  const y0 = toFactory(coordinates.y0);
  const y1 = toFactory(coordinates.y1);

  const start = data[0];
  let path = `M${x(start).toFixed(1)},${y0(start).toFixed(1)}`;

  // Draw a line along the y0 coordinates.
  for (let i = 1; i < len; ++i) {
    const next = data[i];
    path += `L${x(next).toFixed(1)},${y0(next).toFixed(1)}`;
  }

  // Draw a line backwards along the y1 coordinates.
  for (let i = len - 1; i >= 0; --i) {
    const previous = data[i];
    path += `L${x(previous).toFixed(1)},${y1(previous).toFixed(1)}`;
  }

  // Done.
  path += "Z";
  return path;
}
