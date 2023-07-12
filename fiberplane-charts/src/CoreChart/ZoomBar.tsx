import { Bar } from "@visx/shape";

import type { InteractiveControlsState } from "./context";

type Props = {
  controlsState: InteractiveControlsState;
  yMax: number;
};

export function ZoomBar({ controlsState, yMax }: Props): JSX.Element | null {
  if (controlsState.type !== "zoom") {
    return null;
  }

  const { start, end } = controlsState;
  if (end === undefined) {
    return null;
  }

  const reverseZoom = end < start;

  return (
    <Bar
      stroke="#4797ff"
      strokeWidth={1}
      fill="#a3cbff"
      fillOpacity="10%"
      x={reverseZoom ? end : start}
      y={0}
      width={reverseZoom ? start - end : end - start}
      height={yMax}
    />
  );
}
