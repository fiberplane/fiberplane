import type { Dimensions } from "../types";
import { getCoordinatesForEvent } from "../utils";
import type {
  InteractiveControls,
  InteractiveControlsState,
} from "./useInteractiveControls";
import {
  preventDefault,
  secondsToTimestamp,
  timestampToSeconds,
} from "../../utils";
import type { TimeRange, Timestamp } from "../../providerTypes";

const MIN_DURATION = 60; // in seconds

type MouseControls = {
  onMouseDown: React.MouseEventHandler<SVGElement>;
  onMouseMove: React.MouseEventHandler<SVGElement>;
  onMouseUp: React.MouseEventHandler<SVGElement>;
  onWheel: (event: WheelEvent) => void;
};

type Props = {
  interactiveControls: InteractiveControls & InteractiveControlsState;
  timeRange: TimeRange;
  onChangeTimeRange?: (timeRange: TimeRange) => void;
  dimensions: Dimensions;
};

/**
 * Hook for setting up mouse handlers to control dragging & zoom
 */
export function useMouseControls({
  interactiveControls: {
    dragKeyPressed,
    zoomKeyPressed,
    mouseInteraction,
    resetMouseInteraction,
    startDrag,
    startZoom,
    updateEndValue,
  },
  timeRange,
  onChangeTimeRange,
  dimensions,
}: Props): MouseControls {
  function onMouseDown(event: React.MouseEvent<SVGElement>) {
    if (event.buttons !== 1 || !onChangeTimeRange) {
      return;
    }

    preventDefault(event);

    const coords = getCoordinatesForEvent(event, dimensions);
    if (!coords) {
      return;
    }

    if (dragKeyPressed) {
      startDrag(coords.x);
    } else if (zoomKeyPressed) {
      startZoom(coords.x);
    }
  }

  function onMouseMove(event: React.MouseEvent<SVGElement>) {
    preventDefault(event);

    if (mouseInteraction.type === "none") {
      return;
    }

    if (
      (mouseInteraction.type === "drag" && !dragKeyPressed) ||
      (mouseInteraction.type === "zoom" && !zoomKeyPressed)
    ) {
      resetMouseInteraction();
      return;
    }

    const coords = getCoordinatesForEvent(event, dimensions);
    if (coords) {
      updateEndValue(coords.x);
    }
  }

  function onMouseUp(event: React.MouseEvent) {
    if (event.button !== 0) {
      return;
    }

    preventDefault(event);

    if (mouseInteraction.type === "zoom") {
      const { start, end } = mouseInteraction;
      if (end !== undefined && start !== end) {
        onChangeTimeRange?.({
          from: coordinateToTimestamp(timeRange, Math.min(start, end)),
          to: coordinateToTimestamp(timeRange, Math.max(start, end)),
        });
      }

      resetMouseInteraction();
    } else if (mouseInteraction.type === "drag") {
      const { start, end } = mouseInteraction;
      if (end !== undefined && start !== end) {
        move(start - end);
      }

      resetMouseInteraction();
    }
  }

  function onWheel(event: WheelEvent) {
    if (mouseInteraction.type !== "none" || !zoomKeyPressed) {
      return;
    }

    const coords = getCoordinatesForEvent(event, dimensions);
    if (!coords) {
      return;
    }

    preventDefault(event);

    const factor = event.deltaY < 0 ? 0.5 : 2;
    zoom(factor, coords.x);
  }

  /**
   * Moves the time scale.
   *
   * @param deltaRatio The delta to move as a ratio of the current time scale
   *                   window. -1 moves a full window to the left, and 1 moves
   *                   a full window to the right.
   */
  function move(deltaRatio: number) {
    const currentFrom = timestampToSeconds(timeRange.from);
    const currentTo = timestampToSeconds(timeRange.to);
    const delta = deltaRatio * (currentTo - currentFrom);
    const from = secondsToTimestamp(currentFrom + delta);
    const to = secondsToTimestamp(currentTo + delta);

    onChangeTimeRange?.({ from, to });
  }

  /**
   * Zooms into or out from the graph.
   *
   * @param factor The zoom factor. Anything below 1 makes the time scale
   *               smaller (zooming in), and anything above 1 makes the time
   *               scale larger (zooming out).
   * @param focusRatio The horizontal point on which to focus the zoom,
   *                   expressed as a ratio from 0 (left-hand side of the graph)
   *                   to 1 (right-hand side of the graph).
   */
  function zoom(factor: number, focusRatio = 0.5) {
    const currentFrom = timestampToSeconds(timeRange.from);
    const currentTo = timestampToSeconds(timeRange.to);
    const duration = currentTo - currentFrom;
    const focusTimestamp = currentFrom + focusRatio * duration;
    const newDuration = Math.max(duration * factor, MIN_DURATION);
    const from = secondsToTimestamp(focusTimestamp - newDuration * focusRatio);
    const to = secondsToTimestamp(
      focusTimestamp + newDuration * (1 - focusRatio),
    );

    onChangeTimeRange?.({ from, to });
  }

  return { onMouseDown, onMouseMove, onMouseUp, onWheel };
}

function coordinateToTimestamp(timeRange: TimeRange, x: number): Timestamp {
  const from = timestampToSeconds(timeRange.from);
  const to = timestampToSeconds(timeRange.to);

  return secondsToTimestamp(from + x * (to - from));
}
