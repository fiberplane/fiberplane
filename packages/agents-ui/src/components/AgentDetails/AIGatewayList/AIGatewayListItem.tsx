import type { AIGatewayListResponse, AgentInstanceParameters } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { AIGatewayLogList } from "./AIGatewayLogList";

export function AIGatewayListItem(
  props: AgentInstanceParameters & { details: AIGatewayListResponse },
) {
  const { namespace, instance, details } = props;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="grid grid-cols-1">
      <Button
        size="default"
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-3.5" />
        ) : (
          <ChevronRight className="w-3.5" />
        )}
        {details.id}
      </Button>
      {expanded &&
        (details.collect_logs ? (
          <div className="px-5">
            <AIGatewayLogList
              namespace={namespace}
              instance={instance}
              gatewayId={details.id}
            />
          </div>
        ) : (
          <div className="mt-2 pl-5 py-5 text-center italic">
            This gateway does not collect logs
          </div>
        ))}
    </div>
  );
}
