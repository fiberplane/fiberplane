import type { ScaleLinear } from "d3-scale";
import { scaleLinear } from "@visx/scale";
import { useMemo } from "react";

export type Scale = ScaleLinear<number, number>;

export type Scales = {
  xMax: number;
  xScale: Scale;
  yMax: number;
  yScale: Scale;
};

/**
 * Returns the scales to use for rendering VisX components.
 *
 * Fortunately for us, our abstract charts are normalized along both axes to
 * values from 0.0 to 1.0, meaning we can suffice with trivial linear scales.
 */
export function useScales(xMax: number, yMax: number): Scales {
  return useMemo(() => {
    const xScale = scaleLinear({
      range: [0, xMax],
      round: false,
      nice: false,
      domain: [0, 1],
    });

    const yScale = scaleLinear({
      range: [yMax, 0],
      round: false,
      nice: false,
      domain: [0, 1],
    });

    return { xMax, xScale, yMax, yScale };
  }, [xMax, yMax]);
}
