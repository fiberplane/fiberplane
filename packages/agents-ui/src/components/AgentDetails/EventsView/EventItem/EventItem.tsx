import {
  type AgentEventType,
  type CoreAgentEvent,
  type EventPayload,
  useTimeAgo,
} from "@/hooks";
import { cn } from "@/lib/utils";
import type { AgentEvent, CombinedEvent } from "@/store";
import { MessagePayloadSchema } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Globe,
  Info,
  LayoutDashboard,
  Phone,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  RadioTower,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Method } from "../../../Method";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";
import { ExpandableJSONViewer, JSONViewer } from "../JSONViewer";
import { EventSummary } from "./EventSummary";

// Get an icon based on event type
const getEventIcon = (type: CombinedEvent["type"] | AgentEventType) => {
  switch (type) {
    case "http_request":
      return (
        <div className="relative">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <ArrowLeft className="w-2.5 h-2.5 absolute bottom-[5px] -right-1 text-foreground" />
          {/* <ArrowLeft className="w-3 h-3 absolute -bottom-1 -right-1" /> */}
        </div>
      );
    case "http_response":
      return (
        <div className="relative">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <ArrowRight className="w-3 h-3 absolute -bottom-1 -right-1 text-foreground" />
        </div>
      );
    case "ws_send":
      return <PhoneOutgoing className="w-3.5 h-3.5" />;
    case "ws_message":
      // return <PhoneIncoming className="w-3.5 h-3.5" />;
      return (<div className="relative">
        <Phone className="w-3.5 h-3.5 text-muted-foreground -ml-0.5" />
        <ArrowLeft className="w-2.5 h-2.5 absolute bottom-[5px] -right-1 text-foreground" />
      </div>)

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


// Single event item component
export const EventItem = ({
  event,
}: { event: CoreAgentEvent | CombinedEvent }) => {
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
