import {
  ChevronDown,
  ChevronRight,
  Clock,
  Info,
  MessageSquare,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { noop } from "@/lib/utils";
import type { DBTable } from "@/types";
import { z } from "zod";
import { CodeMirrorJsonEditor } from "../CodeMirror";
import { ListSection } from "../ListSection";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

/**
 * Schema for the columns section of the chat agent messages JSON
 * Validates the structure where each property is an array of possible types
 */
export const MessageColumnsSchema = z.object({
  id: z.tuple([z.literal("null"), z.literal("string")]),
  message: z.tuple([z.literal("string")]),
  created_at: z.tuple([z.literal("null"), z.literal("string")]),
});

export type MessageColumns = z.infer<typeof MessageColumnsSchema>;

export type MessagesTable = DBTable<MessageColumns>;

export function isMessagesTable(
  name: string,
  table: MessagesTable,
): table is MessagesTable {
  return (
    name === "cf_ai_chat_agent_messages" &&
    MessageColumnsSchema.safeParse(table.columns).success
  );
}

/**
 * Types for the message data structure
 */
type ToolInvocation = {
  state: string;
  step: number;
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result: string;
};

type MessagePart = {
  type: string;
  text?: string;
  toolInvocation?: ToolInvocation;
};

type ParsedMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  parts?: MessagePart[];
  toolInvocations?: ToolInvocation[];
  revisionId?: string;
};

type ChatMessage = {
  id: string | null;
  message: string;
  created_at: string | null;
};

type Props = {
  data: ChatMessage[];
};

/**
 * Component to display JSON in a collapsible format
 */
const JSONViewer = ({ data }: { data: unknown }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="font-mono text-sm -ml-1.5">
      <Button
        type="button"
        onClick={toggleExpand}
        variant="outline"
        size="icon-xs"
        className="w-auto pr-2 pl-1 text-xs gap-1"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Message Details
      </Button>

      {isExpanded && (
        <CodeMirrorJsonEditor
          onChange={noop}
          readOnly
          value={JSON.stringify(data, null, 2)}
        />
      )}
    </div>
  );
};

/**
 * Component to display tool invocation details
 */
const ToolInvocationViewer = ({ tool }: { tool: ToolInvocation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-l-4 border-accent pl-3">
      <div className="flex items-center">
        <div className="text-purple-500 mr-2 flex items-center justify-center w-4 h-4">
          <span className="text-xs">⚙️</span>
        </div>
        <strong className="text-accent">{tool.toolName}</strong>
        <span className="ml-2 text-sm text-muted-foreground">
          ({tool.state})
        </span>
        <Button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="icon-xs"
          className="h-6 w-6"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </Button>
      </div>

      {isExpanded && (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="px-0 font-medium min-w-[140px] w-[140px] lg:min-w-[200px] uppercase text-xs text-muted-foreground">
                Call ID:
              </TableCell>
              <TableCell className="font-mono align-middle h-full">
                {tool.toolCallId}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-0 font-medium min-w-[140px] w-[140px] lg:min-w-[200px] uppercase text-xs text-muted-foreground align-top">
                Arguments:
              </TableCell>
              <TableCell className="font-mono align-middle h-full">
                <CodeMirrorJsonEditor
                  minHeight="auto"
                  onChange={noop}
                  value={JSON.stringify(tool.args, null, 2)}
                  readOnly
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-0 font-medium min-w-[140px] w-[140px] lg:min-w-[200px] uppercase text-xs text-muted-foreground">
                Result:
              </TableCell>
              <TableCell className="font-mono align-middle h-full">
                {tool.result}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
};

/**
 * Main message component for displaying a single message
 */
const MessageItem = ({ message }: { message: ChatMessage }) => {
  const [parsedData, setParsedData] = useState<ParsedMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(message.message);
      setParsedData(parsed);
    } catch (e) {
      setError("Failed to parse message JSON");
      console.error("Parse error:", e);
    }
  }, [message]);

  if (error) {
    return (
      <div className="text-red-500">
        {error}: {message.message}
      </div>
    );
  }

  if (!parsedData) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const createdAt = parsedData.createdAt || message.created_at;
  const formattedDate = createdAt ? (
    new Date(createdAt).toLocaleString()
  ) : (
    <em>{JSON.stringify(createdAt)}</em>
  );
  const isUser = parsedData.role === "user";
  const isAssistant = parsedData.role === "assistant";
  const hasTools =
    parsedData.toolInvocations && parsedData.toolInvocations.length > 0;

  return (
    <div
      className={`p-4 rounded-lg mb-4 grid gap-2 ${isUser ? "bg-card border border-muted" : "bg-muted"}`}
    >
      <div className="grid justify-between grid-cols-[1fr_auto] gap-2">
        <div className="flex items-center gap-2">
          {isUser ? (
            <UserIcon size={18} />
          ) : isAssistant ? (
            <MessageSquare size={18} />
          ) : (
            <Info size={18} />
          )}
          <span className="font-medium">{parsedData.role || "unknown"}</span>
          {hasTools && (
            <span className="ml-2 bg-info/15 text-info-foreground text-xs px-2 py-1 rounded">
              Tool Usage
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock size={14} className="mr-1" />
          {formattedDate}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground">Message:</div>
        {/* Display message parts if available */}
        {parsedData.parts && parsedData.parts.length > 0 && (
          <div className="grid gap-2">
            {parsedData.parts.map((part, index) => {
              return <MessagePart key={index} part={part} />;
            })}
          </div>
        )}
      </div>

      <JSONViewer data={parsedData} />
    </div>
  );
};

function MessagePart({ part }: { part: MessagePart }) {
  if (part.type === "tool-invocation" && part.toolInvocation) {
    return <ToolInvocationViewer tool={part.toolInvocation} />;
  }

  if (part.type === "text" && part.text) {
    return <div className="text-sm">{part.text}</div>;
  }

  return null;
}

/**
 * Main component that displays all messages
 */
export const ChatMessagesRenderer = ({ data }: Props) => {
  return (
    <div className="space-y-2 mt-2">
      {data.length === 0 && (
        <div className="text-muted-foreground text-center py-6">
          No messages found
        </div>
      )}
      {data.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
