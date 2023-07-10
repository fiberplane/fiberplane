import { useMemo, useReducer } from "react";

import {
  defaultControlsState,
  InteractiveControlsApi,
  InteractiveControlsState,
} from "../context";

/**
 * Returns zoom/drag handlers and state.
 */
export function useInteractiveControls(): {
  interactiveControls: InteractiveControlsApi;
  interactiveControlsState: InteractiveControlsState;
} {
  const [interactiveControlsState, dispatch] = useReducer(
    controlsStateReducer,
    defaultControlsState,
  );

  const interactiveControls = useMemo(
    () => ({
      reset() {
        dispatch({ type: "RESET" });
      },

      startDrag(start: number) {
        dispatch({ type: "DRAG_START", payload: { start } });
      },

      startZoom(start: number) {
        dispatch({ type: "ZOOM_START", payload: { start } });
      },

      updateEndValue(end: number) {
        dispatch({ type: "UPDATE_END_VALUE", payload: { end } });
      },
    }),
    [],
  );

  return { interactiveControls, interactiveControlsState };
}

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
