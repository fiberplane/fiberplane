import { KeyValueTable } from "@/components/KeyValueTable";
import { StatusCode } from "@/components/StatusCode";
import {
  FpTabs,
  FpTabsContent,
  FpTabsList,
  FpTabsTrigger,
} from "@/components/ui/tabs";
import type {
  HttpRequestPayload,
  HttpResponsePayload,
  OutgoingMessage,
  UIAgentEvent,
} from "@/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import { parseDataStreamPart } from "ai";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessageItem } from "../../ChatMessageTableView";
import { JSONViewer } from "../JSONViewer";

export function EventItemDetails(props: {
  event: UIAgentEvent;
}) {
  const { event } = props;
  if (event.type === "request") {
    const payload = event.payload as HttpRequestPayload;
    return <HttpRequestDetails payload={payload} />;
  }
  if (event.type === "http_response") {
    const payload = event.payload as HttpResponsePayload;
    return <HttpResponseDetails payload={payload} />;
  }

  if (event.type === "broadcast") {
    return <BroadcastDetails payload={event.payload} />;
  }

  if (event.type === "combined_event") {
    return <CombinedEventDetails event={event} />;
  }

  if (event.type === "connect") {
    return (
      <div className="border rounded-lg p-2 flex">
        <div className="min-w-[200px] text-muted-foreground">
          Connection ID:
        </div>
        <div>{event.payload.connectionId}</div>
      </div>
    );
  }

  if (event.type === "ws_close") {
    return (
      <div className="border rounded-lg p-2">
        <KeyValueTable keyValue={event.payload} />
      </div>
    );
  }

  if (event.type === "ws_message") {
    return (
      <div className="grid gap-2 px-4 pt-2">
        <div className="flex gap-2 justify-end w-full">
          <EventTypeInfo type={event.type} />
        </div>
        <div className="border rounded-lg ">
          <div className="p-2 flex">
            <div className="min-w-[200px] text-muted-foreground">
              Connection ID:
            </div>
            <div>{event.payload.connectionId}</div>
          </div>
          <JSONViewer
            data={
              event.payload.incomingMessage ??
              event.payload.typedMessage ??
              event.payload.message
            }
            className="py-1 border-x-0 rounded-none"
          />
        </div>
      </div>
    );
  }

  if (event.type === "ws_send") {
    return (
      <div className="grid gap-2 px-4 pt-2">
        <div className="flex gap-2 justify-end w-full">
          <EventTypeInfo type={event.type} />
        </div>

        <div className="border rounded-lg ">
          <div className="p-2 flex">
            <div className="min-w-[200px] text-muted-foreground">
              Target Connection ID:
            </div>
            <div>{event.payload.connectionId}</div>
          </div>
          <JSONViewer
            data={
              event.payload.outgoingMessage ??
              event.payload.typedMessage ??
              event.payload.message
            }
            className="py-1 rounded-none border-x-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2 px-4 pt-2">
      <div className="flex gap-2 justify-end w-full">
        <EventTypeInfo type={event.type} />
      </div>
      <JSONViewer data={event.payload} className="py-1" />
    </div>
  );
}

function EventTypeInfo({ type }: Pick<UIAgentEvent, "type">) {
  let message = "Unknown event type";
  if (type === "request") {
    message = "HTTP Request";
  } else if (type === "http_response") {
    message = "HTTP Response";
  } else if (type === "broadcast") {
    message = "Broadcast";
  } else if (type === "connect") {
    message = "WebSocket Open";
  } else if (type === "ws_close") {
    message = "WebSocket Close";
  } else if (type === "ws_message") {
    message = "WebSocket Message";
  } else if (type === "ws_send") {
    message = "WebSocket Send";
  } else if (type === "combined_event") {
    message = "Multiple Broadcast";
  } else if (type === "state_change") {
    message = "State Change";
  } else if (type === "stream_open") {
    message = "Stream Open";
  } else if (type === "stream_close") {
    message = "Stream Close";
  } else if (type === "stream_error") {
    message = "Stream Error";
  }

  return (
    <div className="text-sm text-muted-foreground bg-muted p-1 rounded-lg">
      {message}
    </div>
  );
}
function HttpRequestDetails(props: { payload: HttpRequestPayload }) {
  const { payload } = props;

  const hasHeaders =
    !!payload.headers && Object.keys(payload.headers).length > 0;
  const hasBody = !!payload.body && Object.keys(payload.body).length > 0;
  const [activeTab, setActiveTab] = useState(hasHeaders ? "headers" : "body");

  return (
    <FpTabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full pt-1.5"
    >
      <FpTabsList className="bg-transparent border-b-0 py-1.5 h-auto grid grid-cols-[1fr_auto]">
        <div className="flex gap-2">
          {hasHeaders && (
            <FpTabsTrigger value="headers" className="flex gap-2">
              Headers
            </FpTabsTrigger>
          )}
          {hasBody && (
            <FpTabsTrigger value="body" className="flex gap-2">
              Body
            </FpTabsTrigger>
          )}
        </div>
        <EventTypeInfo type="request" />
      </FpTabsList>
      <FpTabsContent value="headers" className="pt-2">
        {hasHeaders && !!payload.headers && (
          <KeyValueTable
            className="text-xs border"
            keyValue={payload.headers}
            keyCellClassName="p-1 px-4"
            valueCellClassName="p-1"
          />
        )}
      </FpTabsContent>
      <FpTabsContent value="body" className="pt-2">
        {hasBody && (
          <JSONViewer
            data={payload.body}
            className="py-1"
            label="Request Body"
          />
        )}
      </FpTabsContent>
    </FpTabs>
  );
}

function BroadcastDetails(
  props: Pick<UIAgentEvent & { type: "broadcast" }, "payload">,
) {
  const { payload } = props;

  if (payload.outgoingMessage) {
    const data = payload.outgoingMessage;
    if (data.type === "cf_agent_chat_clear") {
      return (
        <div className="grid gap-2 px-4 pt-2">
          <div className="flex gap-2 justify-end w-full">
            <EventTypeInfo type="broadcast" />
          </div>
          <JSONViewer
            data={payload}
            className="py-1"
            label="Broadcast Payload"
          />
        </div>
      );
    }

    if (data.type === "cf_agent_chat_messages") {
      return <ChatMessagesDetails {...data} without={payload.without} />;
    }
  }

  return (
    <div className="grid gap-2 px-4 pt-2">
      <div className="flex gap-2 justify-end w-full">
        <EventTypeInfo type="broadcast" />
      </div>
      <JSONViewer
        data={payload.typedMessage ?? payload.message}
        className="py-1"
        label="Broadcast Payload"
      />
    </div>
  );
}

function ChatMessagesDetails(
  props: OutgoingMessage & {
    type: "cf_agent_chat_messages";
    without?: Array<string>;
  },
) {
  const [activeTab, setActiveTab] = useState("messages");

  return (
    <FpTabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full pt-1.5"
    >
      <FpTabsList className="bg-transparent border-b-0 py-1.5 h-auto grid grid-cols-[1fr_auto]">
        <div className="flex gap-2">
          <FpTabsTrigger value="messages" className="flex gap-2">
            Messages
          </FpTabsTrigger>
          <FpTabsTrigger value="raw" className="flex gap-2">
            Raw
          </FpTabsTrigger>
        </div>
        <div className="flex gap-2">
          <EventTypeInfo type="broadcast" />
        </div>
      </FpTabsList>
      <FpTabsContent value="messages" className="pt-0 px-3">
        <div className="grid gap-2 p-2">
          {[...props.messages]
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA; // Sort in descending order (newest first)
            })
            .map((message, index) => (
              <div key={index}>
                <MessageItem
                  {...message}
                  created_at={message.createdAt ?? null}
                  createdAt={message.createdAt ?? ""}
                />
              </div>
            ))}
        </div>
      </FpTabsContent>
      <FpTabsContent value="raw" className="pt-0 grid gap-2">
        <JSONViewer
          data={props.messages}
          className="py-1"
          label="Broadcast Payload"
        />
        <div className="text-muted-foreground">
          Excluding connections: {props.without?.join(", ")}{" "}
        </div>
      </FpTabsContent>
    </FpTabs>
  );
}

