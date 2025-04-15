import type {
  Prompt,
  Resource,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
  type QueryObserverOptions,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

// Local type for a single MCP server, using SDK types for fields
export interface MCPConnection {
  serverId: string;
  url: string;
  connectionState: string;
  tools: Tool[];
  resources: Resource[];
  prompts: Prompt[];
  serverCapabilities?: {
    resources?: object;
    tools?: object;
    [key: string]: unknown;
  };
}


export function agentMCPQueryOptions(namespace: string, instance: string) {
  return queryOptions<MCPConnection[]>({
    queryKey: ["agent_mcp", namespace, instance],
    queryFn: async () => {
      const response = await fetch(
        `/agents/${namespace}/${instance}/admin/mcp`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch MCP data: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data as MCPConnection[];
    },
  });
}

// Update hook to accept query options
export function useAgentMCP(
  namespace: string,
  instance: string,
  options?: Omit<QueryObserverOptions<MCPConnection[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    ...agentMCPQueryOptions(namespace, instance),
    ...options, // Spread additional options (like initialData)
  });
}
