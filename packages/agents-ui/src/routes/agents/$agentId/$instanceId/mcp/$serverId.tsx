import { Spinner } from "@/components/Spinner";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";
import { useAgentMCP } from "@/hooks/useAgentMCP";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useState } from "react";
import React from "react";
import { Copy, ChevronDown, ChevronRight } from "lucide-react";
import { JSONViewer } from "@/components/AgentDetails/EventsView/JSONViewer";

// Define the shape of the items we'll display in the tables
interface TableItem {
  name?: string;
  description?: string | unknown; // Can be string or other types if description is missing/complex
  // Allow any other properties as these items come from an API
  [key: string]: unknown; // Use unknown instead of any for better type safety
}

interface ExpandableTableSectionProps {
  title: string;
  caption: string;
  items: TableItem[];
  expandedIndex: number | null;
  onExpand: (index: number | null) => void;
}

function ExpandableTableSection({
  title,
  caption,
  items,
  expandedIndex,
  onExpand,
}: ExpandableTableSectionProps): React.ReactNode {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <Table>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground text-center">
                No {title.toLowerCase()} available.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              const descriptionText = typeof item.description === "string" && item.description.length > 0
                ? item.description
                : null;

              return (
                <React.Fragment key={item.name || idx}>
                  <TableRow
                    className={`${isExpanded ? "bg-muted/30 " : ""}cursor-pointer transition-colors hover:bg-muted/20`}
                    onClick={() => onExpand(isExpanded ? null : idx)}
                    tabIndex={0}
                    aria-expanded={isExpanded}
                  >
                    <TableCell className="align-middle w-8 p-0 text-center">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 mx-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono align-middle">{item.name || "Unnamed"}</TableCell>
                    <TableCell className="align-middle">
                      <div
                        className="truncate max-w-[320px]"
                        title={descriptionText ?? undefined}
                      >
                        {descriptionText || <span className="text-muted-foreground">No description</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={3} className="p-0">
                        <div className="p-4 overflow-x-auto">
                          <JSONViewer data={item} className="border-none" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const Route = createFileRoute(
  "/agents/$agentId/$instanceId/mcp/$serverId",
)({
  component: MCPServerDetails,
  loader: async ({ params, context }) => {
    // Get route parameters
    const { agentId, instanceId, serverId } = params;

    // Access the agents data
    const agents = await context.queryClient.ensureQueryData(
      listAgentsQueryOptions(),
    );

    // Find the agent by ID
    const agent = agents.find((a) => a.id === agentId);

    // If agent doesn't exist, throw a not found error
    if (!agent) {
      throw notFound();
    }

    // Ensure the instance exists in the agent's instances
    if (!agent.instances.includes(instanceId)) {
      throw notFound();
    }

    // Return data needed for the MCP server view
    return { agent, instanceId, serverId };
  },
  pendingComponent: () => (
    <div className="p-4 flex items-center gap-2">
      <Spinner spinning={true} />
      <span>Loading MCP server details...</span>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-4 border rounded-lg m-4">
      <h2 className="text-lg font-semibold">MCP Server Not Found</h2>
      <p className="text-muted-foreground">
        The MCP server you're looking for does not exist.
      </p>
    </div>
  ),
});

function MCPServerDetails() {
  // Get the data from the loader
  const { agent, instanceId, serverId } = useLoaderData({
    from: "/agents/$agentId/$instanceId/mcp/$serverId",
  });

  // Fetch all MCP servers for this agent/instance
  const { data: mcpServers, isLoading, error } = useAgentMCP(agent.id, instanceId);

  // Find the server by serverId
  const server = mcpServers?.find((s) => s.serverId === serverId);

  // Copy-to-clipboard state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1200);
  };

  // Expansion state for each table
  const [expandedToolIdx, setExpandedToolIdx] = useState<number | null>(null);
  const [expandedResourceIdx, setExpandedResourceIdx] = useState<number | null>(null);
  const [expandedPromptIdx, setExpandedPromptIdx] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center gap-2">
        <Spinner spinning={true} />
        <span>Loading MCP server details...</span>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="p-4 border rounded-lg m-4">
        <h2 className="text-lg font-semibold">MCP Server Not Found</h2>
        <p className="text-muted-foreground">
          The MCP server you're looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">URL:</span>
            <span className="font-mono text-sm break-all select-all">{server.url}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="outline"
                  aria-label="Copy URL"
                  onClick={() => handleCopy(server.url, "url")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {copiedField === "url" ? "Copied!" : "Copy URL"}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">Server ID:</span>
            <span className="font-mono text-sm break-all select-all">{server.serverId}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="outline"
                  aria-label="Copy Server ID"
                  onClick={() => handleCopy(server.serverId, "serverId")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {copiedField === "serverId" ? "Copied!" : "Copy Server ID"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Tools Table */}
        <ExpandableTableSection
          title="Tools"
          caption="Tools available on this server."
          items={server.tools}
          expandedIndex={expandedToolIdx}
          onExpand={setExpandedToolIdx}
        />

        {/* Resources Table */}
        <ExpandableTableSection
          title="Resources"
          caption="Resources available on this server."
          items={server.resources}
          expandedIndex={expandedResourceIdx}
          onExpand={setExpandedResourceIdx}
        />

        {/* Prompts Table */}
        <ExpandableTableSection
          title="Prompts"
          caption="Prompts available on this server."
          items={server.prompts}
          expandedIndex={expandedPromptIdx}
          onExpand={setExpandedPromptIdx}
        />
      </div>
    </TooltipProvider>
  );
}
