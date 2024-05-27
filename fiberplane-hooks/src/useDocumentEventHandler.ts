import { useEffect } from "react";

/**
 * The `useDocumentEventHandler` hook allows for handling of document-wide events in a React component.
 * It automatically attaches and cleans up event listeners using the `useEffect` hook.
 *
 * @template TEventType extends keyof GlobalEventHandlersEventMap
 * Type parameter representing the type of the event, constrained to valid types defined in `GlobalEventHandlersEventMap`.
 *
 * @param {TEventType} eventType
 * A single event type for which the event handler will be registered.
 *
 * @param {(event: GlobalEventHandlersEventMap[TEventType]) => void} handler
 * The function that will be called when the event occurs. The event type corresponds to the provided `eventType`.
 *
 * @example
 * useDocumentEventHandler('click', (event) => console.log('Clicked!', event));
 */
export function useDocumentEventHandler<
  TEventType extends keyof GlobalEventHandlersEventMap,
>(
  eventType: TEventType,
  handler: (event: GlobalEventHandlersEventMap[TEventType]) => void,
) {
  useEffect(() => {
    document.addEventListener(eventType, handler);

    return () => {
      document.addEventListener(eventType, handler);
    };
  }, [eventType, handler]);
}
