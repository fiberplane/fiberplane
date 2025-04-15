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

    if (!agent) {
      throw notFound();
    }

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
                key={server.serverId}
                to="/agents/$agentId/$instanceId/mcp/$serverId"
                params={{
                  agentId,
                  instanceId,
                  serverId: server.serverId,
                }}
                className="p-3 border rounded-md hover:bg-muted cursor-pointer block"
              >
                <div className="font-medium">
                  {`Server ${idx + 1}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {server.serverId}
                </div>
                <div className="text-xs text-muted-foreground break-all">
                  {server.url}
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    server.connectionState === "connected"
                      ? "bg-green-100 text-green-800"
                      : server.connectionState === "authenticating"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  title="Connection State"
                >
                  {server.connectionState}
                </span>
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
