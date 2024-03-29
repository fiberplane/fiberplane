import type { MouseInteractionState } from "./hooks";
import type { Dimensions } from "./types";

type Props = {
  dimensions: Dimensions;
  mouseInteraction: MouseInteractionState;
};

export function ZoomBar({
  dimensions: { xMax, yMax },
  mouseInteraction,
}: Props): JSX.Element | null {
  if (mouseInteraction.type !== "zoom") {
    return null;
  }

  const { start, end } = mouseInteraction;
  if (end === undefined) {
    return null;
  }

  const reverseZoom = end < start;

  return (
    <rect
      stroke="#4797ff"
      fill="#a3cbff"
      fillOpacity="10%"
      x={(reverseZoom ? end : start) * xMax}
      y={0}
      width={(reverseZoom ? start - end : end - start) * xMax}
      height={yMax}
    />
  );
}
