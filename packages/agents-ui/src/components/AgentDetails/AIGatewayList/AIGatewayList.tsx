import { useListAIGateway } from "@/hooks";
import type { AgentInstanceParameters } from "@/types";
import { AIGatewayListItem } from "./AIGatewayListItem";

export function AIGatewayList(props: AgentInstanceParameters) {
  const { namespace, instance } = props;
  const {
    data: aiGateways,
    error,
    isLoading,
  } = useListAIGateway(namespace, instance);

  if (isLoading) {
    return <div className="py-4 px-5">Loading...</div>;
  }

  if (error) {
    return <div className="py-4 px-5">Error: {error.message}</div>;
  }

  if (!aiGateways) {
    return <div className="py-4 px-5">No AI gateways found</div>;
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      <p className="text-gray-400 text-sm px-5">
        {aiGateways.length} AI gateways found
      </p>
      <div className="text-gray-400 text-left text-sm flex flex-col gap-4 border-t">
        <ol className="flex flex-col">
          {aiGateways.map((gateway) => (
            <li key={gateway.id} className="border-b not-last:border-b-0">
              <AIGatewayListItem
                namespace={namespace}
                instance={instance}
                details={gateway}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
