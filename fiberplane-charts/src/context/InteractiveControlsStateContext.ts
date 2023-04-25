import { createContext } from "react";

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
