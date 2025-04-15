import { useAIGatewayLogs } from "@/hooks";
import type { AgentInstanceParameters } from "@/types";
import { AIGatewayLogItem } from "./AIGatewayLogitem";

export function AIGatewayLogList(
  props: AgentInstanceParameters & { gatewayId: string },
) {
  const { namespace, instance, gatewayId } = props;
  const {
    data: logs,
    error,
    isLoading,
    isFetching,
  } = useAIGatewayLogs(namespace, instance, gatewayId, 1, 10);

  if (isLoading || isFetching) {
    return <div className="py-2">Loading...</div>;
  }

  if (error) {
    return <div className="py-2">Error: {error.message}</div>;
  }

  if (!logs) {
    return <div className="py-2">No logs found</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-gray-400 text-left text-sm flex flex-col gap-3">
        <ol className="flex flex-col gap-2">
          {logs.map((log) => (
            <li key={log.id}>
              <AIGatewayLogItem {...props} log={log} />
            </li>
          ))}
        </ol>
        <p className="text-gray-400 text-sm pb-3">{logs.length} logs found</p>
      </div>
    </div>
  );
}
