import { AIGatewayList } from "@/components/AgentDetails/AIGatewayList/AIGatewayList";
import { Spinner } from "@/components/Spinner";
import { listAiGatewayOptions } from "@/hooks";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";

export const Route = createFileRoute("/agents/$agentId/$instanceId/gateways/")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const { agentId, instanceId } = params;

    // Fetch data for the agent and instance
    const gateways = await context.queryClient.ensureQueryData(
      listAiGatewayOptions(agentId, instanceId),
    );

    if (!gateways) {
      throw notFound();
    }

    return { agentId, instanceId, gateways };
  },
  pendingComponent: () => (
    <div className="p-4 flex items-center gap-2">
      <Spinner spinning={true} />
      <span>Loading gateways...</span>
    </div>
  ),
});

function RouteComponent() {
  const { instanceId, agentId } = useLoaderData({
    from: "/agents/$agentId/$instanceId/gateways/",
  });

  return <AIGatewayList instance={instanceId} namespace={agentId} />;
}
