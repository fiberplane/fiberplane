import { Bar } from "@visx/shape";
import { useContext } from "react";

import { ChartSizeContext, InteractiveControlsStateContext } from "../context";

export function ZoomBar(): JSX.Element | null {
  const { yMax } = useContext(ChartSizeContext);
  const controlsState = useContext(InteractiveControlsStateContext);
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
