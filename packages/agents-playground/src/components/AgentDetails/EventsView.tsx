import { useFilteredEvents, type AgentEvent, type AgentEventType, type EventPayload, useTimeAgo } from "@/hooks";
import { cn, noop } from "@/lib/utils";
import { EMPTY_EVENTS, usePlaygroundStore } from "@/store";
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
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CodeMirrorJsonEditor } from "../CodeMirror";
import { Method } from "../Method";
import { Checkbox } from "../ui/Checkbox";
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
  className,
}: { data: unknown; label?: string; className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  }, [data]);

  return (
    <div className={cn("font-mono text-sm mt-2", className)}>
      <Button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        size="icon-xs"
        className="w-auto pr-2 pl-1 text-xs gap-1"
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        {label}
      </Button>

      {isExpanded && (
        <div className="mt-2">
          <CodeMirrorJsonEditor
            onChange={noop}
            readOnly
            value={jsonString}
            minHeight="auto"
          />
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
    <div className="mt-1 text-sm grid-cols-[auto_1fr] grid gap-2">
      <Method method={method} />{" "}
      <span className="font-mono text-muted-foreground">{displayUrl}</span>
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
  const formattedDate = useTimeAgo(event.timestamp);

  return (
    <div className="@container/event">
      <div
        className={cn(
          "p-3 @xl/event:p-0 grid",
          "bg-muted/20",
          "border @xl/event:border-0 border-border rounded-lg",
          "grid-cols-1",
          "[grid-template-areas:'badge_badge_time'_'summary_summary_summary'_'details_details_details']",
          "@xl/event:[grid-template-areas:'badge_summary_time'_'details_details_details']",
          "@xl/event:grid-cols-[auto_1fr_auto]",
          "items-center",
        )}
      >
        <div className="[grid-area:badge] grid">
          <div className="w-fit">
            <Badge
              variant={getEventVariant(event.type)}
              className="flex items-center gap-1 py-2 px-2 opacity-80 text-xs font-normal"
            >
              {getEventIcon(event.type)}
              <span className="@xl/event:hidden">{event.type}</span>
            </Badge>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground justify-end [grid-area:time]">
          <Clock size={14} className="mr-1" />
          {formattedDate}
        </div>

        <div className="px-2.5 [grid-area:summary]">
          <EventSummary type={event.type} payload={event.payload} />
        </div>

        <JSONViewer className="[grid-area:details] mt-0" data={event.payload} />
      </div>
    </div>
  );
};

export function EventsView(props: { namespace: string; instance: string }) {
  const resetAgentInstanceEvents = usePlaygroundStore(
    (state) => state.resetAgentInstanceEvents,
  );
  const clearEvents = () =>
    resetAgentInstanceEvents(props.namespace, props.instance);

  const shownEvents = useFilteredEvents();
  const rawEvents = usePlaygroundStore(
    (state) =>
      state.agentsState[props.namespace]?.instances[props.instance]?.events ??
      EMPTY_EVENTS,
  );
  const showAdminEvents = usePlaygroundStore((state) => state.showAdminEvents);
  const toggleShowAdminEvents = usePlaygroundStore(
    (state) => state.toggleAdminEvents,
  );

  const sortedEvents = useMemo(() => {
    return [...shownEvents].sort((a, b) => {
      // Handle case where timestamps might be invalid
      try {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      } catch (e) {
        return 0;
      }
    });
  }, [shownEvents]);

  return (
    <div>
      <div className="grid items-center grid-cols-[1fr_auto] gap-2 border-b border-border pb-4">
        <span className="text-muted-foreground">
          Showing ({shownEvents.length} of {rawEvents.length} events)
        </span>
        <div className="flex items-center gap-2">
          {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox is the related input element */}
          <label className="text-muted-foreground text-sm flex items-center gap-1 cursor-pointer hover:text-foreground">
            <Checkbox
              checked={showAdminEvents}
              onCheckedChange={toggleShowAdminEvents}
            />{" "}
            Show all
          </label>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={clearEvents}
            className="w-auto h-auto p-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">
          {rawEvents.length === 0
            ? "No events captured yet."
            : "Filtered selection has no events."}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedEvents.map((event, idx) => (
            <EventItem key={`${event.id}`} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
