import { useQuery } from "@tanstack/react-query";
import type { Tool, Resource, MCPPrompt } from "@modelcontextprotocol/sdk/types.js";

export interface ServerData {
  tools: Tool[];
  resources: Resource[];
  prompts: MCPPrompt[];
}

export type MCPData = ServerData[];

export function useAgentMCP(namespace: string, instance: string) {
  return useQuery({
    queryKey: ["agent_mcp", namespace, instance],
    queryFn: async () => {
      const response = await fetch(`/agents/${namespace}/${instance}/admin/mcp`);
      const result = await response.json();
      return result.data as MCPData;
    },
  });
} 
