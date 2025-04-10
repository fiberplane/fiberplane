import { KeyValueTable } from "@/components/KeyValueTable";
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
  if (event.type === "http_request") {
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

  if (event.type === "ws_open") {
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
    );
  }

  if (event.type === "ws_send") {
    return (
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
    );
  }

  return <JSONViewer data={event.payload} className="py-1" />;
}

function HttpRequestDetails(props: { payload: HttpRequestPayload }) {
  const { payload } = props;

  const hasHeaders =
    !!payload.headers && Object.keys(payload.headers).length > 0;
  const hasBody = !!payload.body && Object.keys(payload.body).length > 0;
  const [activeTab, setActiveTab] = useState(hasHeaders ? "headers" : "body");

  return (
    <FpTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <FpTabsList className="bg-transparent">
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
      </FpTabsList>
      <FpTabsContent value="headers">
        {hasHeaders && !!payload.headers && (
          <KeyValueTable
            className="text-xs"
            keyValue={payload.headers}
            keyCellClassName="p-1"
            valueCellClassName="p-1"
          />
        )}
      </FpTabsContent>
      <FpTabsContent value="body">
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
        <JSONViewer data={payload} className="py-1" label="Broadcast Payload" />
      );
    }

    if (data.type === "cf_agent_chat_messages") {
      return <ChatMessagesDetails {...data} without={payload.without} />;
    }
  }

  return (
    <JSONViewer
      data={payload.typedMessage ?? payload.message}
      className="py-1"
      label="Broadcast Payload"
    />
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
    <FpTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <FpTabsList className="bg-transparent">
        <FpTabsTrigger value="messages" className="flex gap-2">
          Messages
        </FpTabsTrigger>
        <FpTabsTrigger value="raw" className="flex gap-2">
          Raw
        </FpTabsTrigger>
      </FpTabsList>
      <FpTabsContent value="messages">
        <div className="grid gap-2 border rounded-lg p-2">
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
      <FpTabsContent value="raw">
        <div>Excluding: {props.without?.join(", ")}</div>
        <JSONViewer
          data={props.messages}
          className="py-1"
          label="Broadcast Payload"
        />
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
    <FpTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <FpTabsList className="bg-transparent">
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
      </FpTabsList>
      <FpTabsContent value="headers">
        {hasHeaders && !!payload.headers && (
          <KeyValueTable
            className="text-xs"
            keyValue={payload.headers}
            keyCellClassName="p-1"
            valueCellClassName="p-1"
          />
        )}
      </FpTabsContent>
      <FpTabsContent value="body">
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
    <FpTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <FpTabsList className="bg-transparent">
        <FpTabsTrigger value="summary" className="flex gap-2">
          Summary
        </FpTabsTrigger>
        <FpTabsTrigger value="chunks" className="flex gap-2">
          Chunks
        </FpTabsTrigger>
      </FpTabsList>
      <FpTabsContent value="chunks">
        <CombinedEventChunks chunks={chunks} />
      </FpTabsContent>
      <FpTabsContent value="summary">
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
