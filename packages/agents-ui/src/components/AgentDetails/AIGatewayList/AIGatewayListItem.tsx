import type { AIGatewayListResponse, AgentInstanceParameters } from "@/types";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";
import { AIGatewayLogList } from "./AIGatewayLogList";

export function AIGatewayListItem(
  props: AgentInstanceParameters & {
    details: AIGatewayListResponse;
    isSelected?: boolean;
  },
) {
  const { namespace, instance, details, isSelected } = props;

  const linkProps = isSelected
    ? {
      to: "/agents/$agentId/$instanceId/gateways",
      params: { agentId: namespace, instanceId: instance },
    }
    : {
      to: "/agents/$agentId/$instanceId/gateways/$gatewayId",
      params: {
        agentId: namespace,
        instanceId: instance,
        gatewayId: details.id,
      },
    };

  return (
    <div className="grid grid-cols-1 gap-2.5">
      <Link {...linkProps}>
        <Button size="default" variant="ghost" className="w-full justify-start">
          {isSelected ? (
            <ChevronUp className="w-3.5" />
          ) : (
            <ChevronDown className="w-3.5" />
          )}
          {details.id}
        </Button>
      </Link>

      {isSelected &&
        (details.collect_logs ? (
          <div className="px-5">
            <AIGatewayLogList
              namespace={namespace}
              instance={instance}
              gatewayId={details.id}
            />
          </div>
        ) : (
          <div className="pl-5 pb-5 pt-2 text-center italic">
            This gateway does not collect logs
          </div>
        ))}
    </div>
  );
}
