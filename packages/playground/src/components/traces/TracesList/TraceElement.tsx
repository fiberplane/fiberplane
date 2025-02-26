import type { RequestInfo } from "@/components/ResponseSummary";
import {
  TimelineListElement,
  extractWaterfallTimeStats,
} from "@/components/Timeline";
import {
  getId,
  getLevelForSpan,
} from "@/components/Timeline/DetailsList/TimelineDetailsList/utils";
import { useAsWaterfall } from "@/components/Timeline/hooks/useAsWaterfall";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMdScreen, useOrphanLogs } from "@/hooks";
import { cn } from "@/lib/utils";
import { isMizuOrphanLog } from "@/traces-interop";
import type { Trace } from "@/types";
import type { SpanWithVendorInfo, Waterfall } from "@/utils";
import {
  getRequestMethod,
  getRequestUrl,
  getStatusCode,
  isIncomingRequestSpan,
} from "@/utils/otel-helpers";
import { useState } from "react";
import { TraceElementHeader } from "./TraceElementHeader";

export function TraceElement({ trace }: { trace: Trace }) {
  const isMdScreen = useIsMdScreen();
  const { traceId, spans } = trace;
  const orphanLogs = useOrphanLogs(traceId, spans ?? []);
  const { waterfall } = useAsWaterfall(spans ?? [], orphanLogs);
  const { minStart, duration } = extractWaterfallTimeStats(waterfall);

  const [showWaterfall, setShowWaterfall] = useState(false);

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

  // HACK - Need a better typesafe way to get the incoming request span
  const incomingRequest = waterfall[0] as SpanWithVendorInfo;

  const withLogs = true;
  return (
    <div className="block px-1">
      <Card className="transition-colors hover:bg-muted/50 rounded-sm border-muted-foreground/30 bg-transparent">
        <CardContent className="p-0 px-1">
          <TraceElementHeader
            level={getLevelForSpan(incomingRequest)}
            attributes={incomingRequest.span.attributes}
            startTime={incomingRequest.span.start_time}
            endTime={incomingRequest.span.end_time}
            id={getId(incomingRequest)}
            timelineVisible={isMdScreen}
            minStart={minStart}
            duration={duration}
            onClickToggle={() => setShowWaterfall(!showWaterfall)}
          />

          {showWaterfall && (
            <div className="pl-8">
              {waterfall.map((item) => {
                const isLog = isMizuOrphanLog(item);
                return (isLog && withLogs && !item.isException) || !isLog ? (
                  <TimelineListElement
                    // Expand the waterfall if there's only one span/log, which shows span details by default
                    defaultExpanded={waterfall.length === 1}
                    item={item}
                    timelineVisible={isMdScreen}
                    key={getId(item)}
                    minStart={minStart}
                    duration={duration}
                  />
                ) : null;
              })}
            </div>
          )}
          <TraceElementFooter trace={trace} waterfall={waterfall} />
        </CardContent>
      </Card>
    </div>
  );
}

function TraceElementFooter({
  trace,
  waterfall,
}: { trace: Trace; waterfall: Waterfall }) {
  const logsCount = waterfall.filter((item) => isMizuOrphanLog(item)).length;
  return (
    <div
      className={cn(
        "flex items-center justify-between text-xs text-muted-foreground py-1 pl-2",
        "border-none",
      )}
    >
      <span>
        {trace.spans.length} {trace.spans.length === 1 ? "span" : "spans"} |{" "}
        {logsCount} {logsCount === 1 ? "log" : "logs"}
      </span>
    </div>
  );
}
