import { getApiBasePath } from "@/lib/utils";
import type { LogListResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAIGatewayLogs(
  namespace: string,
  instance: string,
  gatewayId: string,
  page: number,
  pageSize: number,
) {
  const basePrefix = getApiBasePath();
  return useQuery({
    queryKey: [
      "ai_gateways",
      namespace,
      instance,
      gatewayId,
      "logs",
      page,
      pageSize,
    ],
    queryFn: () =>
      fetch(
        `${basePrefix}/agents/${namespace}/${instance}/admin/ai-gateways/${gatewayId}/logs?page=${page}&pageSize=${pageSize}`,
      ).then((res) => res.json() as Promise<Array<LogListResponse>>),
    // keepPreviousData: true,
    // staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
