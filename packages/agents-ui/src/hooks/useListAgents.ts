import type { ListAgentsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useListAgents() {
  return useQuery<ListAgentsResponse>({
    queryKey: ["list_agents"],
    queryFn: () => fetch("/fp-agents/api/agents").then((res) => res.json()),
  });
}
