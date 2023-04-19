import { createContext } from "react";

import {
  CoreControls,
  defaultControlsState,
  InteractiveControls,
  InteractiveControlsState,
  useTooltip,
} from "../hooks";

export {
  TimeseriesFocusApiContext,
  TimeseriesFocusValueContext,
  TimeseriesFocusContextProvider,
} from "./TimeseriesFocus";

export type ChartSizeContextValue = {
  width: number;
  height: number;
  xMax: number;
  yMax: number;
};

/**
 * Context for tracking the size of the chart.
 */
export const ChartSizeContext = createContext<ChartSizeContextValue>({
  width: 0,
  height: 0,
  xMax: 0,
  yMax: 0,
});

/**
 * Context that handles the result of useCoreControls hooks
 */
export const CoreControlsContext = createContext<CoreControls>({
  zoom() {},
  move() {},
});

/**
 * One of two parts of the useInteractiveControlState hook results
 *
 * This is the api/functional part
 */
export const InteractiveControlsContext = createContext<InteractiveControls>({
  reset() {},
  startDrag() {},
  startZoom() {},
  updateEndValue() {},
});

/**
 * Holds the interactive control state as returned by the useInteractiveControlState
 */
export const InteractiveControlsStateContext =
  createContext<InteractiveControlsState>(defaultControlsState);

export type TooltipContextValue = Pick<
  ReturnType<typeof useTooltip>,
  "hideTooltip" | "showTooltip"
>;

export const TooltipContext = createContext<TooltipContextValue>({
  showTooltip() {},
  hideTooltip() {},
});
