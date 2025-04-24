import { HttpError } from "@/errors";
import { parseOptions } from "@/lib/utils";
import type { ListAgentsResponse } from "@/types";
import { queryOptions, useQuery } from "@tanstack/react-query";

/**
 * Returns the base path for API requests based on the mounted path
 */
function getApiBasePath(): string {
  // If we're running in dev mode directly, there's no need to add the base path
  if (import.meta.env.DEV) {
    return "";
  }

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    return "/fp"; // Fallback to default
  }

  const { mountedPath } = parseOptions(rootElement);
  return mountedPath;
}

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
