import { useMemo } from "react";

import type { Dimensions, Scales } from "../types";
import { type Range, createLinearScaleForRange } from "../utils";
import type { MouseInteractionState } from "./useInteractiveControls";

/**
 * Returns the scales to use for rendering SVG components.
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
  return useMemo(
    () => ({
      xMax,
      yMax,
      xScale: createLinearScaleForRange(
        translatedRange(xMax, mouseInteraction),
      ),
      yScale: createLinearScaleForRange([yMax, 0]),
    }),
    [mouseInteraction, xMax, yMax],
  );
}

function translatedRange(
  xMax: number,
  mouseInteraction: MouseInteractionState,
): Range {
  if (mouseInteraction.type === "drag") {
    const { start, end } = mouseInteraction;
    if (end !== undefined && start !== end) {
      const delta = (end - start) * xMax;
      return [delta, xMax + delta];
    }
  }

  return [0, xMax];
}
