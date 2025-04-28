import { getApiBasePath } from "@/lib/utils";
import type { AIGatewayListResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useListAIGateway(namespace: string, instance: string) {
  return useQuery({
    ...listAiGatewayOptions(namespace, instance),
  });
}

export function listAiGatewayOptions(
  namespace: string,
  instance: string,
): {
  queryKey: string[];
  queryFn: () => Promise<Array<AIGatewayListResponse>>;
} {
  const basePrefix = getApiBasePath();

  return {
    queryKey: ["ai_gateways", namespace, instance],
    queryFn: () =>
      fetch(
        `${basePrefix}/agents/${namespace}/${instance}/admin/ai-gateways`,
      ).then((res) => res.json() as Promise<Array<AIGatewayListResponse>>),
  };
}
