import { localPoint } from "@visx/event";

import { MARGINS } from "../constants";
import type { TimeScale, ValueScale } from "../MetricsChart/scales";

export function toClosestPointArgs(args: {
  event: React.MouseEvent<SVGElement>;
  xScale: TimeScale;
  yScale: ValueScale;
  /**
   * Determine square boundaries within which to search for the closest point.
   *
   * The square side is 2 * EPS pixels.
   *
   * By default the value of 20 is used
   */
  EPS?: number;
}) {
  const { event, xScale, yScale, EPS = 20 } = args;
  const { x: x0, y: y0 } = localPoint(event) || {
    x: 0,
    y: 0,
  };

  const xRange = getBoundary({
    value: x0 - MARGINS.left,
    // Decrease the EPS value slightly
    EPS,
    scale: xScale,
  });

  const yRange = getBoundary({
    value: y0 - MARGINS.top,
    EPS,
    scale: yScale,
  });

  return {
    xRange,
    yRange,
  };
}

export type Boundary = {
  value: number;
  high: number;
  low: number;
};

type GetBoundaryArgs = {
  value: number;
  EPS: number;
  scale: TimeScale | ValueScale;
};

export function getBoundary({ value, EPS, scale }: GetBoundaryArgs): Boundary {
  const low = scale.invert(value - EPS).valueOf();
  const high = scale.invert(value + EPS).valueOf();

  return {
    value: scale.invert(value).valueOf(),
    low: Math.min(low, high),
    high: Math.max(low, high),
  };
}

export type ClosestPointArgs = {
  xRange: Boundary;
  yRange: Boundary;
};

export function insideRange(value: number, range: Boundary): boolean {
  return range.low < value && value < range.high;
}
