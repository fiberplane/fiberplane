import { AgentsSidebar } from "@/components/AgentsSidebar";
import { Layout } from "@/components/Layout";
import { ListSection } from "@/components/ListSection";
import { Button } from "@/components/ui/button";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import { Route as RootRoute } from "@/routes/__root";
import type { ListAgentsResponse } from "@/types";
import {
  Link,
  Outlet,
  createFileRoute,
  notFound,
  useLoaderData,
  useMatches,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { Box, BoxIcon } from "lucide-react";

export const Route = createFileRoute("/agents/$agentId")({
  component: AgentRoute,
  loader: async ({ params, context }) => {
    const { agentId } = params;

    const agents = await context.queryClient.ensureQueryData(
      listAgentsQueryOptions(),
    );

    const agent = agents.find((a) => a.id === agentId);

    if (!agent) {
      throw notFound();
    }

    return { agent };
  },
  notFoundComponent: () => {
    const router = useRouter();
    return (
      <Layout>
        <div className="h-full grid items-center justify-center">
          <div className="grid gap-2 mx-auto border p-4 rounded-lg max-w-[400px]">
            <h2 className="text-lg font-semibold">Agent Not Found</h2>
            <p className="text-muted-foreground">
              The agent you're looking for does not exist.
            </p>
            <Button variant="outline" onClick={() => router.invalidate()}>
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  },
});

function AgentRoute() {
  const { agentId } = useParams({ from: "/agents/$agentId" });
  const { agent } = useLoaderData({ from: "/agents/$agentId" });
  const matches = useMatches();
  const isInstanceRouteActive = matches.some(
    (match) => match.routeId === "/agents/$agentId/$instanceId",
  );

  return (
    <Layout>
      <div className="h-full">
        {/* Outlet will render the child route if it's active */}
        <Outlet />
        {/* Show agent details when the instance route is not active */}
        {!isInstanceRouteActive && (
          <div className="h-full grid items-center justify-center">
            <div className="grid gap-4 max-w-prose mx-auto border rounded-lg p-4 m-4">
              <h2 className="text-lg ">Active instances</h2>
              <p className="text-muted-foreground">
                An active instance is an instance of the agent that is currently
                running. In order to view the details of an agent, you must
                select one.
              </p>
              <div>Detected instances: </div>

              {agent.instances.length ? (
                <div className="flex gap-2">
                  {agent.instances.map((instance) => (
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
        )}
      </div>
    </Layout>
  );
}
