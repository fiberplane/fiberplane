import { useState, useEffect, useRef, useCallback } from "react";

type SSEStatus = "connecting" | "open" | "closed" | "error";

interface UseSSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  withCredentials?: boolean;
  initialStatus?: SSEStatus;
}

type UseSSEResult<T> = {
  status: SSEStatus;
  data: T | null;
  close: () => void;
};

export function useSSE<T = unknown>(
  url: string,
  options: UseSSEOptions = {},
): UseSSEResult<T> {
  const [status, setStatus] = useState<SSEStatus>(
    options.initialStatus || "connecting",
  );
  const [data, setData] = useState<T | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const close = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setStatus("closed");
    }
  }, []);

  useEffect(() => {
    // close();
    if (eventSourceRef.current) {
      return;
    }
    // Create a new EventSource connection
    const eventSource = new EventSource(url, {
      withCredentials: options.withCredentials,
    });
    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      setStatus("open");
      options.onOpen?.();
    };
    eventSource.addEventListener('message', console.log)
    // Handle incoming messages
    // eventSource.onmessage = (event: MessageEvent) => {
    //   console.log('on message', event.data);
    //   try {
    //     const parsedData = JSON.parse(event.data);
    //     setData(parsedData);
    //   } catch (e) {
    //     // Handle non-JSON data
    //     setData(event.data);
    //   }
    //   options.onMessage?.(event);
    // };

    // Handle errors
    eventSource.onerror = (error: Event) => {
      setStatus("error");
      options.onError?.(error);

      // According to EventSource spec, when an error occurs,
      // the browser automatically tries to reconnect
      // If we want to prevent this, we need to close the connection
      // close();
    };

    // Clean up on unmount or when URL changes
    return () => {
      close();
    };
  }, [
    url,
    options.withCredentials,
    close,
    options.onMessage,
    options.onError,
    options.onOpen,
  ]);

  return { status, data, close, eventSourceRef };
}
