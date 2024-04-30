import { useRef, useState } from "react";
import { useKeyPressEvent } from "react-use";
import { useClickAway } from "react-use";
import { useHandler } from "./useHandler";

/**
 * Allows for easy open/close behavior that will close when:
 * - a user presses escape
 * - clicks outside of the modalRef
 */
export function useOpen(
  containerRef: React.MutableRefObject<HTMLElement | null>,
) {
  const [opened, setOpened] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const hide = useHandler((event: KeyboardEvent | MouseEvent) => {
    // Avoid closing if the user clicks on the container.
    if (
      event.type === "mousedown" &&
      event.target instanceof HTMLElement &&
      containerRef.current?.contains(event.target)
    ) {
      return;
    }

    setOpened(false);
  });

  useClickAway(modalRef, hide);
  useKeyPressEvent("Escape", hide);

  return {
    opened,
    setOpened,
    modalRef,
  };
}
