import { useContext, useEffect, useId } from "react";

import { ChartContent } from "./ChartContent";
import { ChartSizeContext } from "./ChartSizeContext";
import type { CoreChartProps } from "./types";
import { GridWithAxes } from "./GridWithAxes";
import {
  InteractiveControlsState,
  useInteractiveControls,
  useMouseControls,
  useScales,
  useTooltip,
} from "./hooks";
import { ZoomBar } from "./ZoomBar";
import { CHART_SHAPE_OVERFLOW_MARGIN } from "./constants";

export function CoreChart<S, P>({
  chart,
  getShapeListColor,
  gridShown = true,
  onChangeTimeRange,
  readOnly = false,
  showTooltip,
  timeRange,
  ...props
}: CoreChartProps<S, P>): JSX.Element {
  const interactiveControls = useInteractiveControls(readOnly);
  const { mouseInteraction, updatePressedKeys } = interactiveControls;

  const { width, height, xMax, yMax, marginTop, marginLeft } =
    useContext(ChartSizeContext);
  const dimensions = { xMax, yMax };

  const {
    onMouseDown,
    onMouseUp,
    onWheel,
    onMouseMove: onMouseMoveControls,
  } = useMouseControls({
    dimensions,
    interactiveControls,
    onChangeTimeRange,
    timeRange,
  });

  const {
    graphTooltip,
    onMouseMove: onMouseMoveTooltip,
    onMouseLeave,
  } = useTooltip({
    chart,
    dimensions,
    getShapeListColor,
    showTooltip: modifierPressed(interactiveControls) ? undefined : showTooltip,
  });

  const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    updatePressedKeys(event);
    onMouseMoveControls(event);
    onMouseMoveTooltip(event);
  };

  const clipPathId = useId();

  const cursor = getCursorFromState(interactiveControls);

  const scales = useScales(dimensions, mouseInteraction);

  useEffect(() => {
    const wheelListenerOptions: AddEventListenerOptions = { passive: false };
    window.addEventListener("keydown", updatePressedKeys);
    window.addEventListener("keyup", updatePressedKeys);
    window.addEventListener("wheel", onWheel, wheelListenerOptions);
    return () => {
      window.removeEventListener("keydown", updatePressedKeys);
      window.removeEventListener("keyup", updatePressedKeys);
      window.removeEventListener("wheel", onWheel, wheelListenerOptions);
    };
  }, [onWheel, updatePressedKeys]);

  const clipPathYStart = -1 * CHART_SHAPE_OVERFLOW_MARGIN;
  const clipPathHeight = yMax + 2 * CHART_SHAPE_OVERFLOW_MARGIN;
  // HACK - For spark charts, the clip path can be larger than the chart itself,
  //        which leads to points getting cut off
  const svgHeight = height > clipPathHeight ? height : clipPathHeight;

  return (
    // rome-ignore lint/a11y/noSvgWithoutTitle: title would interfere with tooltip
    <svg
      width={width}
      height={svgHeight}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{ cursor, marginTop: 2 }}
    >
      <defs>
        <clipPath id={clipPathId}>
          <rect x={0} y={clipPathYStart} width={xMax} height={clipPathHeight} />
        </clipPath>
      </defs>
      <g transform={`translate(${marginLeft}, ${marginTop})`}>
        {gridShown && <GridWithAxes {...props} chart={chart} scales={scales} />}
        <g clipPath={`url(#${clipPathId})`}>
          <ChartContent
            {...props}
            chart={chart}
            getShapeListColor={getShapeListColor}
            scales={scales}
          />
        </g>
        <ZoomBar dimensions={dimensions} mouseInteraction={mouseInteraction} />
      </g>
      {graphTooltip && (
        <g>
          <line
            x1={graphTooltip.left}
            y1={0}
            x2={graphTooltip.left}
            y2={yMax}
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

function modifierPressed(state: InteractiveControlsState): boolean {
  return state.dragKeyPressed || state.zoomKeyPressed;
}

function getCursorFromState(state: InteractiveControlsState): string {
  switch (state.mouseInteraction.type) {
    case "none":
      if (state.dragKeyPressed) {
        return "grab";
      }

      if (state.zoomKeyPressed) {
        return "zoom-in";
      }

      return "default";
    case "drag":
      return "grabbing";
    case "zoom":
      return "zoom-in";
  }
}
