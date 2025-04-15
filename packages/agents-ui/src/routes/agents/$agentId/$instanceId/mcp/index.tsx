import { Spinner } from "@/components/Spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import { agentMCPQueryOptions } from "@/hooks/useAgentMCP";
import {
  Link,
  createFileRoute,
  notFound,
  useLoaderData,
  useParams,
} from "@tanstack/react-router";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/agents/$agentId/$instanceId/mcp/")({
  component: MCPServersList,
  loader: async ({ params, context }) => {
    // Get route parameters
    const { agentId, instanceId } = params;

    // Access the agents data
    const agents = await context.queryClient.ensureQueryData(
      listAgentsQueryOptions()
    );

    // Find the agent by ID
    const agent = agents.find((a) => a.id === agentId);

    if (!agent) {
      throw notFound();
    }

    if (!agent.instances.includes(instanceId)) {
      throw notFound();
    }

    // Fetch MCP servers for this agent/instance
    const mcpServers = await context.queryClient.ensureQueryData(
      agentMCPQueryOptions(agentId, instanceId)
    );

    return { agent, instanceId, mcpServers };
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
  const { instanceId, mcpServers } = useLoaderData({
    from: "/agents/$agentId/$instanceId/mcp/",
  });

  const { agentId } = useParams({ from: "/agents/$agentId/$instanceId/mcp/" });

  return (
    <div className="p-4">
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">MCP Servers</h2>
        <p className="text-sm text-muted-foreground">
          These are the remote MCP servers this agent instance is connected to
          as a client.
        </p>
        <div className="grid gap-2">
          {mcpServers && mcpServers.length > 0 ? (
            mcpServers.map((server, idx) => (
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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium flex items-center">
                      {server.url}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {server.serverId}
                    </div>
                    <div>
                      <TooltipProvider>
                        <div className="flex gap-1">
                          {server.tools && server.tools.length > 0 && (
                            <>
                              {server.tools.slice(0, 3).map((tool, i) => (
                                <Tooltip key={tool.name || i}>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center bg-muted rounded px-1 py-0.5 text-xs font-normal cursor-default">
                                      <Wrench className="w-3 h-3 mr-0.5 text-muted-foreground" />
                                      {tool.name}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={4}>
                                    {tool.description || tool.name}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {server.tools.length > 3 && (
                                <span className="inline-flex items-center bg-muted rounded px-1 py-0.5 text-xs font-normal text-muted-foreground">
                                  +{server.tools.length - 3}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      server.connectionState === "ready"
                        ? "bg-green-100 text-green-800"
                        : server.connectionState === "authenticating"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    title="Connection State"
                  >
                    {server.connectionState}
                  </span>
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
