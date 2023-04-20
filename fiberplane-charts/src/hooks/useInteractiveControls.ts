import { useReducer } from "react";

import { useHandler } from "./useHandler";

export const defaultControlsState: InteractiveControlsState = { type: "none" };

export type InteractiveControls = {
    startZoom(start: number | null): void;
    updateEndValue(end: number): void;
    startDrag(start: number | null): void;
    reset(): void;
};

export type InteractiveControlsState =
    | { type: "none" }
    | { type: "drag"; start: number; end?: number }
    | { type: "zoom"; start: number; end?: number };

type ActionZoomStart = {
    type: "ZOOM_START";
    payload: {
        start: number;
    };
};

type ActionUpdateEndValue = {
    type: "UPDATE_END_VALUE";
    payload: {
        end: number;
    };
};

type ActionDragStart = {
    type: "DRAG_START";
    payload: {
        start: number;
    };
};

type ActionReset = {
    type: "RESET";
};

type Actions =
    | ActionZoomStart
    | ActionUpdateEndValue
    | ActionDragStart
    | ActionReset;

function controlsStateReducer(
    state: InteractiveControlsState,
    action: Actions,
): InteractiveControlsState {
    switch (action.type) {
        case "RESET":
            return defaultControlsState;

        case "DRAG_START":
            return {
                type: "drag",
                start: action.payload.start,
            };

        case "ZOOM_START":
            return {
                type: "zoom",
                start: action.payload.start,
            };

        case "UPDATE_END_VALUE":
            if (state.type === "none") {
                return state;
            }

            return {
                type: state.type,
                start: state.start,
                end: action.payload.end,
            };

        default:
            return state;
    }
}

/**
 * Returns zoom/drag handlers and state.
 */
export function useInteractiveControls(): {
    interactiveControlsState: InteractiveControlsState;
} & InteractiveControls {
    const [interactiveControlsState, dispatch] = useReducer(
        controlsStateReducer,
        defaultControlsState,
    );

    const startZoom = useHandler((start: number) => {
        dispatch({ type: "ZOOM_START", payload: { start } });
    });

    const startDrag = useHandler((start: number) => {
        dispatch({ type: "DRAG_START", payload: { start } });
    });

    const updateEndValue = useHandler((end: number) => {
        dispatch({ type: "UPDATE_END_VALUE", payload: { end } });
    });

    const reset = useHandler(() => {
        dispatch({ type: "RESET" });
    });

    return {
        interactiveControlsState,
        startZoom,
        updateEndValue,
        startDrag,
        reset,
    };
}
