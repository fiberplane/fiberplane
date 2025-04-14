import type {
  MCPPrompt,
  Resource,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
  type QueryObserverOptions,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

export interface ServerData {
  tools: Tool[];
  resources: Resource[];
  prompts: MCPPrompt[];
}

export type MCPData = ServerData[];

export function agentMCPQueryOptions(namespace: string, instance: string) {
  return queryOptions<MCPData>({
    queryKey: ["agent_mcp", namespace, instance],
    queryFn: async () => {
      const response = await fetch(
        `/agents/${namespace}/${instance}/admin/mcp`
      );
      // TODO: Consider adding error handling for non-ok responses
      const result = await response.json();
      return result.data as MCPData;
    },
  });
}

// Update hook to accept query options
export function useAgentMCP(
  namespace: string,
  instance: string,
  options?: Omit<QueryObserverOptions<MCPData>, "queryKey" | "queryFn">
) {
  return useQuery({
    ...agentMCPQueryOptions(namespace, instance),
    ...options, // Spread additional options (like initialData)
  });
}
