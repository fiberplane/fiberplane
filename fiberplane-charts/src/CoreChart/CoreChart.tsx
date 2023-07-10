import { Bar, Line } from "@visx/shape";
import { Group } from "@visx/group";
import styled from "styled-components";
import { useContext, useId, useState } from "react";

import { ChartContent } from "./ChartContent";
import {
  ChartSizeContext,
  InteractiveControlsState,
  InteractiveControlsStateContext,
} from "./context";
import type { CoreChartProps } from "./types";
import { Container } from "../BaseComponents";
import { GridWithAxes } from "./GridWithAxes";
import { useMouseControls, useScales, useTooltip } from "./hooks";
import { ZoomBar } from "./ZoomBar";

type Props<S, P> = CoreChartProps<S, P> &
  Required<Pick<CoreChartProps<S, P>, "colors">> & {
    gridShown?: boolean;
  };

export function CoreChart<S, P>({
  chart,
  gridShown = true,
  readOnly = false,
  ...props
}: Props<S, P>): JSX.Element {
  const interactiveControlsState = useContext(InteractiveControlsStateContext);

  const [shiftKeyPressed, setShiftKeyPressed] = useState(false);

  const onKeyHandler = (event: React.KeyboardEvent) => {
    setShiftKeyPressed(event.shiftKey);
  };

  const {
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseMove: onMouseMoveControls,
    graphContentRef,
  } = useMouseControls(props);

  const {
    graphTooltip,
    onMouseMove: onMouseMoveTooltip,
    onMouseLeave,
  } = useTooltip(props.showTooltip);

  const onMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    setShiftKeyPressed(event.shiftKey);
    onMouseMoveControls(event);
    onMouseMoveTooltip(event);
  };

  const clipPathId = useId();

  const cursor = getCursorFromState(interactiveControlsState, shiftKeyPressed);

  const { width, height, xMax, yMax, marginTop, marginLeft } =
    useContext(ChartSizeContext);

  const scales = useScales(xMax, yMax);

  return (
    <StyledContainer
      onKeyDown={onKeyHandler}
      onKeyUp={onKeyHandler}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <svg width={width} height={height} style={{ cursor }}>
        <title>{readOnly ? "Chart" : "Interactive chart"}</title>
        <defs>
          <clipPath id={clipPathId}>
            <rect x={0} y={0} width={xMax} height={yMax} />
          </clipPath>
        </defs>
        <Group left={marginLeft} top={marginTop}>
          {gridShown && (
            <GridWithAxes
              gridColumnsShown={props.gridColumnsShown}
              gridRowsShown={props.gridRowsShown}
              gridBordersShown={props.gridBordersShown}
              gridDashArray={props.gridDashArray}
              gridStrokeColor={props.gridStrokeColor}
              scales={scales}
            />
          )}
          <Group innerRef={graphContentRef} clipPath={`url(#${clipPathId})`}>
            <ChartContent
              chart={chart}
              colors={props.colors}
              focusedShapeList={props.focusedShapeList}
              scales={scales}
            />
          </Group>
          <ZoomBar />
        </Group>
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
    </StyledContainer>
  );
}

const StyledContainer = styled(Container)`
  margin-top: 2px;
`;

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
