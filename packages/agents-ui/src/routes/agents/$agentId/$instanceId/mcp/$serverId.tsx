import { JSONViewer } from "@/components/AgentDetails/EventsView/JSONViewer";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { agentMCPQueryOptions } from "@/hooks/useAgentMCP";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { useState } from "react";
import React from "react";

// Define the shape of the items we'll display in the tables
interface TableItem {
  name?: string;
  description?: string | unknown; // Can be string or other types if description is missing/complex
  // Allow any other properties as these items come from an API
  [key: string]: unknown; // Use unknown instead of any for better type safety
}

interface ExpandableTableSectionProps {
  title: string;
  caption?: string;
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
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            <TableHead className="pl-0">Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-muted-foreground text-center"
              >
                No {title.toLowerCase()} available.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              const descriptionText =
                typeof item.description === "string" &&
                item.description.length > 0
                  ? item.description
                  : null;

              return (
                <React.Fragment key={item.name || idx}>
                  <TableRow
                    className={`${
                      isExpanded ? "bg-muted/30 " : ""
                    }cursor-pointer transition-colors hover:bg-muted/20`}
                    onClick={() => onExpand(isExpanded ? null : idx)}
                    tabIndex={0}
                    aria-expanded={isExpanded}
                  >
                    <TableCell className="font-mono align-middle">
                      {item.name || "Unnamed"}
                    </TableCell>
                    <TableCell className="align-middle">
                      <div
                        className="truncate max-w-[320px]"
                        title={descriptionText ?? undefined}
                      >
                        {descriptionText || (
                          <span className="text-muted-foreground">
                            No description
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle w-8 p-0 text-center">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 mx-auto" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 mx-auto" />
                      )}
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

    // Fetch all MCP servers for this agent/instance
    const mcpServers = await context.queryClient.ensureQueryData(
      agentMCPQueryOptions(agentId, instanceId),
    );
    const server = mcpServers?.find(
      (s: { serverId: string }) => s.serverId === serverId,
    );
    if (!server) {
      throw notFound();
    }

    // Return data needed for the MCP server view
    return { agent, instanceId, serverId, server };
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
  const { server } = useLoaderData({
    from: "/agents/$agentId/$instanceId/mcp/$serverId",
  });

  // Copy-to-clipboard state using the custom hook
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const handleCopy = (value: string) => {
    copyToClipboard(value);
  };

  // Expansion state for each table
  const [expandedToolIdx, setExpandedToolIdx] = useState<number | null>(null);
  const [expandedResourceIdx, setExpandedResourceIdx] = useState<number | null>(
    null,
  );
  const [expandedPromptIdx, setExpandedPromptIdx] = useState<number | null>(
    null,
  );

  return (
    <TooltipProvider>
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-base">URL:</span>
            <span className="font-mono text-sm break-all select-all">
              {server.url}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Copy URL"
                  onClick={() => handleCopy(server.url)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {isCopied ? "Copied!" : "Copy URL"}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-base">Server ID:</span>
            <span className="font-mono text-sm break-all select-all">
              {server.serverId}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Copy Server ID"
                  onClick={() => handleCopy(server.serverId)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {isCopied ? "Copied!" : "Copy Server ID"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <ExpandableTableSection
          title="Tools"
          items={server.tools}
          expandedIndex={expandedToolIdx}
          onExpand={setExpandedToolIdx}
        />

        <ExpandableTableSection
          title="Resources"
          items={server.resources}
          expandedIndex={expandedResourceIdx}
          onExpand={setExpandedResourceIdx}
        />

        <ExpandableTableSection
          title="Prompts"
          items={server.prompts}
          expandedIndex={expandedPromptIdx}
          onExpand={setExpandedPromptIdx}
        />
      </div>
    </TooltipProvider>
  );
}
