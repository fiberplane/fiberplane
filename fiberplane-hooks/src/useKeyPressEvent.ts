import { useDocumentEventHandler } from "./useDocumentEventHandler";
import { useHandler } from "./useHandler";

/**
 * Hook adding a key press event listener to the document.
 * @param key
 * @param handler
 */
export function useKeyPressEvent(
  key: string,
  handler: (event: KeyboardEvent) => void,
) {
  const onKeyDown = useHandler((event: KeyboardEvent) => {
    if (event.key === key) {
      handler(event);
    }
  });

  useDocumentEventHandler("keydown", onKeyDown);
}
