import { KeyValueTable } from "@/components/KeyValueTable";
import {
  FpTabs,
  FpTabsContent,
  FpTabsList,
  FpTabsTrigger,
} from "@/components/ui/tabs";
import type { CoreAgentEvent } from "@/hooks";
import type { CombinedEvent } from "@/store";
import {
  type HttpRequestPayload,
  type HttpResponsePayload,
  MessagePayloadSchema,
  type OutgoingMessage,
  outgoingMessageSchema,
} from "@/types";
import { parseDataStreamPart } from "ai";
import { Check, type CheckCheck } from "lucide-react";
import { useState } from "react";
import { MessageItem } from "../../ChatMessageTableView";
import { JSONViewer } from "../JSONViewer";

export function EventItemDetails(props: {
  event: CombinedEvent | CoreAgentEvent;
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

function BroadcastDetails(props: {
  payload: (CombinedEvent | CoreAgentEvent)["payload"];
}) {
  const { payload } = props;
  const validPayload = MessagePayloadSchema.safeParse(payload);
  const messageProp = validPayload.data?.message;
  const validateMessageProp = outgoingMessageSchema.safeParse(messageProp);
  console.log("event", {
    messageProp,
    validateMessageProp,
  });

  if (!validateMessageProp.success) {
    // So it's a
    return (
      <JSONViewer data={payload} className="py-1" label="Broadcast Payload" />
    );
  }

  const data = validateMessageProp.data;
  if (data.type === "cf_agent_chat_clear") {
    return (
      <JSONViewer data={payload} className="py-1" label="Broadcast Payload" />
    );
  }
  if (data.type === "cf_agent_chat_messages") {
    return <ChatMessagesDetails {...data} raw={payload} />;
  }

  return <JSONViewer data={data} className="py-1" label="Broadcast Payload" />;
}

function ChatMessagesDetails(
  props: OutgoingMessage & {
    type: "cf_agent_chat_messages";
    raw: (CombinedEvent | CoreAgentEvent)["payload"];
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
        {/* <div>
          Latest first
        </div> */}
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
        <JSONViewer
          data={props.raw}
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
  event: CombinedEvent;
}) {
  const { event } = props;
  const [activeTab, setActiveTab] = useState("summary");
  const { chunks, type } = event.payload;
  return (
    <FpTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <FpTabsList className="bg-transparent">
        <FpTabsTrigger value="summary" className="flex gap-2">
          Summary
        </FpTabsTrigger>
        <FpTabsTrigger value="chunks" className="flex gap-2">
          Chunks
        </FpTabsTrigger>
        <FpTabsTrigger value="raw" className="flex gap-2">
          Raw
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
      <FpTabsContent value="raw">
        <JSONViewer
          data={event}
          className="py-1"
          label={`Combined Event (${type})`}
        />
      </FpTabsContent>
    </FpTabs>
  );
}

function CombinedEventSummary(
  props: Pick<CombinedEvent["payload"], "content" | "done" | "metadata">,
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
  chunks: CombinedEvent["payload"]["chunks"];
}) {
  return (
    <div className="grid gap-2 border rounded-lg p-2">
      {props.chunks.map((chunk, index) => (
        <JSONViewer
          key={index}
          data={chunk.body ? parseDataStreamPart(chunk.body) : {}}
          className="py-1"
          label={`Chunk ${index + 1}`}
        />
      ))}
    </div>
  );
}
