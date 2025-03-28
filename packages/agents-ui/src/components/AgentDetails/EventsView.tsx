import {
  type AgentEventType,
  type CoreAgentEvent,
  type EventPayload,
  useFilteredEvents,
  useTimeAgo,
} from "@/hooks";
import { cn, noop } from "@/lib/utils";
import {
  type AgentEvent,
  AllEventCategories,
  type CombinedEvent,
  eventCategories,
  usePlaygroundStore,
} from "@/store";
import { MessagePayloadSchema } from "@/types";
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Info,
  LayoutDashboard,
  Phone,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  RadioTower,
  Trash2,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { CodeMirrorJsonEditor } from "../CodeMirror";
import { Method } from "../Method";
import { Checkbox } from "../ui/Checkbox";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  FpDropdownMenu,
  FpDropdownMenuCheckboxItem,
  FpDropdownMenuContent,
  FpDropdownMenuItem,
  FpDropdownMenuPortal,
  FpDropdownMenuSeparator,
  FpDropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CaretSortIcon } from "@radix-ui/react-icons";

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

  if (isExpanded) {
    console.log("data", jsonString);
  }
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
const getEventIcon = (type: CombinedEvent["type"] | AgentEventType) => {
  switch (type) {
    case "http_request":
      return <Globe size={16} />;
    case "ws_send":
      return <PhoneOutgoing size={16} />;
    case "ws_message":
      return <PhoneIncoming size={16} />;
    case "ws_open":
      return <Phone size={16} />;
    case "ws_close":
      return <PhoneOff size={16} />;
    case "broadcast":
    case "combined_event":
      return <RadioTower size={16} />;
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
  type: CombinedEvent["type"] | AgentEventType,
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
        message = `Broadcast message: ${messageProp.type}`;
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
const EventSummary = ({
  type,
  payload,
}: Pick<AgentEvent, "type" | "payload">) => {
  if (type === "http_request") {
    return <HttpRequestDetails payload={payload as HttpRequestPayload} />;
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
    const { chunks, content, done } = payload as CombinedEvent["payload"];
    const message = done
      ? `Combined broadcast event (${chunks.length} parts)`
      : "Combined broadcast event in progress";
    return (
      <div className="mt-1 text-sm text-muted-foreground flex flex-col gap-1">
        {message}
        {/* <JSONViewer data={chunks} label="Chunks" className="mt-0" />
        <JSONViewer data={content} label="Combined Content" className="mt-0" /> */}
      </div>
    );
  }

  // Fallback for any other event types
  return <div className="mt-1 text-sm">Event received</div>;
};

// Single event item component
const EventItem = ({ event }: { event: CoreAgentEvent | CombinedEvent }) => {
  const formattedDate = useTimeAgo(event.timestamp);

  let payload = event.payload;
  try {
    if ("message" in payload && typeof payload.message === "string") {
      payload = JSON.parse(payload.message);
      // console.log('payload', payload);
    }
  } catch (e) {
    console.error("Error parsing payload:", e);
  }

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
          // "items-center",
        )}
      >
        <div className="[grid-area:badge] grid">
          <div className="w-fit">
            <Badge
              variant={getEventVariant(event.type)}
              className="flex items-center gap-1 py-2 px-2 opacity-80 text-xs font-normal"
              title={event.type}
            >
              {getEventIcon(event.type)}
              <span className="@xl/event:hidden hidden @xs/event:block">
                {event.type}
              </span>
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

        <JSONViewer
          className="[grid-area:details] mt-0 text-muted-foreground ml-2.5 @xl/event:ml-11"
          data={payload}
        />
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

  const events = useFilteredEvents(props);
  const combineEvents = usePlaygroundStore((state) => state.combineEvents);
  const toggleCombineEvents = usePlaygroundStore(
    (state) => state.toggleCombineEvents,
  );

  const selectedCategories = usePlaygroundStore(
    (state) => state.visibleEventCategories,
  );
  const toggleEventCategory = usePlaygroundStore(
    (state) => state.toggleEventCategory,
  );
  const resetEventCategories = usePlaygroundStore(
    (state) => state.resetEventCategories,
  );

  const visibleEventTypes = useMemo(() => {
    const visibleTypes: Array<AgentEvent["type"]> = [];
    for (const category of selectedCategories) {
      const types = eventCategories[category];
      if (types) {
        visibleTypes.push(...types);
      }
    }
    return visibleTypes;
  }, [selectedCategories]);

  const sortedEvents = useMemo(() => {
    return [...events]
      .filter((event) => visibleEventTypes.includes(event.type))
      .sort((a, b) => {
        // Handle case where timestamps might be invalid
        try {
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        } catch (e) {
          return 0;
        }
      });
  }, [events, visibleEventTypes]);

  // console.log("shownEvents", shownEvents);
  return (
    <div>
      <div className="grid items-center grid-cols-[1fr_auto] gap-2 border-b border-border pb-4 mb-2">
        {/* <span className="text-muted-foreground">
          Showing ({shownEvents.length} of {rawEvents.length} events)
        </span> */}
        <div className="flex items-center gap-2">
          Filter:
          <FpDropdownMenu>
            <FpDropdownMenuTrigger
              className={cn(
                "flex",
                "items-center",
                "gap-2",
                "h-min",
                "hover:bg-muted",
                "data-[state=open]:bg-muted",
                "rounded-sm",
                // "w-full",
                "group/dropdown",
              )}
            >
              <div className="grow-1 w-full text-start text-sm text-muted-foreground px-2">
                {"Event categories"}
              </div>
              <CaretSortIcon className="w-3 h-3 mr-1 flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-data-[state=open]/dropdown:opacity-100" />
            </FpDropdownMenuTrigger>
            <FpDropdownMenuPortal>
              <FpDropdownMenuContent align="start">
                {AllEventCategories.map((category) => (
                  <FpDropdownMenuCheckboxItem
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleEventCategory(category)}
                    key={category}
                  >
                    {category}
                  </FpDropdownMenuCheckboxItem>
                ))}
                <FpDropdownMenuSeparator />
                <FpDropdownMenuItem onChange={() => resetEventCategories()}>
                  default
                </FpDropdownMenuItem>
              </FpDropdownMenuContent>
            </FpDropdownMenuPortal>
          </FpDropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox is the related input element */}
          <label className="text-muted-foreground text-sm flex items-center gap-1 cursor-pointer hover:text-foreground">
            <Checkbox
              checked={combineEvents}
              onCheckedChange={toggleCombineEvents}
            />
            Merge events
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
          {events.length === 0
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
