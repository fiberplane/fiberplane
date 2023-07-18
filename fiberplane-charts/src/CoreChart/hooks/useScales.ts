import { scaleLinear } from "@visx/scale";
import { useMemo } from "react";

import type { Dimensions, Scales } from "../types";
import type { MouseInteractionState } from "./useInteractiveControls";

/**
 * Returns the scales to use for rendering VisX components.
 *
 * Fortunately for us, our abstract charts are normalized along both axes to
 * values from 0.0 to 1.0, meaning we can suffice with trivial linear scales.
 *
 * If the chart is being dragged with the mouse, translation along the X axis
 * is applied.
 */
export function useScales(
  { xMax, yMax }: Dimensions,
  mouseInteraction: MouseInteractionState,
): Scales {
  // rome-ignore lint/nursery/useHookAtTopLevel: https://github.com/rome/tools/issues/4483
  return useMemo(() => {
    const xScale = scaleLinear({
      range: translatedRange(xMax, mouseInteraction),
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
  }, [mouseInteraction, xMax, yMax]);
}

function translatedRange(
  xMax: number,
  mouseInteraction: MouseInteractionState,
): [min: number, max: number] {
  if (mouseInteraction.type === "drag") {
    const { start, end } = mouseInteraction;
    if (end !== undefined && start !== end) {
      const delta = (end - start) * xMax;
      return [delta, xMax + delta];
    }
  }

  return [0, xMax];
}
