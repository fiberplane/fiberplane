import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import { createFileRoute, notFound, useLoaderData } from "@tanstack/react-router";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/agents/$agentId/$instanceId/mcp/$serverId")({
  component: MCPServerDetails,
  loader: async ({ params, context }) => {
    // Get route parameters
    const { agentId, instanceId, serverId } = params;

    // Access the agents data
    const agents = await context.queryClient.ensureQueryData(
      listAgentsQueryOptions()
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

    // Return data needed for the MCP server view
    return { agent, instanceId, serverId };
  },
  pendingComponent: () => (
    <div className="p-4 flex items-center gap-2">
      <Spinner spinning={true} />
      <span>Loading MCP server details...</span>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-4 border rounded-lg m-4">
      <h2 className="text-lg font-semibold">MCP Server Not Found</h2>
      <p className="text-muted-foreground">
        The MCP server you're looking for does not exist.
      </p>
    </div>
  ),
});

function MCPServerDetails() {
  // Get the data from the loader
  const { agent, instanceId, serverId } = useLoaderData({
    from: "/agents/$agentId/$instanceId/mcp/$serverId",
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">MCP Server: {serverId}</h2>
      <div className="grid gap-4">
        <p>Agent: {agent.id}</p>
        <p>Instance: {instanceId}</p>
        <p>Server ID: {serverId}</p>
        {/* Add more server-specific UI here */}
      </div>
    </div>
  );
}