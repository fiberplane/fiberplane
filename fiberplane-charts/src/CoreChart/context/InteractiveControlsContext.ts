import { createContext } from "react";

export type InteractiveControlsApi = {
  reset(): void;
  startDrag(start: number | null): void;
  startZoom(start: number | null): void;
  updateEndValue(end: number): void;
};

export type InteractiveControlsState =
  | { type: "none" }
  | { type: "drag"; start: number; end?: number }
  | { type: "zoom"; start: number; end?: number };

export const defaultControlsState: InteractiveControlsState = { type: "none" };

/**
 * Holds the interactive control state as returned by the useInteractiveControlState
 */
export const InteractiveControlsStateContext =
  createContext<InteractiveControlsState>(defaultControlsState);

/**
 * One of two parts of the useInteractiveControlState hook results
 *
 * This is the api/functional part
 */
export const InteractiveControlsApiContext =
  createContext<InteractiveControlsApi>({
    reset() {},
    startDrag() {},
    startZoom() {},
    updateEndValue() {},
  });
