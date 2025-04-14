import type { AIGatewayListResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useListAIGateway(namespace: string, instance: string) {
  return useQuery({
    queryKey: ["ai_gateways", namespace, instance],
    queryFn: () =>
      fetch(`/agents/${namespace}/${instance}/admin/ai-gateways`).then(
        (res) => res.json() as Promise<Array<AIGatewayListResponse>>,
      ),
  });
}
