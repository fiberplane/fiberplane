import { useContext, useEffect, useId, useMemo } from "react";

import { ChartContent } from "./ChartContent";
import { ChartSizeContext } from "./ChartSizeContext";
import { GridWithAxes } from "./GridWithAxes";
import { ZoomBar } from "./ZoomBar";
import { CHART_SHAPE_OVERFLOW_MARGIN } from "./constants";
import {
  type InteractiveControlsState,
  useInteractiveControls,
  useMouseControls,
  useScales,
  useTooltip,
} from "./hooks";
import type { CoreChartProps } from "./types";

export function CoreChart<S, P>({
  areaGradientShown = true,
  chart,
  getShapeListColor,
  onChangeTimeRange,
  readOnly = false,
  shapeStrokeWidth = 1,
  showTooltip,
  timeRange,
  numXTicks = 12,
  numYTicks = 8,
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

  const tickFormatters = useMemo(() => {
    return typeof props.tickFormatters === "function"
      ? props.tickFormatters(chart.xAxis, chart.yAxis)
      : props.tickFormatters;
  }, [chart, props.tickFormatters]);

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
    // biome-ignore lint/a11y/noSvgWithoutTitle: title would interfere with tooltip
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
        <GridWithAxes
          {...props}
          chart={chart}
          numXTicks={numXTicks}
          numYTicks={numYTicks}
          scales={scales}
          tickFormatters={tickFormatters}
        />
        <g clipPath={`url(#${clipPathId})`}>
          <ChartContent
            {...props}
            areaGradientShown={areaGradientShown}
            chart={chart}
            getShapeListColor={getShapeListColor}
            strokeWidth={shapeStrokeWidth}
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

export function getCursorFromState(state: InteractiveControlsState): string {
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
