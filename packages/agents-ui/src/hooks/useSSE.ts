import { usePlaygroundStore } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useHandler } from "./useHandler";

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

// Generic event payload type
export interface EventPayload {
  [key: string]: unknown;
}

export interface AgentEvent {
  type: AgentEventType;
  id: string;
  timestamp: string;
  payload: EventPayload;
}

export type SSEStatus = "connecting" | "open" | "closed" | "error";

// Base interface for SSE options
interface BaseSSEOptions {
  withCredentials?: boolean;
  initialStatus?: SSEStatus;
  eventTypes?: AgentEventType[];
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

// Interface for the low-level hook
interface UseSSEConnectionOptions extends BaseSSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onConnectionStatus?: (status: SSEStatus) => void;
}

// Interface for the high-level hook with events collection
interface UseSSEWithEventsOptions extends BaseSSEOptions {
  maxEvents?: number;
  filterAdminEndpoints?: boolean;
}

// Return type for the low-level connection hook
type UseSSEConnectionResult = {
  close: () => void;
};

// Return type for the high-level hook with events collection
type UseSSEWithEventsResult<T> = {
  status: SSEStatus;
  data: T[];
  lastEvent: T | null;
  close: () => void;
  clearEvents: () => void;
};

/**
 * A low-level hook that handles SSE connection management
 *
 * @param url The SSE endpoint URL
 * @param options Configuration options for the SSE connection
 * @returns Control functions for the SSE connection
 */
export function useSSEConnection(
  url: string,
  options: UseSSEConnectionOptions = {},
): UseSSEConnectionResult {
  // Use refs to store mutable values that shouldn't trigger re-renders
  const eventSourceRef = useRef<EventSource | null>(null);
  const optionsRef = useRef(options);
  const handlerMapRef = useRef<Map<string, (event: MessageEvent) => void>>(
    new Map(),
  );
  const currentStatusRef = useRef<SSEStatus>(
    options.initialStatus || "connecting",
  );

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Function to update connection status
  const updateStatus = useCallback((newStatus: SSEStatus) => {
    currentStatusRef.current = newStatus;
    optionsRef.current.onConnectionStatus?.(newStatus);
  }, []);

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
    updateStatus("closed");
  }, [updateStatus]);

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
      updateStatus("open");
      optionsRef.current.onOpen?.();
    };

    eventSource.onerror = (error: Event) => {
      updateStatus("error");
      optionsRef.current.onError?.(error);
    };

    // Add event listeners
    const eventTypes = optionsRef.current.eventTypes || [];
    for (const eventType of eventTypes) {
      const handler = (event: MessageEvent) => {
        optionsRef.current.onMessage?.(event);
      };
      eventSource.addEventListener(eventType, handler);
      handlerMapRef.current.set(eventType, handler);
    }

    // Cleanup on unmount or when url changes
    return close;
  }, [url, close, updateStatus]);

  // Set initial status on first render
  useEffect(() => {
    updateStatus(currentStatusRef.current);
  }, [updateStatus]);

  return { close };
}

/**
 * A higher-level hook that builds on useSSEConnection to provide event collection functionality
 *
 * @param url The SSE endpoint URL
 * @param options Configuration options for the SSE connection and event collection
 * @returns Connection status, collected events, and control functions
 */
export function useSSEWithEvents<T = unknown>(
  url: string,
  options: UseSSEWithEventsOptions = {},
): UseSSEWithEventsResult<T> {
  const [events, setEvents] = useState<T[]>([]);
  const [lastEvent, setLastEvent] = useState<T | null>(null);
  const [status, setStatus] = useState<SSEStatus>(
    options.initialStatus || "connecting",
  );

  // Keep a reference to the options
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Helper function to check if an event should be filtered out
  const shouldFilterEvent = useCallback(
    (eventType: AgentEventType, parsedData: unknown): boolean => {
      // Only apply filtering if filterAdminEndpoints is true
      if (!optionsRef.current.filterAdminEndpoints) {
        return false;
      }

      // Always filter all stream_open events
      if (eventType === "stream_open") {
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

  // Function to process incoming SSE events
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        // The event type is the same as the event name in SSE
        const eventType = event.type as AgentEventType;

        // Parse the data
        const parsedData = JSON.parse(event.data);

        // Skip admin endpoint events if filtering is enabled
        if (shouldFilterEvent(eventType, parsedData)) {
          // Don't process this event
          return;
        }

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
    },
    [shouldFilterEvent],
  );

  // Function to clear all collected events
  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  // Use the low-level SSE connection hook
  const { close } = useSSEConnection(url, {
    ...options,
    onMessage: handleMessage,
    onConnectionStatus: setStatus,
  });

  return {
    status,
    data: events,
    lastEvent,
    close,
    clearEvents,
  };
}

/**
 * Legacy hook that provides the same API as the original useSSE hook
 * @deprecated Use useSSEWithEvents instead
 */
export function useSSE<T = unknown>(
  url: string,
  options: UseSSEWithEventsOptions = {},
): UseSSEWithEventsResult<T> {
  return useSSEWithEvents<T>(url, options);
}

const baseOptions: UseSSEWithEventsOptions = {
  eventTypes: [
    "http_request",
    "state_change",
    "ws_open",
    "ws_message",
    "ws_close",
    "stream_close",
    "stream_error",
  ],
  // maxEvents: 100, // Limit to latest 100 events
  // filterAdminEndpoints: true, // Filter out admin/db and admin/events endpoints
};

export function useAgentInstanceEvents(agent: string, instance: string) {
  const addAgentInstanceEvent = usePlaygroundStore(
    (state) => state.addAgentInstanceEvent,
  );

  const setAgentInstanceStreamStatus = usePlaygroundStore(
    (state) => state.setAgentInstanceStreamStatus,
  );

  const options: UseSSEConnectionOptions = {
    ...baseOptions,
    onMessage: (event) => {
      const data = JSON.parse(event.data);

      const valid = AgentEventTypeSchema.safeParse(event.type);
      if (!valid.success) {
        return;
      }

      addAgentInstanceEvent(agent, instance, {
        type: valid.data,
        id: generateId(),
        timestamp: new Date().toISOString(),
        payload: data,
      });
    },
    onConnectionStatus: (status) => {
      setAgentInstanceStreamStatus(agent, instance, status);
    },
  };

  useSSEConnection(`/agents/${agent}/${instance}/admin/events`, options);
}

let id = 0;
function generateId() {
  return (id++).toString();
}
