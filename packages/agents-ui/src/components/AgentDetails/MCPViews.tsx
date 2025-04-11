import type { MCPData } from "@/hooks";
import { cn } from "@/lib/utils";
import { noop } from "@/lib/utils";
import { ChevronDown, ChevronRight, Server } from "lucide-react";
import { useState } from "react";
import { CodeMirrorJsonEditor } from "../CodeMirror";
import { Spinner } from "../Spinner";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// Component for displaying MCP Tools
export function MCPToolsView({
  data,
  isLoading,
}: {
  data?: MCPData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-4 flex items-center gap-2">
        <Spinner spinning={true} />
        <span>Loading MCP tools...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">No MCP tools available.</div>
    );
  }

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">MCP Tools</h2>
      <MCPToolsTable data={data} />
    </div>
  );
}

// Component for displaying MCP Resources
export function MCPResourcesView({
  data,
  isLoading,
}: {
  data?: MCPData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-4 flex items-center gap-2">
        <Spinner spinning={true} />
        <span>Loading MCP resources...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No MCP resources available.
      </div>
    );
  }

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">MCP Resources</h2>
      <MCPResourcesTable data={data} />
    </div>
  );
}

// Component for displaying MCP Prompts
export function MCPPromptsView({
  data,
  isLoading,
}: {
  data?: MCPData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-4 flex items-center gap-2">
        <Spinner spinning={true} />
        <span>Loading MCP prompts...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">No MCP prompts available.</div>
    );
  }

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">MCP Prompts</h2>
      <MCPPromptsTable data={data} />
    </div>
  );
}

// Component for displaying MCP Servers
export function MCPServersView({
  data,
  isLoading,
}: {
  data?: MCPData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-4 flex items-center gap-2">
        <Spinner spinning={true} />
        <span>Loading MCP servers...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">No MCP servers available.</div>
    );
  }

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">MCP Servers</h2>
      <MCPServersGrid data={data} />
    </div>
  );
}

// Helper function to convert any value to a string safely
function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

// Expandable JSON viewer component
function JsonViewer({
  data,
  isExpanded,
  onToggle,
}: {
  data: unknown;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onToggle}
      variant="outline"
      size="icon-xs"
      className="w-[112px] pr-2 pl-1 text-xs relative"
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
        <ChevronDown
          className={cn(
            "h-4 w-4 absolute",
            isExpanded ? "opacity-100" : "opacity-0",
          )}
        />
        <ChevronRight
          className={cn(
            "h-4 w-4 absolute",
            isExpanded ? "opacity-0" : "opacity-100",
          )}
        />
      </div>
      <span className="ml-5">View Details</span>
    </Button>
  );
}

