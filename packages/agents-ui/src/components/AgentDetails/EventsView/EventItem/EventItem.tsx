import { useTimeAgo } from "@/hooks";
import { cn } from "@/lib/utils";
import type { DiscriminatedSubset, UIAgentEvent } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Globe,
  Info,
  LayoutDashboard,
  Phone,
  PhoneOff,
  RadioTower,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../ui/badge";
import { EventItemDetails } from "./EventItemDetails";
import { EventSummary } from "./EventSummary";

// Get an icon based on event type
const getEventIcon = (type: UIAgentEvent["type"]) => {
  switch (type) {
    case "http_request":
      return (
        <div className="relative">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <ArrowLeft className="w-2.5 h-2.5 absolute bottom-[5px] -right-1 text-foreground" />
        </div>
      );
    case "http_response":
      return (
        <div className="relative">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <ArrowRight className="w-2.5 h-2.5 absolute bottom-[5px] -right-1 text-foreground" />
        </div>
      );
    case "ws_send":
      return (
        <div className="relative" title="Websocket message sent to client">
          <div className="relative" title="WebSocket message received">
            <Phone className="w-3.5 h-3.5 text-muted-foreground -ml-0.5" />
            <ArrowRight className="w-2.5 h-2.5 absolute bottom-[5px] -right-1 text-foreground" />
          </div>
        </div>
      );

    case "ws_message":
      return (
        <div className="relative" title="WebSocket message received">
          <Phone className="w-3.5 h-3.5 text-muted-foreground -ml-0.5" />
          <ArrowLeft className="w-2.5 h-2.5 absolute bottom-[5px] -right-1 text-foreground" />
        </div>
      );

    case "ws_open":
      return <Phone className="w-3.5 h-3.5 text-foreground" />;
    case "ws_close":
      return <PhoneOff className="w-3.5 h-3.5 text-foreground" />;
    case "broadcast":
    case "combined_event":
      return (
        <div title="Broadcast are sent to all connected clients">
          <RadioTower className="w-3.5 h-3.5 text-foreground" />
        </div>
      );
    case "state_change":
      return <LayoutDashboard className="w-3.5 h-3.5 text-foreground" />;
    case "stream_open":
    case "stream_close":
      return <ArrowRight className="w-3.5 h-3.5 text-foreground" />;
    case "stream_error":
      return <AlertCircle className="w-3.5 h-3.5 text-foreground" />;
    default:
      return <Info className="w-3.5 h-3.5 text-foreground" />;
  }
};

// Get a color variant based on event type
const getEventVariant = (
  type: UIAgentEvent["type"],
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
export const EventItem = ({ event }: { event: UIAgentEvent }) => {
  const formattedDate = useTimeAgo(event.timestamp);
  const props = {
    type: event.type,
    payload: event.payload,
  } as DiscriminatedSubset<UIAgentEvent, "type" | "payload">;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="@container/event">
      <div
        className={cn(
          "bg-muted/20",
          "border @xl/event:border-0 border-border rounded-lg",
          "flex flex-col gap-1 @xl/event:gap-y-0",
        )}
      >
        <button
          className={cn(
            "grid grid-cols-1 gap-x-1 @xl/event:gap-y-0",
            "[grid-template-areas:'badge_badge_time'_'summary_summary_summary']",
            "@xl/event:[grid-template-areas:'badge_summary_time']",
            "@xl/event:grid-cols-[auto_1fr_auto]",
            "hover:bg-muted",
            "py-2 pr-2",
            "text-start",
            "items-center",
            "rounded-lg",
            "@xl/event:p-0",
            "@xl/event:pr-2",
            "cursor-pointer",
          )}
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          <div className="[grid-area:badge] grid">
            <div className="w-fit px-2 py-1 flex items-center gap-1">
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
            <EventSummary {...props} />
          </div>
        </button>
        {expanded && (
          <div className="px-2.5">
            <EventItemDetails event={event} />
          </div>
        )}
      </div>
    </div>
  );
};
