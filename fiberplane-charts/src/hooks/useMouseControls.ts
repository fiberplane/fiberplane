import { localPoint } from "@visx/event";
import { MouseEvent, MouseEventHandler, Ref, useContext, useRef } from "react";

import {
  ChartSizeContext,
  CoreControlsContext,
  InteractiveControlsContext,
  InteractiveControlsStateContext,
} from "../context";
import {
  isMac,
  preventDefault,
  secondsToTimestamp,
  timestampToSeconds,
} from "../utils";
import { MARGINS } from "../constants";
import type { TimeRange } from "../types";

function zoomKeyPressed(event: MouseEvent | WheelEvent) {
  return isMac ? event.metaKey : event.ctrlKey;
}

/**
 * Hook for setting up mouse handlers to control dragging & zoom
 */
export function useMouseControls({
  timeRange,
  onChangeTimeRange,
}: {
  timeRange: TimeRange;
  onChangeTimeRange?: (timeRange: TimeRange) => void;
}): {
  onMouseDown: MouseEventHandler<HTMLElement>;
  onMouseMove: MouseEventHandler<HTMLElement>;
  onMouseUp: MouseEventHandler<HTMLElement>;
  onMouseEnter: MouseEventHandler<HTMLElement>;
  graphContentRef: Ref<SVGGElement>;
} {
  const { move, zoom } = useContext(CoreControlsContext);
  const { startDrag, startZoom, reset, updateEndValue } = useContext(
    InteractiveControlsContext,
  );
  const controlsState = useContext(InteractiveControlsStateContext);
  const { xMax, yMax } = useContext(ChartSizeContext);
  const graphContentRef = useRef<SVGGElement | null>(null);

  const onMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (event.buttons !== 1 || !onChangeTimeRange) {
      return;
    }

    preventDefault(event);

    if (!graphContentRef.current) {
      return;
    }

    const point = localPoint(graphContentRef.current, event);
    if (!point) {
      return;
    }

    let { x, y } = point;
    x -= MARGINS.left;
    y -= MARGINS.top;

    if (x >= 0 && x <= xMax && y >= 0 && y <= yMax) {
      if (zoomKeyPressed(event)) {
        startZoom(x);
      } else if (event.shiftKey) {
        startDrag(x);
      }
    }
  };

  const onMouseMove = (event: MouseEvent<HTMLElement>) => {
    preventDefault(event);

    if (controlsState.type === "none") {
      return;
    }

    if (
      (controlsState.type === "drag" && !event.shiftKey) ||
      (controlsState.type === "zoom" && !zoomKeyPressed(event))
    ) {
      reset();
      return;
    }

    if (!graphContentRef.current) {
      return;
    }

    const point = localPoint(graphContentRef.current, event);
    if (!point) {
      return;
    }

    let { x, y } = point;
    x -= MARGINS.left;
    y -= MARGINS.top;

    if (x >= 0 && x <= xMax && y >= 0 && y <= yMax) {
      updateEndValue(x);
    }
  };

  const onMouseUp = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }

    preventDefault(event);

    if (controlsState.type === "none") {
      return;
    }

    if (controlsState.type === "zoom") {
      const { start, end } = controlsState;
      if (end !== undefined && start !== end) {
        const positionToSeconds = (x: number) =>
          timestampToSeconds(timeRange.from) +
          (x / xMax) *
            (timestampToSeconds(timeRange.to) -
              timestampToSeconds(timeRange.from));
        const positionToTimestamp = (x: number) =>
          secondsToTimestamp(positionToSeconds(x));

        const from = positionToTimestamp(Math.min(start, end));
        const to = positionToTimestamp(Math.max(start, end));

        onChangeTimeRange?.({ from, to });
      }
    } else if (controlsState.type === "drag") {
      const { start, end } = controlsState;
      if (end !== undefined && start !== end) {
        move((start - end) / xMax);
      }
    }

    reset();
  };

  const onWheel = (event: WheelEvent) => {
    if (controlsState.type !== "none" || !zoomKeyPressed(event)) {
      return;
    }

    startZoom(null);

    const graphContent = graphContentRef.current;
    if (!graphContent) {
      return;
    }

    const rect = graphContent.getClientRects()[0];
    const x = event.pageX - (rect?.left ?? 0);
    if (x < 0 || x > xMax) {
      return;
    }

    preventDefault(event);

    const factor = event.deltaY < 0 ? 0.5 : 2;
    const focusRatio = x / xMax;
    zoom(factor, focusRatio);
  };

  const onMouseEnter = (event: MouseEvent<HTMLElement>) => {
    const { currentTarget } = event;
    currentTarget.addEventListener("wheel", onWheel);
    currentTarget.addEventListener("mouseleave", () => {
      currentTarget.removeEventListener("wheel", onWheel);
    });
  };

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseEnter,
    graphContentRef,
  };
}