function HttpResponseDetails(props: { payload: HttpResponsePayload }) {
  const { payload } = props;

  const hasHeaders =
    !!payload.headers && Object.keys(payload.headers).length > 0;
  const hasBody = !!payload.body && Object.keys(payload.body).length > 0;
  const [activeTab, setActiveTab] = useState(hasHeaders ? "headers" : "body");

  return (
    <FpTabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full pt-1.5"
    >
      <FpTabsList className="bg-transparent border-b-0 py-1.5 h-auto grid grid-cols-[1fr_auto]">
        <div className="flex gap-2">
          {hasHeaders && (
            <FpTabsTrigger value="headers" className="flex gap-2 text-xs">
              Headers
            </FpTabsTrigger>
          )}
          {hasBody && (
            <FpTabsTrigger value="body" className="flex gap-2">
              Body
            </FpTabsTrigger>
          )}
        </div>
        <div className="flex gap-2">
          {payload.status && (
            <StatusCode
              status={payload.status}
              isFailure={payload.status >= 500}
            />
          )}
          <EventTypeInfo type="http_response" />
        </div>
      </FpTabsList>
      <FpTabsContent value="headers" className="pt-2">
        {hasHeaders && !!payload.headers && (
          <KeyValueTable
            className="text-xs border"
            keyValue={payload.headers}
            keyCellClassName="p-1 px-4"
            valueCellClassName="p-1"
          />
        )}
      </FpTabsContent>
      <FpTabsContent value="body" className="pt-2">
        {hasBody && (
          <JSONViewer
            data={payload.body}
            className="py-1"
            label="Request Body"
          />
        )}
      </FpTabsContent>
    </FpTabs>
  );
}

