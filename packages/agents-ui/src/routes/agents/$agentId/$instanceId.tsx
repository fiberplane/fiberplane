import { AgentDetails } from "@/components/AgentDetails";
import { Spinner } from "@/components/Spinner";
import { useAgentInstanceEvents } from "@/hooks";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import type { ListAgentsResponse } from "@/types";
import { createFileRoute, notFound } from "@tanstack/react-router";

interface AgentInstanceLoaderData {
  agent: ListAgentsResponse[number];
  instanceId: string;
}

export const Route = createFileRoute("/agents/$agentId/$instanceId")({
  loader: async ({
    params,
    context: parentContext, // Keep parentContext for queryClient
  }): Promise<AgentInstanceLoaderData> => {
    const { agentId, instanceId } = params;
    const { queryClient } = parentContext;

    // Loader just validates agent/instance and returns basic data
    const agents = await queryClient.ensureQueryData(listAgentsQueryOptions());
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) {
      throw notFound({ data: `Agent ${agentId} not found` });
    }
    if (!agent.instances.includes(instanceId)) {
      throw notFound({
        data: `Instance ${instanceId} not found for ${agentId}`,
      });
    }

    // If a tab was already present or redirect happened, just return agent data
    return { agent, instanceId };
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
