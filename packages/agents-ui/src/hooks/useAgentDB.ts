import type { DatabaseResult } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAgentDB(namespace: string, instance: string) {
  return useQuery({
    queryKey: ["agent_db", namespace, instance],
    queryFn: () =>
      fetch(`/agents/${namespace}/${instance}/admin/db`).then((res) =>
        res.json(),
      ) as Promise<DatabaseResult>,
  });
}
