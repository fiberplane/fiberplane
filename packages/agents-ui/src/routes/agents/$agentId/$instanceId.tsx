import { AgentDetails } from "@/components/AgentDetails";
import { Spinner } from "@/components/Spinner";
import { agentDBQueryOptions } from "@/hooks/useAgentDB";
import { agentMCPQueryOptions, type MCPData } from "@/hooks/useAgentMCP";
import { useAgentInstanceEvents } from "@/hooks";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import type { DatabaseResult, ListAgentsResponse } from "@/types";
import type { QueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  notFound,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";

interface AgentInstanceLoaderData {
  agent: ListAgentsResponse[number];
  instanceId: string;
  initialDb: DatabaseResult;
  initialMcpData: MCPData;
}

// Helper constants used in loader, need to be defined or imported
const tableToTabMap: Record<string, string> = {
  cf_ai_chat_agent_messages: "messages",
  cf_agents_schedules: "schedule",
  cf_agents_state: "state",
};

export const Route = createFileRoute("/agents/$agentId/$instanceId")({
  loader: async ({
    params,
    context: parentContext,
    location,
  }): Promise<AgentInstanceLoaderData> => {
    const { agentId, instanceId } = params;
    const { queryClient } = parentContext;

    console.log("Instance Loader Pathname:", location.pathname);

    const agents = await queryClient.ensureQueryData(listAgentsQueryOptions());
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) {
      throw notFound({ data: `Agent ${agentId} not found` });
    }
    if (!agent.instances.includes(instanceId)) {
      throw notFound({ data: `Instance ${instanceId} not found for ${agentId}` });
    }

    const initialDb = await queryClient.ensureQueryData(
      agentDBQueryOptions(agentId, instanceId)
    );
    const initialMcpData = await queryClient.ensureQueryData(
      agentMCPQueryOptions(agentId, instanceId)
    );

    // Determine default tab
    const dbTables = Object.keys(initialDb || {});
    const defaultTab = [
      "state",
      "messages",
      "schedule",
    ].find((tabKey) => {
      const tableName = Object.entries(tableToTabMap).find(
        ([, friendlyName]) => friendlyName === tabKey
      )?.[0];
      return tableName ? dbTables.includes(tableName) : false;
    });

    const firstAvailableTab = defaultTab || (dbTables.length > 0 ? tableToTabMap[dbTables[0]] || dbTables[0] : null) || "mcp";

    // Check if the current path is exactly the instance path (no tab)
    const expectedPath = `/agents/${agentId}/${instanceId}`;
    if (location.pathname === expectedPath || location.pathname === `${expectedPath}/`) {
      console.log(`Redirecting from ${location.pathname} to tab: ${firstAvailableTab}`);
      throw redirect({
        to: "/agents/$agentId/$instanceId/$tabId",
        params: { agentId, instanceId, tabId: firstAvailableTab },
        replace: true,
      });
    }

    return { agent, instanceId, initialDb, initialMcpData };
  },
  component: AgentInstanceRoute,
  pendingComponent: () => (
    <div className="p-4 flex items-center gap-2">
      <Spinner spinning={true} />
      <span>Loading instance details...</span>
    </div>
  ),
  errorComponent: ({ error }) => {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    const notFoundData = (error as ReturnType<typeof notFound>)?.data;
    return (
      <div className="p-4 border rounded-lg m-4 bg-destructive/10 text-destructive">
        <h2 className="text-lg font-semibold">Error Loading Instance</h2>
        <p>{typeof notFoundData === "string" ? notFoundData : message}</p>
      </div>
    );
  },
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
  const { agent, instanceId } = Route.useLoaderData();

  useAgentInstanceEvents(agent.id, instanceId);

  return <AgentDetails agent={agent} instance={instanceId} />;
}
