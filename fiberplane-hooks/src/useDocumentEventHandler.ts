import { useEffect } from "react";

/**
 * The `useDocumentEventHandler` hook allows for handling of document-wide events in a React component.
 * It automatically attaches and cleans up event listeners using the `useEffect` hook.
 *
 * @template TEventType extends keyof GlobalEventHandlersEventMap
 * Type parameter representing the type of the event, constrained to valid types defined in `GlobalEventHandlersEventMap`.
 *
 * @param {TEventType | Array<TEventType>} eventType
 * A single event type or an array of event types for which the event handler will be registered.
 *
 * @param {(event: GlobalEventHandlersEventMap[TEventType]) => void} handler
 * The function that will be called when the event occurs. The event type corresponds to the provided `eventType`.
 *
 * @example
 * // Single event usage
 * useDocumentEventHandler('click', (event) => console.log('Clicked!', event));
 *
 * @example
 * // Multiple events usage
 * useDocumentEventHandler(['mousedown', 'mouseup'], (event) => console.log(`Event: ${event.type}`, event));
 */
export function useDocumentEventHandler<
  TEventType extends keyof GlobalEventHandlersEventMap,
>(
  eventType: TEventType | Array<TEventType>,
  handler: (event: GlobalEventHandlersEventMap[TEventType]) => void,
) {
  useEffect(() => {
    const attachedEvents = Array.isArray(eventType) ? eventType : [eventType];

    for (const eventType of attachedEvents) {
      document.addEventListener(eventType, handler);
    }

    return () => {
      for (const eventType of attachedEvents) {
        document.addEventListener(eventType, handler);
      }
    };
  }, [eventType, handler]);
}
