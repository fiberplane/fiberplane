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
  ArrowLeft,
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
import {
  CaretDownIcon,
  CaretRightIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { Separator } from "../ui/separator";

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
const ExpandableJSONViewer = ({
  data,
  label = "Raw Data",
  className,
}: { data: unknown; label?: string; className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

      {isExpanded && <JSONViewer data={data} className="mt-2" />}
    </div>
  );
};
const JSONViewer = ({
  data,
  className,
}: { data: unknown; label?: string; className?: string }) => {
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  }, [data]);

  return (
    <div className={cn("font-mono text-xs pl-2 border rounded-lg", className)}>
      <CodeMirrorJsonEditor
        onChange={noop}
        readOnly
        value={jsonString}
        minHeight="auto"
      />
    </div>
  );
};

// Get an icon based on event type
const getEventIcon = (type: CombinedEvent["type"] | AgentEventType) => {
  switch (type) {
    case "http_request":
      return (
        <div className="relative">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <ArrowLeft className="w-3 h-3 absolute -bottom-1 -right-1" />
        </div>
      );
    case "ws_send":
      return <PhoneOutgoing className="w-3.5 h-3.5" />;
    case "ws_message":
      return <PhoneIncoming className="w-3.5 h-3.5" />;
    case "ws_open":
      return <Phone className="w-3.5 h-3.5" />;
    case "ws_close":
      return <PhoneOff className="w-3.5 h-3.5" />;
    case "broadcast":
    case "combined_event":
      return <RadioTower className="w-3.5 h-3.5" />;
    case "state_change":
      return <LayoutDashboard className="w-3.5 h-3.5" />;
    case "stream_open":
    case "stream_close":
      return <ArrowRight className="w-3.5 h-3.5" />;
    case "stream_error":
      return <AlertCircle className="w-3.5 h-3.5" />;
    default:
      return <Info className="w-3.5 h-3.5" />;
  }
};

// Get a color variant based on event type
const getEventVariant = (
  type: CombinedEvent["type"] | AgentEventType,
): "default" | "outline" | "secondary" | "destructive" | "muted" => {
  switch (type) {
    case "http_request":
      return "secondary";
    case "stream_error":
      return "destructive";
    case "ws_message":
    case "ws_open":
    case "ws_close":
    case "state_change":
      return "muted";
    default:
      return "muted";
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
    }
  } catch (e) {
    console.error("Error parsing payload:", e);
  }

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="@container/event">
      <div
        className={cn(
          "p-3 @xl/event:p-0 grid",
          "bg-muted/20",
          "border @xl/event:border-0 border-border rounded-lg",
          "grid-cols-1 gap-1 @xl/event:gap-y-0",
          "[grid-template-areas:'badge_badge_time'_'summary_summary_summary'_'details_details_details']",
          "@xl/event:[grid-template-areas:'badge_summary_time'_'details_details_details']",
          "@xl/event:grid-cols-[auto_1fr_auto]",
          "items-center",
        )}
      >
        <div className="[grid-area:badge] grid">
          <div className="w-fit px-2 py-1 mt-0.5 flex items-center gap-1">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <CaretDownIcon className="w-3 h-3" />
              ) : (
                <CaretRightIcon className="w-3 h-3" />
              )}
            </Button>
            <Badge
              variant={getEventVariant(event.type)}
              className="flex items-center gap-1 py-1 px-1 opacity-80 text-xs font-normal"
              title={event.type}
            >
              {getEventIcon(event.type)}
              <span className="@xl/event:hidden hidden @xs/event:block">
                {event.type}
              </span>
            </Badge>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground justify-end [grid-area:time] gap-2">
          <Clock className="w-3.5" />
          {formattedDate}
        </div>

        <div className="[grid-area:summary] ml-2.5 @xl/event:ml-0">
          <EventSummary type={event.type} payload={event.payload} />
        </div>

        {expanded && (
          <JSONViewer data={payload} className="[grid-area:details] py-1" />
        )}
      </div>
    </div>
  );
};

export function EventsView(props: { namespace: string; instance: string }) {
  const resetAgentInstanceEvents = usePlaygroundStore(
    (state) => state.resetAgentInstanceEvents,
  );

  const connectionStatus = usePlaygroundStore((state) => {
    const agentState = state.agentsState[props.namespace];
    const instanceDetails = agentState?.instances[props.instance];
    return instanceDetails?.eventStreamStatus ?? "connecting";
  });
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

  const unselectAllEventCategories = usePlaygroundStore(
    (state) => state.unselectAllEventCategories,
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

  return (
    <div>
      <div className="grid items-center grid-cols-[1fr_auto] gap-2 border-b border-border pb-4 mb-2">
        <div className="flex gap-2 items-center">
          <span
            className={cn(
              "inline-block w-3 h-3 rounded-full",
              connectionStatus === "open" ? "bg-success" : "bg-danger",
            )}
          />
          <span className="text-sm text-muted-foreground">
            {connectionStatus === "connecting"
              ? "Connecting to agent..."
              : connectionStatus === "open"
                ? "Connected to agent"
                : "Disconnected from agent"}
          </span>
        </div>
        <div className="flex items-center gap-2">
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
                    Default events
                  </FpDropdownMenuItem>
                  <FpDropdownMenuItem
                    onChange={() => unselectAllEventCategories()}
                  >
                    Hide all events
                  </FpDropdownMenuItem>
                </FpDropdownMenuContent>
              </FpDropdownMenuPortal>
            </FpDropdownMenu>
          </div>
          <div>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox is the related input element */}
            <label className="text-muted-foreground text-sm flex items-center gap-1 cursor-pointer hover:text-foreground">
              <Checkbox
                checked={combineEvents}
                onCheckedChange={toggleCombineEvents}
              />
              Merge events
            </label>
          </div>
          <Separator orientation="vertical" className="h-4" />
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
        <div className="space-y-1">
          {sortedEvents.map((event, idx) => (
            <EventItem key={`${event.id}`} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
