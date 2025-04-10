import { Method } from "@/components/Method";
import { StatusCode } from "@/components/StatusCode";
import type { DiscriminatedSubset, UIAgentEvent } from "@/types";
import type { ReactNode } from "react";
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
const HttpRequestDetails = ({
  payload,
}: DiscriminatedSubset<UIAgentEvent & { type: "http_request" }, "payload">) => {
  const { method = "GET", url = "" } = payload;
  const displayUrl = typeof url === "string" ? formatUrl(url) : "";

  return (
    <div className="text-sm grid-cols-[auto_1fr] grid gap-2">
      <Method method={method} />
      <span className="font-mono text-muted-foreground">{displayUrl}</span>
      {payload.body && (
        <ExpandableJSONViewer data={payload.body} label="Request Body" />
      )}
    </div>
  );
};

// HTTP Request details component
const HttpResponseDetails = ({
  payload,
}: DiscriminatedSubset<
  UIAgentEvent & { type: "http_response" },
  "type" | "payload"
>) => {
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
}: DiscriminatedSubset<UIAgentEvent, "type" | "payload">): ReactNode {
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
      return extractOutgoingMessage(payload) || "Broadcast message sent";
    }
    case "ws_message": {
      return extractIncomingMessage(payload) ?? "WebSocket message";
    }
    case "ws_open":
      return "WebSocket connected";
    case "ws_close":
      return "WebSocket disconnected";
    case "ws_send":
      return extractOutgoingMessage(payload) ?? "WebSocket message sent";
    case "combined_event": {
      return "Combined event";
    }
    default: {
      return "WebSocket event";
    }
  }
}

function extractIncomingMessage(
  payload: (UIAgentEvent & { type: "ws_message" })["payload"],
): ReactNode {
  if (payload.incomingMessage) {
    const data = payload.incomingMessage;

    if (data.type === "cf_agent_chat_clear") {
      return "Clear chat";
    }
    if (data.type === "cf_agent_chat_messages") {
      const chatMessage = data;
      return `Receiving messages (${chatMessage.messages.length} total)`;
    }
    if (data.type === "cf_agent_use_chat_request") {
      const chatMessage = data;
      if (chatMessage.url === "/api/chat") {
        const body = chatMessage.init.body;
        const parsedBody = JSON.parse(body);
        return (
          <div className="flex gap-2">
            “{parsedBody.messages[parsedBody.messages.length - 1].content}”
          </div>
        );
      }

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
    }
  }

  if (payload.typedMessage) {
    return `${payload.typedMessage.type}`;
  }
}

function extractOutgoingMessage(
  payload: (UIAgentEvent & {
    type: "ws_send" | "broadcast";
  })["payload"],
): ReactNode {
  if (payload.outgoingMessage) {
    const data = payload.outgoingMessage;
    if (data.type === "cf_agent_chat_clear") {
      return "Clear chat";
    }
    if (data.type === "cf_agent_chat_messages") {
      const chatMessage = data;
      return `Sending messages (${chatMessage.messages.length} total)`;
    }
    if (data.type === "cf_agent_use_chat_response") {
      const chatMessage = data;
      return `Chat response (${chatMessage.body.length} bytes)`;
    }
    if (data.type === "cf_agent_state") {
      return "Synchronizing state";
    }
  }

  if (payload.typedMessage) {
    return `${payload.typedMessage.type}`;
  }
}

// WebSocket message details component
const WebSocketDetails = (
  props: DiscriminatedSubset<
    UIAgentEvent & {
      type: "ws_message" | "ws_open" | "ws_close" | "broadcast" | "ws_send";
    },
    "payload" | "type"
  >,
) => {
  const message = createMessage(props);
  return <div className="mt-1 text-sm text-muted-foreground">{message}</div>;
};

// State change details component
const StateChangeDetails = ({
  payload,
}: DiscriminatedSubset<UIAgentEvent & { type: "state_change" }, "payload">) => {
  return (
    <div className="mt-1 text-sm text-muted-foreground">
      Agent state updated
    </div>
  );
};

// Stream event details component
const StreamEventDetails = ({
  type,
  payload,
}: DiscriminatedSubset<
  UIAgentEvent & { type: "stream_open" | "stream_close" | "stream_error" },
  "payload" | "type"
>) => {
  let message = "Stream event";

  if (type === "stream_open") {
    message = "Stream opened";
  } else if (type === "stream_close") {
    message = "Stream closed";
  } else if (type === "stream_error") {
    const errorMessage = payload;

    return (
      <div className="mt-1 p-2 bg-destructive/10 rounded-md border border-destructive text-destructive">
        {errorMessage}
      </div>
    );
  }

  return <div className="mt-1 text-sm">{message}</div>;
};

type Props = DiscriminatedSubset<UIAgentEvent, "payload" | "type">;

// Main event summary component that selects the appropriate details component
export const EventSummary = (props: Props) => {
  if (props.type === "http_request") {
    return <HttpRequestDetails {...props} />;
  }
  if (props.type === "http_response") {
    return <HttpResponseDetails {...props} />;
  }

  if (
    props.type === "ws_message" ||
    props.type === "ws_open" ||
    props.type === "ws_close" ||
    props.type === "broadcast" ||
    props.type === "ws_send"
  ) {
    return <WebSocketDetails {...props} />;
  }

  if (props.type === "state_change") {
    return <StateChangeDetails {...props} />;
  }

  if (
    props.type === "stream_open" ||
    props.type === "stream_close" ||
    props.type === "stream_error"
  ) {
    return <StreamEventDetails {...props} />;
  }

  if (props.type === "combined_event") {
    const { chunks, done, type } = props.payload;
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
  // return <div className="mt-1 text-sm">Event received ({props.type})</div>;
};