// MCP Tools table component
function MCPToolsTable({ data }: { data: MCPData }) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Flatten tools from all servers
  const allTools = data.flatMap((server) =>
    server.tools.map((tool) => ({
      ...tool,
      serverName: tool.serverName || "Unknown Server",
    })),
  );

  if (allTools.length === 0) {
    return <div className="text-muted-foreground">No tools available</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Server</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[120px]">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allTools.map((tool, index) => {
          // Safely access properties
          const toolObject = tool as Record<string, unknown>;
          const name = safeString(toolObject.name);
          const serverName = safeString(toolObject.serverName);
          const description = safeString(toolObject.description);
          const rowId = `tool-${index}`;
          const isExpanded = expandedRowId === rowId;

          return (
            <>
              <TableRow key={rowId}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell className="max-w-[100px]">
                  <div className="truncate">{serverName}</div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <div className="truncate">
                    {description || "No description"}
                  </div>
                </TableCell>
                <TableCell>
                  <JsonViewer
                    data={tool}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedRowId(isExpanded ? null : rowId)}
                  />
                </TableCell>
              </TableRow>
              {isExpanded && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="p-0">
                    <div className="p-4">
                      <CodeMirrorJsonEditor
                        onChange={noop}
                        readOnly
                        value={JSON.stringify(tool, null, 2)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}

// MCP Resources table component
function MCPResourcesTable({ data }: { data: MCPData }) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Flatten resources from all servers
  const allResources = data.flatMap((server) =>
    server.resources.map((resource) => ({
      ...resource,
      serverName: resource.serverName || "Unknown Server",
    })),
  );

  if (allResources.length === 0) {
    return <div className="text-muted-foreground">No resources available</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Server</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[120px]">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allResources.map((resource, index) => {
          // Safely access properties
          const resourceObject = resource as Record<string, unknown>;
          const name = safeString(resourceObject.name);
          const serverName = safeString(resourceObject.serverName);
          const description = safeString(resourceObject.description);
          const resourceType = safeString(resourceObject.resourceType);
          const rowId = `resource-${index}`;
          const isExpanded = expandedRowId === rowId;

          return (
            <>
              <TableRow key={rowId}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{serverName}</TableCell>
                <TableCell>{resourceType || "Not specified"}</TableCell>
                <TableCell className="max-w-[300px]">
                  <div className="truncate">
                    {description || "No description"}
                  </div>
                </TableCell>
                <TableCell>
                  <JsonViewer
                    data={resource}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedRowId(isExpanded ? null : rowId)}
                  />
                </TableCell>
              </TableRow>
              {isExpanded && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="p-0">
                    <div className="p-4">
                      <CodeMirrorJsonEditor
                        onChange={noop}
                        readOnly
                        value={JSON.stringify(resource, null, 2)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}

// MCP Prompts table component
function MCPPromptsTable({ data }: { data: MCPData }) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Flatten prompts from all servers
  const allPrompts = data.flatMap((server) =>
    server.prompts.map((prompt) => ({
      ...prompt,
      serverName: prompt.serverName || "Unknown Server",
    })),
  );

  if (allPrompts.length === 0) {
    return <div className="text-muted-foreground">No prompts available</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Server</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[120px]">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allPrompts.map((prompt, index) => {
          // Safely access properties
          const promptObject = prompt as Record<string, unknown>;
          const name = safeString(promptObject.name);
          const serverName = safeString(promptObject.serverName);
          const description = safeString(promptObject.description);
          const promptType = safeString(promptObject.promptType);
          const rowId = `prompt-${index}`;
          const isExpanded = expandedRowId === rowId;

          return (
            <>
              <TableRow key={rowId}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{serverName}</TableCell>
                <TableCell>{promptType || "Not specified"}</TableCell>
                <TableCell className="max-w-[300px]">
                  <div className="truncate">
                    {description || "No description"}
                  </div>
                </TableCell>
                <TableCell>
                  <JsonViewer
                    data={prompt}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedRowId(isExpanded ? null : rowId)}
                  />
                </TableCell>
              </TableRow>
              {isExpanded && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="p-0">
                    <div className="p-4">
                      <CodeMirrorJsonEditor
                        onChange={noop}
                        readOnly
                        value={JSON.stringify(prompt, null, 2)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}

// MCP Servers grid component with cards
function MCPServersGrid({ data }: { data: MCPData }) {
  if (data.length === 0) {
    return <div className="text-muted-foreground">No servers available</div>;
  }

  const MAX_ITEMS_TO_DISPLAY = 3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((server, index) => {
        // Get server name from tools, resources, or prompts (in that order)
        let serverName = `Server ${index + 1}`;

        if (server.tools.length > 0 && "serverName" in server.tools[0]) {
          serverName = safeString(server.tools[0].serverName);
        } else if (
          server.resources.length > 0 &&
          "serverName" in server.resources[0]
        ) {
          serverName = safeString(server.resources[0].serverName);
        } else if (
          server.prompts.length > 0 &&
          "serverName" in server.prompts[0]
        ) {
          serverName = safeString(server.prompts[0].serverName);
        }

        const cardId = `server-card-${index}`;
        const toolsToDisplay = server.tools.slice(0, MAX_ITEMS_TO_DISPLAY);
        const hasMoreTools = server.tools.length > MAX_ITEMS_TO_DISPLAY;

        const resourcesToDisplay = server.resources.slice(
          0,
          MAX_ITEMS_TO_DISPLAY,
        );
        const hasMoreResources = server.resources.length > MAX_ITEMS_TO_DISPLAY;

        return (
          <Card key={cardId}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{serverName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-4 text-sm min-h-[14rem]">
              <div className="space-y-4">
                {server.tools.length > 0 && (
                  <div>
                    <h4 className="text-xs text-muted-foreground font-medium mb-2">
                      Tools
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {toolsToDisplay.map((tool, toolIndex) => (
                        <div
                          className="text-xs bg-muted rounded-md px-1 py-0.5 truncate flex items-center max-w-[95%]"
                          key={toolIndex}
                          title={safeString(tool.name)}
                        >
                          {safeString(tool.name)}
                        </div>
                      ))}
                      {hasMoreTools && (
                        <div className="text-xs text-muted-foreground px-1 flex items-center">
                          +{server.tools.length - MAX_ITEMS_TO_DISPLAY} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  {server.resources.length > 0 && (
                    <div>
                      <h4 className="text-xs text-muted-foreground font-medium mb-2">
                        Resources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {resourcesToDisplay.map((resource, resourceIdx) => (
                          <div
                            className="text-xs bg-muted rounded-md px-1 py-0.5 truncate flex items-center max-w-[95%]"
                            key={resourceIdx}
                            title={safeString(resource.name)}
                          >
                            {safeString(resource.name)}
                          </div>
                        ))}
                        {hasMoreResources && (
                          <div className="text-xs text-muted-foreground px-1 flex items-center">
                            +{server.resources.length - MAX_ITEMS_TO_DISPLAY}{" "}
                            more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {server.prompts.length > 0 && (
                    <div>
                      <h4 className="text-xs text-muted-foreground font-medium mb-2">
                        Prompts
                      </h4>
                      <div className="text-lg font-medium">
                        {server.prompts.length}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            {/* CardFooter and expanded view removed for density */}
          </Card>
        );
      })}
    </div>
  );
}
