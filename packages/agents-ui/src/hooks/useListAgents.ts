import type { ListAgentsResponse } from "@/types";
import { queryOptions, useQuery } from "@tanstack/react-query";

export function useListAgents() {
  return useQuery(listAgentsQueryOptions());
}

export function listAgentsQueryOptions() {
  return queryOptions<ListAgentsResponse>({
    queryKey: ["list_agents"],
    queryFn: () => fetch("/fp/api/agents").then((res) => res.json()),
  });
}
