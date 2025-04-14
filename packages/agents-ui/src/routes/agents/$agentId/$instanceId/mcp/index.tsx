import { Spinner } from "@/components/Spinner";
import { useAgentMCP } from "@/hooks";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import {
  Link,
  createFileRoute,
  notFound,
  useLoaderData,
  useParams,
} from "@tanstack/react-router";

export const Route = createFileRoute("/agents/$agentId/$instanceId/mcp/")({
  component: MCPServersList,
  loader: async ({ params, context }) => {
    // Get route parameters
    const { agentId, instanceId } = params;

    // Access the agents data
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

    return { agent, instanceId };
  },
  pendingComponent: () => (
    <div className="p-4 flex items-center gap-2">
      <Spinner spinning={true} />
      <span>Loading MCP servers list...</span>
    </div>
  ),
});

function MCPServersList() {
  // Get the data from the loader
  const { agent, instanceId } = useLoaderData({
    from: "/agents/$agentId/$instanceId/mcp/",
  });

  const { agentId } = useParams({ from: "/agents/$agentId/$instanceId/mcp/" });

  // Fetch MCP data
  const { data: mcpData, isLoading } = useAgentMCP(agent.id, instanceId);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center gap-2">
        <Spinner spinning={true} />
        <span>Loading MCP servers...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">MCP Servers</h2>
        <div className="grid gap-2">
          {mcpData && mcpData.length > 0 ? (
            mcpData.map((server, idx) => (
              <Link
                key={server.id || idx}
                to="/agents/$agentId/$instanceId/mcp/$serverId"
                params={{
                  agentId,
                  instanceId,
                  serverId: server.id || `server-${idx}`,
                }}
                className="p-3 border rounded-md hover:bg-muted cursor-pointer block"
              >
                <div className="font-medium">
                  {server.name || `Server ${idx + 1}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {server.id || `ID: server-${idx}`}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-muted-foreground">
              No MCP servers available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
