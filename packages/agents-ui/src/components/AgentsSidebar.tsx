import { useListAgents } from "@/hooks/useListAgents";
import { cn } from "@/lib/utils";
import { useMinimumLoadingRefetch } from "@/useMinimumLoadingRefetch";
import { Link, useMatches } from "@tanstack/react-router";
import { Box, Shapes } from "lucide-react";
import { ListSection } from "./ListSection";
import { Spinner } from "./Spinner";
import Logo from "./logo.svg";
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
    <div className="px-2">
      <div className="grid grid-cols-[1fr_auto] items-center py-1.5 gap-1">
        <div className="w-[128px]">
          <Logo />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={refetch}
          disabled={isLoading}
        >
          <Spinner spinning={isLoading} />
        </Button>
      </div>
      <div className="w-full flex flex-col gap-2 py-2">
        {data.map((item) => (
          <div className="w-full flex flex-col gap-1" key={item.id}>
            <Link
              to="/agents/$agentId"
              params={{ agentId: item.id }}
              className={cn(
                "flex justify-start gap-3 px-2 py-2 font-medium text-sm rounded-md items-center",
                !instanceId && item.id === agentId ? "bg-muted" : "",
                "hover:bg-muted/50",
              )}
            >
              <Shapes className="w-3.5 h-3.5" />
              {item.id}
            </Link>
            {item.instances.length > 0 && (
              <div className="ml-1.5 pl-2">
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
                        "flex justify-start px-2 w-full py-2 rounded-md items-center gap-3",
                        instanceItem === instanceId ? "bg-muted" : "",
                        "hover:bg-muted/50",
                      )}
                    >
                      <Box className="w-3.5 h-3.5" />
                      {instanceItem}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
