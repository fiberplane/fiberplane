import type { RequestInfo } from "@/components/ResponseSummary";
import {
  TimelineListElement,
  extractWaterfallTimeStats,
} from "@/components/Timeline";
import { getId } from "@/components/Timeline/DetailsList/TimelineDetailsList/utils";
import { useAsWaterfall } from "@/components/Timeline/hooks/useAsWaterfall";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMdScreen, useOrphanLogs } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Trace } from "@/types";
import {
  getRequestMethod,
  getRequestUrl,
  getStatusCode,
  isIncomingRequestSpan,
} from "@/utils/otel-helpers";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "@tanstack/react-router";

export function TraceElement({ trace }: { trace: Trace }) {
  const isMdScreen = useIsMdScreen();
  const { traceId, spans } = trace;
  const orphanLogs = useOrphanLogs(traceId, spans ?? []);
  const { waterfall } = useAsWaterfall(spans ?? [], orphanLogs);
  const { minStart, duration } = extractWaterfallTimeStats(waterfall);

  // In practice, we should have already filtered these out, but just in case, we do it again here
  const rootSpan = trace.spans.find((span) => isIncomingRequestSpan(span));
  if (!rootSpan) {
    return null;
  }

  const responseStatusCode = getStatusCode(rootSpan) || 200;
  const response: RequestInfo = {
    requestMethod: getRequestMethod(rootSpan) || "GET",
    requestUrl: getRequestUrl(rootSpan) || "",
    responseStatusCode,
  };

  // Skip traces that don't have HTTP info
  if (!response.requestMethod || !response.requestUrl) {
    return null;
  }

  const incomingRequest = waterfall[0];
  return (
    <div className="block px-1">
      <Card className="transition-colors hover:bg-muted/50 rounded-sm border-muted-foreground/30 bg-transparent">
        <CardContent className="p-0 px-1">
          <TimelineListElement
            item={incomingRequest}
            timelineVisible={isMdScreen}
            key={getId(incomingRequest)}
            minStart={minStart}
            duration={duration}
          />
          <div
            className={cn(
              "flex items-center justify-between text-xs text-muted-foreground py-1 pl-2",
              "border-none",
            )}
          >
            <span>
              {trace.spans.length} {trace.spans.length === 1 ? "span" : "spans"}
            </span>
            <span>
              <Link
                to="/traces/$traceId"
                params={{ traceId: trace.traceId }}
                className={cn(
                  "inline-flex items-center gap-0.5",
                  "transition-colors hover:underline hover:text-foreground",
                )}
              >
                View Trace Details{" "}
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
