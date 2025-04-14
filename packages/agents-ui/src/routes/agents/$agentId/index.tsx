import { Layout } from "@/components/Layout";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import type { ListAgentsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
  useParams,
} from "@tanstack/react-router";
import { Box, BoxIcon } from "lucide-react";
import { Suspense } from "react";

export const Route = createFileRoute("/agents/$agentId/")({
  component: AgentIndexComponent,
});

function AgentIndexComponent() {
  const { agentId } = useParams({ from: Route.id });
  const matches = useMatches();

  const {
    data: agents,
    isLoading,
    error,
  } = useQuery<ListAgentsResponse>(listAgentsQueryOptions());

  const isChildRouteActive = matches.some((match) => {
    return match.id !== Route.id && match.pathname.startsWith(Route.fullPath);
  });

  if (isChildRouteActive) {
    return (
      <Suspense
        fallback={
          <div className="p-4 flex items-center gap-2">
            <Spinner spinning={true} />
            <span>Loading details...</span>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 flex items-center gap-2">
          <Spinner spinning={true} />
          <span>Loading agent data...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 text-destructive">
          Error loading agent data: {error.message}
        </div>
      </Layout>
    );
  }

  const currentAgent = agents?.find((agent) => agent.id === agentId);

  if (!currentAgent) {
    return (
      <div className="p-4 text-muted-foreground">Agent details not found.</div>
    );
  }

  return (
    <div className="h-full grid items-center justify-center">
      <div className="grid gap-4 max-w-prose mx-auto border rounded-lg p-4 m-4">
        <h2 className="text-lg ">Active instances</h2>
        <p className="text-muted-foreground">
          An active instance is an instance of the agent that is currently
          running. In order to view the details of an agent, you must select
          one.
        </p>
        <div>Detected instances: </div>

        {currentAgent.instances && currentAgent.instances.length > 0 ? (
          <div className="flex gap-2">
            {currentAgent.instances.map((instance) => (
              <Link
                key={instance}
                to="/agents/$agentId/$instanceId"
                params={{ agentId, instanceId: instance }}
              >
                <Button
                  type="button"
                  size="sm"
                  className="bg-info/15 hover:bg-info/35"
                >
                  <BoxIcon className="w-3.5 h-3.5" />
                  {instance}
                </Button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center mx-auto">
            <em className="text-foreground italic font-normal mb-1 flex items-center justify-center">
              <Box className="w-4 h-4 mr-2" />
              No instances detected yet.
            </em>
            Please make a request to the agent to start an instance.
          </div>
        )}
      </div>
    </div>
  );
}
