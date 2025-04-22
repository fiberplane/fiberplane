import {
  useAIGatewayLogDetail,
  useCost,
  useFormatDuration,
  useTimeAgo,
} from "@/hooks";
import type { AgentInstanceParameters, LogListResponse } from "@/types";
import { Calendar, Clock, FileTextIcon } from "lucide-react";
import { useState } from "react";
import { StatusCode } from "../../StatusCode";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AIGatewayLogItemDetails } from "./AIGatewayLogItemDetails";

export function AIGatewayLogItem(
  props: AgentInstanceParameters & {
    gatewayId: string;
    log: LogListResponse;
  },
) {
  const { log, gatewayId, namespace, instance } = props;

  const {
    data: logDetails,
    error,
    isLoading,
    isFetching,
  } = useAIGatewayLogDetail(namespace, instance, gatewayId, log.id);

  const timeStamp = useTimeAgo(log.created_at, {
    fallbackWithTime: true,
    fallbackWithDate: true,
    strict: false,
  });
  const [expanded, setExpanded] = useState(false);

  const formattedDuration = useFormatDuration(log.duration);
  const latency = useFormatDuration(log.timings.latency);
  const cost = useCost(logDetails?.cost);
  if (isLoading || isFetching) {
    return <div className="py-2 border px-5">Loading...</div>;
  }

  if (error) {
    return <div className="py-2 border px-5">Error: {error.message}</div>;
  }

  if (!logDetails) {
    return <div className="py-2 border px-5">No log details found</div>;
  }

  return (
    <div
      key={log.id}
      className={cn("group group/expanded border rounded-md", {
        "group/expanded": expanded,
      })}
    >
      <div
        className={cn(
          "grid [grid-template-areas:'primary_secondary'_'primaryDetails_secondaryDetails'] gap-y-2.5 gap-x-1",
          "cursor-pointer p-4 px-4 border-border",
          "hover:bg-muted/60",
          {
            "border-b bg-muted/50": expanded,
          },
        )}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
      >
        <div className="flex gap-4 items-center text-base">
          <div className="flex gap-2 items-center">
            <Clock className="w-4" />
            {formattedDuration}
          </div>
          <div>
            {log.status_code && (
              <StatusCode
                status={log.status_code}
                isFailure={false}
                className="text-base"
              />
            )}
          </div>
        </div>
        <div className="text-right text-base font-bold">
          {log.provider}/{log.model}
        </div>

        <div className="text-gray-400 text-sm flex items-center gap-2">
          <FileTextIcon className="w-3" />
          {logDetails.tokens_in}
        </div>
        <div
          title={log.created_at}
          className="font-mono flex gap-2 items-center justify-end"
        >
          <Calendar className="w-3" />
          {timeStamp}
        </div>
      </div>

      {expanded && (
        <div className="pt-4">
          <div className="grid-cols-3 gap-2 grid px-4 pb-4 border-b">
            <Card>
              <CardHeader className="text-muted-foreground px-3 pt-4 pb-0">
                Tokens In:
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="flex flex-col">
                  {logDetails.tokens_in ?? <em>Not set</em>}
                  <em className="text-xs text-muted-foreground">
                    Value not always accurate
                  </em>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-muted-foreground px-3 pt-4 pb-0">
                Tokens Out:
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="flex flex-col">
                  {logDetails.tokens_out ?? <em>Not set</em>}
                  <em className="text-xs text-muted-foreground">
                    Value not always accurate
                  </em>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-muted-foreground px-3 pt-4 pb-0">
                Cost
              </CardHeader>
              <CardContent className="flex gap-2 items-center p-3 pt-1">
                <div className="flex flex-col">
                  {cost ?? <em>Not set</em>}
                  <em className="text-xs text-muted-foreground">
                    Value not always accurate
                  </em>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-muted-foreground px-3 pt-4 pb-0">
                Latency:
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="text-sm font-mono">{latency}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-muted-foreground px-3 pt-4 pb-0">
                Cached:
              </CardHeader>
              <CardContent className="flex gap-2 items-center p-3 pt-1">
                {log.cached ? "Yes" : "No"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-muted-foreground px-3 pt-4 pb-0">
                Steps
              </CardHeader>
              <CardContent className="flex gap-2 items-center p-3 pt-1">
                {logDetails.step ?? <em>Not set</em>}
              </CardContent>
            </Card>
          </div>
          <AIGatewayLogItemDetails {...logDetails} />
        </div>
      )}
    </div>
  );
}
