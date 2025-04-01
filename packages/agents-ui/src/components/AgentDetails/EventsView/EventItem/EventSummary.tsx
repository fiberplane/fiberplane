import { Method } from "@/components/Method";
import { ExpandableJSONViewer } from "../JSONViewer";
import type { AgentEventType, EventPayload } from "@/hooks";
import type { ReactNode } from "react";
import { ChatMessagesSchema, MessagePayloadSchema } from "@/types";
import type { AgentEvent, CombinedEvent } from "@/store";
import { StatusCode } from "@/components/StatusCode";

// Define a more specific type for HTTP request payloads
interface HttpRequestPayload {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  [key: string]: unknown;
}

interface HttpResponsePayload {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  [key: string]: unknown;
}

// Helper function to format the URL for display
const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.pathname}${urlObj.search}`;
  } catch (e) {
    return url;
  }
};



// HTTP Request details component
const HttpRequestDetails = ({ payload }: { payload: HttpRequestPayload }) => {
  const { method = "GET", url = "", headers = {} } = payload;
  const displayUrl = typeof url === "string" ? formatUrl(url) : "";

  return (
    <div className="mt-1 text-sm grid-cols-[auto_1fr] grid gap-2">
      <Method method={method} />{" "}
      <span className="font-mono text-muted-foreground">{displayUrl}</span>
      {!!payload.body && typeof payload.body === "object" && (
        <ExpandableJSONViewer
          data={payload.body as Record<string, unknown>}
          label="Request Body"
        />
      )}
    </div>
  );
};

// HTTP Request details component
const HttpResponseDetails = ({ payload }: { payload: HttpResponsePayload }) => {
  const { status, headers } = payload;
  return (
    <div className="mt-1 text-sm grid-cols-[auto_1fr] flex items-center gap-2">
      <StatusCode status={status} isFailure={false} />
      {!!headers && (
        <ExpandableJSONViewer
          data={headers}
          label="Response Headers"
          className="text-muted-foreground"
        />
      )}
    </div>
  );
};

// WebSocket message details component
const WebSocketDetails = ({
  type,
  payload,
}: { type: AgentEventType; payload: EventPayload }) => {
  let message: ReactNode = "WebSocket event";

  if (type === "ws_open") {
    message = "WebSocket connection opened";
  } else if (type === "ws_close") {
    message = "WebSocket connection closed";
  } else if (type === "ws_message") {
    message = "WebSocket message received";
  } else if (type === "ws_send") {
    message = "WebSocket message sent";
  } else if (type === "broadcast") {
    try {
      // const parsed = "message" in payload && payload.JSON.parse(payload.message);
      const { message: messageProp } = MessagePayloadSchema.parse(payload);
      if (
        messageProp &&
        typeof messageProp === "object" &&
        "type" in messageProp
      ) {
        // console.log('messageProp', messageProp)
        const chatMessageValidation = ChatMessagesSchema.safeParse(messageProp);
        console.log('chatMessageValidation', chatMessageValidation.success, chatMessageValidation.error);
        if (chatMessageValidation.success) {
          const chatMessage = chatMessageValidation.data;
          message = `Chat messages (${chatMessage.messages.length} total)`;
        } else {
          message = `${messageProp.type}`;
        }
      }
      // parsed
    } catch {
      // swallow error
      message = "Broadcast message sent";
    }
  }

  return <div className="mt-1 text-sm text-muted-foreground">{message}</div>;
};

// State change details component
const StateChangeDetails = ({ payload }: { payload: EventPayload }) => {
  return <div className="mt-1 text-sm">Agent state updated</div>;
};

// Stream event details component
const StreamEventDetails = ({
  type,
  payload,
}: { type: AgentEventType; payload: EventPayload }) => {
  let message = "Stream event";

  if (type === "stream_open") {
    message = "Stream opened";
  } else if (type === "stream_close") {
    message = "Stream closed";
  } else if (type === "stream_error") {
    const errorMessage =
      typeof payload === "string"
        ? payload
        : (payload.message as string) || JSON.stringify(payload);

    return (
      <div className="mt-1 p-2 bg-destructive/10 rounded-md border border-destructive text-destructive">
        {errorMessage}
      </div>
    );
  }

  return <div className="mt-1 text-sm">{message}</div>;
};


// Main event summary component that selects the appropriate details component
export const EventSummary = ({
  type,
  payload,
}: Pick<AgentEvent, "type" | "payload">) => {
  if (type === "http_request") {
    return <HttpRequestDetails payload={payload as HttpRequestPayload} />;
  }
  if (type === "http_response") {
    return <HttpResponseDetails payload={payload as HttpResponsePayload} />;
  }

  if (
    type === "ws_message" ||
    type === "ws_open" ||
    type === "ws_close" ||
    type === "broadcast" ||
    type === "ws_send"
  ) {
    return <WebSocketDetails type={type} payload={payload} />;
  }

  if (type === "state_change") {
    return <StateChangeDetails payload={payload} />;
  }

  if (
    type === "stream_open" ||
    type === "stream_close" ||
    type === "stream_error"
  ) {
    return <StreamEventDetails type={type} payload={payload} />;
  }

  if (type === "combined_event") {
    const { chunks, done } = payload as CombinedEvent["payload"];
    const message = done
      ? `Combined event (${chunks.length} parts)`
      : "Broadcast (events) in progress";
    return (
      <div className="mt-1 text-sm text-muted-foreground flex flex-col gap-1">
        {message}
      </div>
    );
  }

  // Fallback for any other event types
  return <div className="mt-1 text-sm">Event received ({type})</div>;
};
