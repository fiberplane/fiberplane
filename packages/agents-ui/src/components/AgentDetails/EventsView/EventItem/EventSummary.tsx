import { Method } from "@/components/Method";
import { StatusCode } from "@/components/StatusCode";
import type { AgentEventType, EventPayload } from "@/hooks";
import type { AgentEvent, CombinedEvent } from "@/store";
import {
  type HttpRequestPayload,
  type HttpResponsePayload,
  MessagePayloadSchema,
  outgoingMessageSchema,
} from "@/types";
import { incomingMessageSchema } from "@/types";
import { ExpandableJSONViewer } from "../JSONViewer";

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
  const { method = "GET", url = "" } = payload;
  const displayUrl = typeof url === "string" ? formatUrl(url) : "";

  return (
    <div className="text-sm grid-cols-[auto_1fr] grid gap-2">
      <Method method={method} />
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
  const { status, url, method } = payload;
  const displayUrl = typeof url === "string" ? formatUrl(url) : "";
  return (
    <div className="text-sm grid-cols-[auto_1fr] flex items-center gap-2">
      <StatusCode status={status} isFailure={false} />
      <Method method={method} />
      <span className="font-mono text-muted-foreground">{displayUrl}</span>
    </div>
  );
};

function createMessage({
  type,
  payload,
}: { type: AgentEventType; payload: EventPayload }) {
  // console.log("type", type, payload);
  switch (type) {
    case "http_request":
      return "HTTP request sent";
    case "http_response":
      return "HTTP response received";
    case "state_change":
      return "Agent state updated";
    case "stream_open":
      return "Stream opened";
    case "stream_close":
      return "Stream closed";
    case "stream_error":
      return "Stream error";
    case "broadcast": {
      try {
        return extractOutgoingMessage(payload);
      } catch {
        // swallow error
        return "Broadcast message sent";
      }
    }
    case "ws_open":
      return "WebSocket connected";
    case "ws_close":
      return "WebSocket disconnected";
    case "ws_message": {
      try {
        return extractIncomingMessage(payload);
      } catch {
        // swallow error
      }
      return "WebSocket message";
    }
    default: {
      return "WebSocket event";
    }
  }
}

function extractIncomingMessage(payload: EventPayload) {
  const { message: messageProp } = MessagePayloadSchema.parse(payload);
  if (messageProp && typeof messageProp === "object" && "type" in messageProp) {
    const validated = incomingMessageSchema.safeParse(messageProp);
    if (validated.success) {
      if (validated.data.type === "cf_agent_chat_clear") {
        return "Clear chat";
      }
      if (validated.data.type === "cf_agent_chat_messages") {
        const chatMessage = validated.data;
        return `Receiving messages (${chatMessage.messages.length} total)`;
      }
      if (validated.data.type === "cf_agent_use_chat_request") {
        const chatMessage = validated.data;
        if (chatMessage.url === "/api/chat") {
          const body = chatMessage.init.body;
          const parsedBody = JSON.parse(body);
          return (
            <div className="flex gap-2">
              “{parsedBody.messages[parsedBody.messages.length - 1].content}”
            </div>
          );
        }
        console.log(
          "what? not the right url",
          chatMessage.url,
          "not",
          chatMessage.url === "/api/chat",
        );
        // console.log('chatMessage', chatMessage);
        return (
          <div className="flex gap-2">
            {chatMessage.init.method && (
              <Method method={chatMessage.init.method} />
            )}
            {chatMessage.url && (
              <span className="font-mono text-muted-foreground">
                {formatUrl(chatMessage.url)}
              </span>
            )}
          </div>
        );
        // return `Chat response (${chatMessage.body.length} total)`;
      }
    }

    // console.log('not valid', { error: validated.error, messageProp });
    return `${messageProp.type}`;
  }
}

function extractOutgoingMessage(payload: EventPayload) {
  const { message: messageProp } = MessagePayloadSchema.parse(payload);
  if (messageProp && typeof messageProp === "object" && "type" in messageProp) {
    const validated = outgoingMessageSchema.safeParse(messageProp);
    if (validated.success) {
      if (validated.data.type === "cf_agent_chat_clear") {
        return "Chat clear";
      }
      if (validated.data.type === "cf_agent_chat_messages") {
        const chatMessage = validated.data;
        return `Sending messages (${chatMessage.messages.length} total)`;
      }
      if (validated.data.type === "cf_agent_use_chat_response") {
        const chatMessage = validated.data;
        return `Chat response (${chatMessage.body.length} bytes)`;
      }
    }
  }
  return JSON.stringify(payload);
}

// WebSocket message details component
const WebSocketDetails = ({
  type,
  payload,
}: { type: AgentEventType; payload: EventPayload }) => {
  const message = createMessage({ type, payload });
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
    const { chunks, done, type } = payload as CombinedEvent["payload"];
    const typeSummary =
      type === "cf_agent_use_chat_response" ? "Streaming chat response" : type;
    const message =
      type === "cf_agent_use_chat_response" && done
        ? `${typeSummary}  (${chunks.length} parts)`
        : `Broadcast (${typeSummary}) in progress`;
    return (
      <div className="mt-1 text-sm text-muted-foreground flex flex-col gap-1">
        {message}
      </div>
    );
  }

  // Fallback for any other event types
  return <div className="mt-1 text-sm">Event received ({type})</div>;
};
