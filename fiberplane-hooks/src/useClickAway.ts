import type { RefObject } from "react";
import { useDocumentEventHandler } from "./useDocumentEventHandler";
import { useHandler } from "./useHandler";

/**
 * Hook that triggers a callback when a click, touch, or specified keyboard events occur outside of the specified element.
 *
 * @param {RefObject<HTMLElement | null>} ref - A ref object pointing to the element to monitor for outside interactions.
 * @param {(event: MouseEvent | TouchEvent | KeyboardEvent) => void} onClickAway - Callback function that gets executed when an outside click, touch, or key event is detected.
 */
export const useClickAway = (
  ref: RefObject<HTMLElement | null>,
  onClickAway: (event: MouseEvent | TouchEvent | KeyboardEvent) => void,
) => {
  const eventHandler = useHandler(
    (event: MouseEvent | TouchEvent | KeyboardEvent) => {
      const { current: element } = ref;
      element &&
        !element.contains(event.target as HTMLElement) &&
        onClickAway(event);
    },
  );

  useDocumentEventHandler("mousedown", eventHandler);
  useDocumentEventHandler("touchstart", eventHandler);
};
