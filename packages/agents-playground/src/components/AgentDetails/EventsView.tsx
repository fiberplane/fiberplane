import { useSSE } from "@/hooks";
import { noop } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Info,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CodeMirrorJsonEditor } from "../CodeMirror";
import { ListSection } from "../ListSection";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

// Define a more specific type for HTTP request payloads
interface HttpRequestPayload {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  [key: string]: unknown;
}

// Generic event payload type
interface EventPayload {
  [key: string]: unknown;
}

interface AgentEvent {
  type: AgentEventType;
  timestamp: string;
  payload: EventPayload;
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

// Helper to format a timestamp
const formatTimestamp = (timestamp: string): string => {
  try {
    if (!timestamp) {
      return "Unknown time";
    }
    return new Date(timestamp).toLocaleString();
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return "Invalid time";
  }
};

// Component to display JSON in a collapsible format
const JSONViewer = ({
  data,
  label = "Raw Data",
}: { data: unknown; label?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  }, [data]);

  return (
    <div className="font-mono text-sm mt-2">
      <Button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        size="icon-xs"
        className="w-auto pr-2 pl-1 text-xs gap-1"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        {label}
      </Button>

      {isExpanded && (
        <div className="mt-2">
          <CodeMirrorJsonEditor onChange={noop} readOnly value={jsonString} />
        </div>
      )}
    </div>
  );
};

// Get an icon based on event type
const getEventIcon = (type: AgentEventType) => {
  switch (type) {
    case "http_request":
      return <Globe size={16} />;
    case "ws_message":
    case "ws_open":
    case "ws_close":
      return <MessageSquare size={16} />;
    case "state_change":
      return <LayoutDashboard size={16} />;
    case "stream_open":
    case "stream_close":
      return <ArrowRight size={16} />;
    case "stream_error":
      return <AlertCircle size={16} />;
    default:
      return <Info size={16} />;
  }
};

// Get a color variant based on event type
const getEventVariant = (
  type: AgentEventType,
): "default" | "outline" | "secondary" | "destructive" => {
  switch (type) {
    case "http_request":
      return "secondary";
    case "ws_message":
      return "outline";
    case "ws_open":
      return "outline";
    case "ws_close":
      return "outline";
    case "state_change":
      return "outline";
    case "stream_error":
      return "destructive";
    default:
      return "outline";
  }
};

// HTTP Request details component
const HttpRequestDetails = ({ payload }: { payload: HttpRequestPayload }) => {
  const { method = "GET", url = "", headers = {} } = payload;
  const displayUrl = typeof url === "string" ? formatUrl(url) : "";

  return (
    <div className="mt-1 text-sm">
      <div>
        <span className="font-medium">{method as string}</span> {displayUrl}
      </div>
      {!!payload.body && typeof payload.body === "object" && (
        <JSONViewer
          data={payload.body as Record<string, unknown>}
          label="Request Body"
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
  let message = "WebSocket event";

  if (type === "ws_open") {
    message = "WebSocket connection opened";
  } else if (type === "ws_close") {
    message = "WebSocket connection closed";
  } else if (type === "ws_message") {
    message = "WebSocket message received";
  }

  return <div className="mt-1 text-sm">{message}</div>;
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
const EventSummary = ({
  type,
  payload,
}: { type: AgentEventType; payload: EventPayload }) => {
  if (type === "http_request") {
    return <HttpRequestDetails payload={payload as HttpRequestPayload} />;
  }

  if (type === "ws_message" || type === "ws_open" || type === "ws_close") {
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

  // Fallback for any other event types
  return <div className="mt-1 text-sm">Event received</div>;
};

// Single event item component
const EventItem = ({ event }: { event: AgentEvent }) => {
  const formattedDate = formatTimestamp(event.timestamp);

  return (
    <div className="p-3 rounded-lg mb-2 bg-muted border border-border">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <Badge
            variant={getEventVariant(event.type)}
            className="flex items-center gap-1 py-1 px-2 opacity-80 text-xs font-normal"
          >
            {getEventIcon(event.type)}
            {event.type}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock size={14} className="mr-1" />
          {formattedDate}
        </div>
      </div>

      <EventSummary type={event.type} payload={event.payload} />

      <JSONViewer data={event.payload} />
    </div>
  );
};

export function EventsView(props: { namespace: string; instance: string }) {
  const { namespace, instance } = props;

  const {
    data: events,
    // status,
    clearEvents,
  } = useSSE<AgentEvent>(`/agents/${namespace}/${instance}/admin/events`, {
    eventTypes: [
      "http_request",
      "state_change",
      "ws_open",
      "ws_message",
      "ws_close",
      "stream_close",
      "stream_error",
    ],
    maxEvents: 100, // Limit to latest 100 events
    filterAdminEndpoints: true, // Filter out admin/db and admin/events endpoints
  });

  // For debugging - log the events to console
  useMemo(() => {
    if (events.length > 0) {
      console.log("SSE Events:", events);
    }
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      // Handle case where timestamps might be invalid
      try {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      } catch (e) {
        return 0;
      }
    });
  }, [events]);

  return (
    <ListSection
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            Agent Events
            <span className="text-muted-foreground">
              ({events.length} total)
            </span>
          </div>
          <Button size="sm" onClick={clearEvents}>
            Clear Events
          </Button>
        </div>
      }
    >
      {sortedEvents.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4">
          No events captured yet.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedEvents.map((event, idx) => (
            <EventItem
              key={`${event.timestamp || "unknown"}-${event.type || "unknown"}-${idx}`}
              event={event}
            />
          ))}
        </div>
      )}
    </ListSection>
  );
}
