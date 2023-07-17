import { Line } from "@visx/shape";
import { useContext, useId, useState } from "react";

import { ChartContent } from "./ChartContent";
import {
  ChartSizeContext,
  InteractiveControlsState,
  InteractiveControlsStateContext,
} from "./context";
import type { CoreChartProps } from "./types";
import { GridWithAxes } from "./GridWithAxes";
import { useMouseControls, useScales, useTooltip } from "./hooks";
import { ZoomBar } from "./ZoomBar";

type Props<S, P> = CoreChartProps<S, P> &
  Required<Pick<CoreChartProps<S, P>, "colors">> & {
    gridShown?: boolean;
  };

export function CoreChart<S, P>({
  chart,
  colors,
  gridShown = true,
  onChangeTimeRange,
  readOnly = false,
  showTooltip,
  timeRange,
  ...props
}: Props<S, P>): JSX.Element {
  const interactiveControlsState = useContext(InteractiveControlsStateContext);

  const [shiftKeyPressed, setShiftKeyPressed] = useState(false);

  const onKeyHandler = (event: React.KeyboardEvent) => {
    setShiftKeyPressed(event.shiftKey);
  };

  const { width, height, xMax, yMax, marginTop, marginLeft } =
    useContext(ChartSizeContext);

  const {
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseMove: onMouseMoveControls,
    graphContentRef,
  } = useMouseControls({ onChangeTimeRange, timeRange, xMax, yMax });

  const {
    graphTooltip,
    onMouseMove: onMouseMoveTooltip,
    onMouseLeave,
  } = useTooltip({ showTooltip, chart, colors, xMax, yMax });

  const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    setShiftKeyPressed(event.shiftKey);
    onMouseMoveControls(event);
    onMouseMoveTooltip(event);
  };

  const clipPathId = useId();

  const cursor = getCursorFromState(interactiveControlsState, shiftKeyPressed);

  const scales = useScales(xMax, yMax);

  return (
    // rome-ignore lint/a11y/noSvgWithoutTitle: title would interfere with tooltip
    <svg
      width={width}
      height={height}
      onKeyDown={onKeyHandler}
      onKeyUp={onKeyHandler}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor, marginTop: 2 }}
    >
      <defs>
        <clipPath id={clipPathId}>
          <rect x={0} y={0} width={xMax} height={yMax} />
        </clipPath>
      </defs>
      <g transform={`translate(${marginLeft}, ${marginTop})`}>
        {gridShown && <GridWithAxes {...props} scales={scales} />}
        <g clipPath={`url(#${clipPathId})`} ref={graphContentRef}>
          <ChartContent
            {...props}
            chart={chart}
            colors={colors}
            scales={scales}
          />
        </g>
        <ZoomBar controlsState={interactiveControlsState} yMax={yMax} />
      </g>
      {graphTooltip && (
        <g>
          <Line
            from={{ x: graphTooltip.left, y: 0 }}
            to={{ x: graphTooltip.left, y: yMax }}
            stroke={graphTooltip.color}
            strokeWidth={1}
            pointerEvents="none"
            strokeDasharray="1 1"
          />
          <circle
            cx={graphTooltip.left}
            cy={graphTooltip.top}
            r={4}
            fill={graphTooltip.color}
            pointerEvents="none"
          />
        </g>
      )}
    </svg>
  );
}

function getCursorFromState(
  interactiveControlsState: InteractiveControlsState,
  shiftKey: boolean,
): string {
  switch (interactiveControlsState.type) {
    case "none":
      return shiftKey ? "grab" : "default";
    case "drag":
      return interactiveControlsState.start === null ? "grab" : "grabbing";
    case "zoom":
      return "zoom-in";
  }
}