function CombinedEventDetails(props: {
  event: UIAgentEvent & { type: "combined_event" };
}) {
  const { event } = props;
  const [activeTab, setActiveTab] = useState("summary");
  const { chunks } = event.payload;
  return (
    <FpTabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full pt-1.5"
    >
      <FpTabsList className="bg-transparent border-b-0 py-1.5 h-auto grid grid-cols-[1fr_auto]">
        <div className="flex gap-2">
          <FpTabsTrigger value="summary" className="flex gap-2">
            Summary
          </FpTabsTrigger>
          <FpTabsTrigger value="chunks" className="flex gap-2">
            Chunks
          </FpTabsTrigger>
        </div>
        <div>
          <EventTypeInfo type="combined_event" />
        </div>
      </FpTabsList>
      <FpTabsContent value="chunks" className="pt-2">
        <CombinedEventChunks chunks={chunks} />
      </FpTabsContent>
      <FpTabsContent value="summary" className="pt-2">
        <CombinedEventSummary
          content={event.payload.content}
          done={event.payload.done}
          metadata={event.payload.metadata}
        />
      </FpTabsContent>
    </FpTabs>
  );
}

function CombinedEventSummary(
  props: Pick<
    (UIAgentEvent & { type: "combined_event" })["payload"],
    "content" | "done" | "metadata"
  >,
) {
  const { content, done, metadata } = props;
  const data = {
    content,
    done: done ? <Check className="text-success" /> : "In progress",
    messageId: metadata.messageId,
    toolCalls: <JSONViewer data={metadata.toolCalls} />,
    toolResults: <JSONViewer data={metadata.toolResults} />,
    status: <JSONViewer data={metadata.status} />,
  };
  return (
    <KeyValueTable
      keyValue={data}
      className="text-xs"
      keyCellClassName="p-1"
      valueCellClassName="p-1"
    />
  );
}

function CombinedEventChunks(props: {
  chunks: (UIAgentEvent & { type: "combined_event" })["payload"]["chunks"];
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [measuredHeights, setMeasuredHeights] = useState<
    Record<number, number>
  >({});

  // Measure and remember heights of rendered items
  const estimateSize = (index: number) => {
    return measuredHeights[index] || 85; // Start with a reasonable estimate
  };

  const virtualizer = useVirtualizer({
    count: props.chunks.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5, // Pre-render items above and below the visible area for smoother scrolling
    getItemKey: (index) => index,
  });

  // Track measured heights after render
  const handleItemResize = (index: number, element: HTMLElement) => {
    const height = element.getBoundingClientRect().height;
    if (height !== measuredHeights[index]) {
      setMeasuredHeights((prev) => ({
        ...prev,
        [index]: height,
      }));
    }
  };

  // Effect to measure initial items after first render
  // biome-ignore lint/correctness/useExhaustiveDependencies: measure should happen again when the chunks change
  useEffect(() => {
    const timer = setTimeout(() => {
      virtualizer.measure();
    }, 50);
    return () => clearTimeout(timer);
  }, [virtualizer.measure, props.chunks]);

  return (
    <div
      ref={parentRef}
      className="border rounded-lg p-2 overflow-auto"
      style={{
        maxHeight: "600px",
        // height: '400px', // Set a reasonable container height
        width: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const chunk = props.chunks[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={(el) => {
                if (el) {
                  virtualizer.measureElement(el);
                  handleItemResize(virtualRow.index, el);
                }
              }}
              className="py-1 absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="min-h-[85px] border rounded-lg">
                <JSONViewer
                  data={chunk.body ? parseDataStreamPart(chunk.body) : {}}
                  className="py-1 border-0"
                  label={`Chunk ${virtualRow.index + 1}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
