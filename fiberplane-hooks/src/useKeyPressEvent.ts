import { useEffect } from "react";

export function useKeyPressEvent(
  key: string,
  handler: (event: KeyboardEvent) => void,
) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        handler(event);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [key, handler]);
}
