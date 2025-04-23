import { AIGatewayList } from "@/components/AgentDetails/AIGatewayList/AIGatewayList";
import { Spinner } from "@/components/Spinner";
import { listAiGatewayOptions } from "@/hooks";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";

export const Route = createFileRoute(
  "/agents/$agentId/$instanceId/gateways/$gatewayId",
)({
  loader: async ({ params, context }) => {
    const { agentId, instanceId, gatewayId } = params;

    // Fetch data for the agent and instance
    const gateways = await context.queryClient.ensureQueryData(
      listAiGatewayOptions(agentId, instanceId),
    );

    if (
      !gateways ||
      gateways.find((g) => g.id === params.gatewayId) === undefined
    ) {
      throw notFound();
    }

    return { agentId, instanceId, gateways, gatewayId };
  },
  pendingComponent: () => (
    <div className="p-4 flex items-center gap-2">
      <Spinner spinning={true} />
      <span>Loading gateways...</span>
    </div>
  ),

  component: RouteComponent,
});

function RouteComponent() {
  const { instanceId, agentId, gatewayId } = useLoaderData({
    from: "/agents/$agentId/$instanceId/gateways/$gatewayId",
  });

  return (
    <AIGatewayList
      instance={instanceId}
      namespace={agentId}
      gatewayId={gatewayId}
    />
  );
}
