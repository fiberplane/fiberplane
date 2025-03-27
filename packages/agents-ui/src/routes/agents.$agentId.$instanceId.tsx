import {
  createFileRoute,
  useParams,
  useLoaderData,
  notFound,
} from "@tanstack/react-router";
import { AgentDetails } from "@/components/AgentDetails";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import type { ListAgentsResponse } from "@/types";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/agents/$agentId/$instanceId")({
  component: AgentInstanceRoute,
  loader: async ({ params, context }) => {
    // Get route parameters
    const { agentId, instanceId } = params;

    // Access the same data that the root loader loads
    const agents = await context.queryClient.ensureQueryData(
      listAgentsQueryOptions(),
    );

    // Find the agent by ID
    const agent = agents.find((a) => a.id === agentId);

    // If agent doesn't exist, throw a not found error
    if (!agent) {
      throw notFound();
    }

    // Ensure the instance exists in the agent's instances
    if (!agent.instances.includes(instanceId)) {
      throw notFound();
    }

    // Return both the agent and instanceId
    return { agent, instanceId };
  },
  pendingComponent: () => (
    <div className="p-4 flex items-center gap-2">
      <Spinner spinning={true} />
      <span>Loading instance details...</span>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-4 border rounded-lg m-4">
      <h2 className="text-lg font-semibold">Instance Not Found</h2>
      <p className="text-muted-foreground">
        The instance you're looking for does not exist or is no longer active.
      </p>
    </div>
  ),
});

function AgentInstanceRoute() {
  // Get the data from the loader
  const { agent, instanceId } = useLoaderData({
    from: "/agents/$agentId/$instanceId",
  });

  // Render just the agent details component as we're already in the layout from the parent route
  return <AgentDetails agent={agent} instance={instanceId} />;
}
