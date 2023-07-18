import { useMemo, useReducer } from "react";

import { identity, isMac } from "../../utils";

type PressedKeyEvent = KeyboardEvent | React.MouseEvent;

export type InteractiveControls = {
  resetMouseInteraction(): void;
  startDrag(start: number): void;
  startZoom(start: number): void;
  updateEndValue(end: number): void;
  updatePressedKeys(event: PressedKeyEvent): void;
};

export type InteractiveControlsState = {
  mouseInteraction: MouseInteractionState;
  dragKeyPressed: boolean;
  zoomKeyPressed: boolean;
};

export type MouseInteractionState =
  | { type: "none" }
  | { type: "drag"; start: number; end?: number }
  | { type: "zoom"; start: number; end?: number };

const defaultState: InteractiveControlsState = {
  mouseInteraction: { type: "none" },
  dragKeyPressed: false,
  zoomKeyPressed: false,
};

/**
 * Returns zoom/drag handlers and state.
 */
export function useInteractiveControls(
  readOnly: boolean,
): InteractiveControls & InteractiveControlsState {
  const [state, dispatch] = useReducer(
    readOnly ? identity : controlsStateReducer,
    defaultState,
  );

  const controls = useMemo(() => createControls(dispatch), []);

  return { ...controls, ...state };
}

type ActionDragStart = {
  type: "DRAG_START";
  payload: { start: number };
};

type ActionReset = {
  type: "RESET_MOUSE_INTERACTION";
};

type ActionUpdateEndValue = {
  type: "UPDATE_END_VALUE";
  payload: { end: number };
};

type ActionUpdatePressedKeys = {
  type: "UPDATE_PRESSED_KEYS";
  payload: {
    dragKeyPressed?: boolean;
    zoomKeyPressed?: boolean;
  };
};

type ActionZoomStart = {
  type: "ZOOM_START";
  payload: { start: number };
};

type Actions =
  | ActionDragStart
  | ActionReset
  | ActionUpdateEndValue
  | ActionUpdatePressedKeys
  | ActionZoomStart;

function createControls(
  dispatch: React.Dispatch<Actions>,
): InteractiveControls {
  return {
    resetMouseInteraction() {
      dispatch({ type: "RESET_MOUSE_INTERACTION" });
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

    updatePressedKeys(event: PressedKeyEvent) {
      dispatch({
        type: "UPDATE_PRESSED_KEYS",
        payload: {
          dragKeyPressed: dragKeyPressed(event),
          zoomKeyPressed: zoomKeyPressed(event),
        },
      });
    },
  };
}

function controlsStateReducer(
  state: InteractiveControlsState,
  action: Actions,
): InteractiveControlsState {
  switch (action.type) {
    case "DRAG_START":
      return {
        ...state,
        mouseInteraction: { type: "drag", start: action.payload.start },
      };

    case "RESET_MOUSE_INTERACTION":
      return { ...state, mouseInteraction: defaultState.mouseInteraction };

    case "UPDATE_END_VALUE":
      if (state.mouseInteraction.type === "none") {
        return state;
      }

      return {
        ...state,
        mouseInteraction: {
          ...state.mouseInteraction,
          end: action.payload.end,
        },
      };

    case "UPDATE_PRESSED_KEYS":
      return { ...state, ...action.payload };

    case "ZOOM_START":
      return {
        ...state,
        mouseInteraction: { type: "zoom", start: action.payload.start },
      };

    default:
      return state;
  }
}

function dragKeyPressed(event: PressedKeyEvent) {
  return event.shiftKey;
}

function zoomKeyPressed(event: PressedKeyEvent) {
  return isMac ? event.metaKey : event.ctrlKey;
}
