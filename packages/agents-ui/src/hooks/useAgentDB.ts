import type { DatabaseResult } from "@/types";
import {
  type QueryObserverOptions,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

export function agentDBQueryOptions(namespace: string, instance: string) {
  return queryOptions<DatabaseResult>({
    queryKey: ["agent_db", namespace, instance],
    queryFn: () =>
      fetch(`/fp/api/agents/${namespace}/${instance}/admin/db`).then((res) =>
        res.json(),
      ),
  });
}

export function useAgentDB(
  namespace: string,
  instance: string,
  options?: Omit<QueryObserverOptions<DatabaseResult>, "queryKey" | "queryFn">,
) {
  return useQuery({
    ...agentDBQueryOptions(namespace, instance),
    ...options,
  });
}
