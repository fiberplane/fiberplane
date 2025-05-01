import { useTimeAgo } from "@/hooks";
import { cn } from "@/lib/utils";
import type { DiscriminatedSubset, UIAgentEvent } from "@/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { EventItemDetails } from "./EventItemDetails";
import { EventSummary } from "./EventSummary";

// Get an icon based on event type
const getEventIcon = (type: UIAgentEvent["type"]) => {
  switch (type) {
    case "request":
      return <ArrowLeft className="w-4 h-4" />;
    case "http_response":
      return <ArrowRight className="w-4 h-4" />;
    case "ws_send":
      return <ArrowRight className="w-4 h-4" />;

    case "ws_message":
      return <ArrowLeft className="w-4 h-4" />;

    case "connect":
      return <ArrowLeft className="w-4 h-4" />;
    case "ws_close":
      return <ArrowLeft className="w-4 h-4" />;
    case "broadcast":
    case "combined_event":
    case "state_change":
      return <ArrowRight className="w-3.5 h-3.5" />;
    case "stream_open":
    case "stream_close":
      return <ArrowRight className="w-3.5 h-3.5" />;
    case "stream_error":
      return <ArrowLeft className="w-3.5 h-3.5" />;
    default:
      return <ArrowRight className="w-3.5 h-3.5" />;
  }
};

function getStatusColor(status: number) {
  const isSuccess = status <= 400;
  const isWarning = status >= 400 && status < 500;
  const isError = status >= 500;

  return cn(
    isSuccess && ["text-success"],
    isWarning && ["text-warning"],
    isError && ["text-danger"],
  );
}

// Single event item component
export const EventItem = ({ event }: { event: UIAgentEvent }) => {
  const formattedDate = useTimeAgo(event.timestamp, {
    fallbackWithDate: true,
    fallbackWithTime: true,
    strict: false,
  });
  const props = {
    type: event.type,
    payload: event.payload,
  } as DiscriminatedSubset<UIAgentEvent, "type" | "payload">;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="@container/event">
      <div
        className={cn(
          "border @xl/event:border-0 border-border",
          "flex flex-col @xl/event:gap-y-0",
        )}
      >
        <button
          className={cn(
            "grid grid-cols-1 gap-x-2 @xl/event:gap-y-0",
            "[grid-template-areas:'badge_badge_time'_'summary_summary_summary']",
            "@xl/event:[grid-template-areas:'badge_summary_time']",
            "@xl/event:grid-cols-[auto_1fr_auto]",
            "hover:bg-muted",
            "py-1.5",
            "px-5",
            "text-start",
            "items-center",
            "cursor-pointer",
            "overflow-hidden", // Added to contain child elements
            "min-w-0", // Ensures grid can shrink below min-content
            {
              "bg-secondary": expanded,
            },
          )}
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          <div className="[grid-area:badge] grid">
            <div className="w-fit px-2 py-1 flex items-center gap-1">
              <div
                className={cn(
                  event.type === "http_response"
                    ? getStatusColor(event.payload.status)
                    : "text-foreground",
                )}
                title={event.type}
              >
                {getEventIcon(event.type)}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground justify-end [grid-area:time] gap-2">
            {formattedDate}
          </div>

          <div className="[grid-area:summary] ml-2.5 @xl/event:ml-0 min-w-0 overflow-hidden">
            <EventSummary {...props} />
          </div>
        </button>
        {expanded && (
          <div className="bg-background">
            <EventItemDetails event={event} />
          </div>
        )}
      </div>
    </div>
  );
};
