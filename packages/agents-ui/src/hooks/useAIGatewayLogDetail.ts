import { getApiBasePath } from "@/lib/utils";
import type { LogGetResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAIGatewayLogDetail(
  namespace: string,
  instance: string,
  gatewayId: string,
  logId: string,
) {
  const basePrefix = getApiBasePath();
  return useQuery({
    queryKey: ["ai_gateways", namespace, instance, gatewayId, "logs", logId],
    queryFn: () =>
      fetch(
        `${basePrefix}/agents/${namespace}/${instance}/admin/ai-gateways/${gatewayId}/logs/${logId}`,
      ).then((res) => res.json() as Promise<LogGetResponse>),
  });
}
