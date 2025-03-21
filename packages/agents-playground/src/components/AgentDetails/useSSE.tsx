import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

export const AgentEventTypeSchema = z.enum([
  "stream_open",
  "stream_error",
  "stream_close",
  "http_request",
  "ws_open",
  "ws_close",
  "ws_message",
  "state_change",
]);

export type AgentEventType = z.infer<typeof AgentEventTypeSchema>;

type SSEStatus = "connecting" | "open" | "closed" | "error";

interface UseSSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  withCredentials?: boolean;
  initialStatus?: SSEStatus;
  eventTypes?: AgentEventType[];
  maxEvents?: number;
  filterAdminEndpoints?: boolean;
}

type UseSSEResult<T> = {
  status: SSEStatus;
  data: T[];
  lastEvent: T | null;
  close: () => void;
  clearEvents: () => void;
};

export function useSSE<T = unknown>(
  url: string,
  options: UseSSEOptions = {},
): UseSSEResult<T> {
  const [status, setStatus] = useState<SSEStatus>(
    options.initialStatus || "connecting",
  );
  const [events, setEvents] = useState<T[]>([]);
  const [lastEvent, setLastEvent] = useState<T | null>(null);

  // Use refs to store mutable values that shouldn't trigger re-renders
  const eventSourceRef = useRef<EventSource | null>(null);
  const optionsRef = useRef(options);
  const handlerMapRef = useRef<Map<string, (event: MessageEvent) => void>>(
    new Map(),
  );

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Function to clear all collected events
  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  // Helper function to check if an event should be filtered out
  const shouldFilterEvent = useCallback(
    (eventType: AgentEventType, parsedData: unknown): boolean => {
      // Only apply filtering if filterAdminEndpoints is true
      if (!optionsRef.current.filterAdminEndpoints) {
        console.log("Filtering disabled, showing all events");
        return false;
      }
      console.log("Filtering enabled, checking event:", {
        eventType,
        data: parsedData,
      });

      // Always filter all stream_open events
      if (eventType === "stream_open") {
        console.log("Filtering out stream_open event", {
          eventType,
          data: parsedData,
        });
        return true;
      }

      // Check if this is an http_request event
      if (eventType !== "http_request") {
        return false;
      }

      // Check if the URL contains admin/db or admin/events
      if (
        typeof parsedData === "object" &&
        parsedData !== null &&
        "url" in parsedData &&
        parsedData.url
      ) {
        try {
          const urlString = parsedData.url.toString();
          return (
            urlString.includes("/admin/db") ||
            urlString.includes("/admin/events")
          );
        } catch (e) {
          // If there's an error parsing the URL, don't filter
          return false;
        }
      }

      return false;
    },
    [],
  );

  // This function processes incoming events
  const processEvent = useCallback(
    (event: MessageEvent) => {
      console.log("Processing event:", event.type, event.data);
      try {
        // The event type is the same as the event name in SSE
        const eventType = event.type as AgentEventType;

        // Parse the data
        const parsedData = JSON.parse(event.data);

        // Skip admin endpoint events if filtering is enabled
        if (shouldFilterEvent(eventType, parsedData)) {
          console.log("Event filtered out:", eventType);
          // Don't process this event
          return;
        }

        console.log("Event accepted:", eventType);

        // Create event with metadata
        const eventWithMeta = {
          type: eventType,
          timestamp: new Date().toISOString(),
          payload: parsedData,
        } as unknown as T;

        setLastEvent(eventWithMeta);
        setEvents((prevEvents) => {
          const maxEvents = optionsRef.current.maxEvents || 100;
          const newEvents = [...prevEvents, eventWithMeta];
          return newEvents.slice(-maxEvents); // Keep only the latest maxEvents
        });
      } catch (error) {
        // Handle non-JSON data
        const eventWithMeta = {
          type: event.type as AgentEventType,
          timestamp: new Date().toISOString(),
          payload: event.data,
        } as unknown as T;

        setLastEvent(eventWithMeta);
        setEvents((prevEvents) => {
          const maxEvents = optionsRef.current.maxEvents || 100;
          const newEvents = [...prevEvents, eventWithMeta];
          return newEvents.slice(-maxEvents); // Keep only the latest maxEvents
        });
      }

      optionsRef.current.onMessage?.(event);
    },
    [shouldFilterEvent],
  );

  // Function to close the connection
  const close = useCallback(() => {
    const es = eventSourceRef.current;
    if (!es) {
      return;
    }

    // Clean up event listeners
    for (const [eventType, handler] of handlerMapRef.current.entries()) {
      es.removeEventListener(eventType, handler);
    }
    handlerMapRef.current.clear();

    es.close();
    eventSourceRef.current = null;
    setStatus("closed");
  }, []);

  // Setup and cleanup effect
  useEffect(() => {
    // If there's already a connection, clean it up first
    close();

    // Create a new EventSource connection
    const eventSource = new EventSource(url, {
      withCredentials: optionsRef.current.withCredentials,
    });
    eventSourceRef.current = eventSource;

    // Set up handlers
    eventSource.onopen = () => {
      setStatus("open");
      optionsRef.current.onOpen?.();
    };

    eventSource.onerror = (error: Event) => {
      setStatus("error");
      optionsRef.current.onError?.(error);
    };

    // Add event listeners
    const eventTypes = optionsRef.current.eventTypes || [];
    for (const eventType of eventTypes) {
      const handler = (event: MessageEvent) => processEvent(event);
      eventSource.addEventListener(eventType, handler);
      handlerMapRef.current.set(eventType, handler);
    }

    // Cleanup on unmount or when url changes
    return close;
  }, [url, close, processEvent]);

  return { status, data: events, lastEvent, close, clearEvents };
}
