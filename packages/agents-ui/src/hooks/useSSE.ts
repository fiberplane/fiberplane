import { usePlaygroundStore } from "@/store";
import { type AgentEventType, agentEventSchema } from "@/types";
import { useCallback, useEffect, useRef } from "react";

export type SSEStatus = "connecting" | "open" | "closed" | "error";

// Base interface for SSE options
interface BaseSSEOptions {
  withCredentials?: boolean;
  initialStatus?: SSEStatus;
  eventTypes?: AgentEventType[];
  /**
   * Whether to automatically connect when the component mounts
   * @default true
   * @type {boolean}
   */
  autoConnect?: boolean;
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
  connect: () => void;
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

  const connect = useCallback(() => {
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
  }, [url, updateStatus, close]);

  // Setup and cleanup effect
  useEffect(() => {
    // Only connect if autoConnect is not disabled
    if (options.autoConnect === false) {
      return;
    }

    // Connect to the SSE endpoint
    connect();
    // Cleanup on unmount or when url changes
    return close;
  }, [close, connect, options.autoConnect]);

  // Set initial status on first render
  useEffect(() => {
    updateStatus(currentStatusRef.current);
  }, [updateStatus]);

  return { close, connect };
}

const baseOptions: UseSSEWithEventsOptions = {
  eventTypes: [
    "http_request",
    "http_response",
    "state_change",
    "ws_open",
    "ws_message",
    "ws_close",
    "stream_close",
    "stream_error",
    "ws_send",
    "broadcast",
  ],
};

export function useAgentInstanceEvents(namespace: string, instance: string) {
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

      const valid = agentEventSchema.safeParse({
        type: event.type,
        payload: data,
      });
      if (!valid.success) {
        console.error("invalid event", valid.error);
        return;
      }

      const id = generateId();
      addAgentInstanceEvent(namespace, instance, {
        ...valid.data,
        // type: valid.data,
        id,
        timestamp: new Date().toISOString(),
        // payload: data,
      });
    },
    onConnectionStatus: (status) => {
      setAgentInstanceStreamStatus(namespace, instance, status);
    },
    autoConnect: false,
  };

  const { connect } = useSSEConnection(
    `/agents/${namespace}/${instance}/admin/events`,
    options,
  );
  const connectionStatus = usePlaygroundStore(
    (state) =>
      state.agentsState[namespace]?.instances[instance]?.eventStreamStatus,
  );

  useEffect(() => {
    if (connectionStatus === "connecting") {
      connect();
    }
  }, [connect, connectionStatus]);
}

let id = 0;
function generateId() {
  return (id++).toString();
}
