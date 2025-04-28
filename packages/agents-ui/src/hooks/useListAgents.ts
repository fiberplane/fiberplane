import { HttpError } from "@/errors";
import { getApiBasePath } from "@/lib/utils";
import type { ListAgentsResponse } from "@/types";
import { queryOptions, useQuery } from "@tanstack/react-query";

export function useListAgents() {
  return useQuery(listAgentsQueryOptions());
}

export function listAgentsQueryOptions() {
  const basePrefix = getApiBasePath();
  return queryOptions<ListAgentsResponse>({
    queryKey: ["list_agents"],
    queryFn: () =>
      fetch(`${basePrefix}/api/agents`).then(async (res) => {
        if (!res.ok) {
          let message = res.statusText;
          try {
            message = await res.text();
          } catch (e) {
            // Ignore
          }
          throw new HttpError(message, res.status);
        }

        return res.json();
      }),
  });
}
