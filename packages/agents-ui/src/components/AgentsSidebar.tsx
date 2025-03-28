import { useListAgents } from "@/hooks/useListAgents";
import { cn } from "@/lib/utils";
import type { ListAgentsResponse } from "@/types";
import { useMinimumLoadingRefetch } from "@/useMinimumLoadingRefetch";
import { Link, useMatches } from "@tanstack/react-router";
import { Box, Cpu } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { ListSection } from "./ListSection";
import { Spinner } from "./Spinner";
import { Button } from "./ui/button";

export function AgentsSidebar() {
  // Get route data directly
  const matches = useMatches();

  // Get params from the route
  const agentId = matches.find(
    (match) =>
      match.routeId === "/agents/$agentId" ||
      match.routeId === "/agents/$agentId/$instanceId",
  )?.params.agentId;

  const instanceId = matches.find(
    (match) => match.routeId === "/agents/$agentId/$instanceId",
  )?.params.instanceId;

  // Fetch agents data directly
  const { data, refetch: rawRefetch } = useListAgents();
  const [refetch, isLoading] = useMinimumLoadingRefetch(rawRefetch, 500);

  if (!data) {
    return (
      <ListSection title={<h2 className="text-xl">Agents</h2>}>
        <div className="w-full grid place-items-center h-full">
          <Spinner spinning={true} />
        </div>
      </ListSection>
    );
  }

  return (
    <ListSection
      title={
        <div className="grid grid-cols-[1fr_auto] items-center">
          <h2 className="text-xl"> Agents</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            disabled={isLoading}
          >
            <Spinner spinning={isLoading} />
          </Button>
        </div>
      }
    >
      <div className="w-full grid gap-2 h-full">
        {data.map((item) => (
          <Fragment key={item.id}>
            <Link
              to="/agents/$agentId"
              params={{ agentId: item.id }}
              className={cn(
                "flex justify-start px-2 py-2 font-medium text-sm rounded-md items-center",
                !instanceId && item.id === agentId ? "bg-muted" : "",
                "hover:bg-muted/50",
              )}
            >
              <Cpu className="w-3.5 h-3.5 mr-2" />
              {item.id}
            </Link>
            {item.instances.length > 0 && (
              <div className="ml-4 pl-2">
                {item.instances.map((instanceItem, index) => (
                  <div
                    key={instanceItem}
                    className={`relative ${index !== item.instances.length - 1 ? "mb-1" : ""} flex`}
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-px bg-gray-300"
                      style={{
                        bottom: index === item.instances.length - 1 ? "50%" : 0,
                      }}
                    />
                    <div className="relative top-[18px] w-2 h-px bg-gray-300" />

                    <Link
                      to="/agents/$agentId/$instanceId"
                      params={{ agentId: item.id, instanceId: instanceItem }}
                      className={cn(
                        "flex justify-start px-4 w-full py-2 rounded-md items-center",
                        instanceItem === instanceId ? "bg-muted" : "",
                        "hover:bg-muted/50",
                      )}
                    >
                      <Box className="w-3.5 h-3.5 mr-2" />
                      {instanceItem}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </ListSection>
  );
}
