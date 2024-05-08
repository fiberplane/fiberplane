import { type RefObject, useEffect, useRef } from "react";
import { useDocumentEventHandler } from "./useDocumentEventHandler";
import { useHandler } from "./useHandler";

export const useClickAway = (
  ref: RefObject<HTMLElement | null>,
  onClickAway: (event: MouseEvent | TouchEvent | KeyboardEvent) => void,
) => {
  const savedCallback = useRef(onClickAway);

  useEffect(() => {
    savedCallback.current = onClickAway;
  }, [onClickAway]);

  const eventHandler = useHandler(
    (event: MouseEvent | TouchEvent | KeyboardEvent) => {
      const { current: element } = ref;
      element &&
        !element.contains(event.target as HTMLElement) &&
        savedCallback.current(event);
    },
  );

  useDocumentEventHandler(["mousedown", "touchstart"], eventHandler);
};
