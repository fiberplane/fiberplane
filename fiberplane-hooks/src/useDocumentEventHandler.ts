import { useEffect } from "react";

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
