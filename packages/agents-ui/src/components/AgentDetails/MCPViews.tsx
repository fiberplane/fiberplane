import { KeyValueTable } from "../KeyValueTable";
import type { MCPData } from "@/hooks";
import { Spinner } from "../Spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CodeMirrorJsonEditor } from "../CodeMirror";
import { noop } from "@/lib/utils";

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
      <MCPServersTable data={data} />
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
  onToggle 
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
      className="w-auto pr-2 pl-1 text-xs gap-1"
    >
      {isExpanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
      View Details
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
      serverName: tool.serverName || "Unknown Server"
    }))
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
          <TableHead>Details</TableHead>
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
                <TableCell>{serverName}</TableCell>
                <TableCell>{description || "No description"}</TableCell>
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
      serverName: resource.serverName || "Unknown Server"
    }))
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
          <TableHead>Details</TableHead>
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
                <TableCell>{description || "No description"}</TableCell>
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
      serverName: prompt.serverName || "Unknown Server"
    }))
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
          <TableHead>Details</TableHead>
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
                <TableCell>{description || "No description"}</TableCell>
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

// MCP Servers table component
function MCPServersTable({ data }: { data: MCPData }) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  if (data.length === 0) {
    return <div className="text-muted-foreground">No servers available</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Tools</TableHead>
          <TableHead>Resources</TableHead>
          <TableHead>Prompts</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((server, index) => {
          // Get server name from tools, resources, or prompts (in that order)
          let serverName = `Server ${index + 1}`;
          
          if (server.tools.length > 0 && 'serverName' in server.tools[0]) {
            serverName = safeString(server.tools[0].serverName);
          } else if (server.resources.length > 0 && 'serverName' in server.resources[0]) {
            serverName = safeString(server.resources[0].serverName);
          } else if (server.prompts.length > 0 && 'serverName' in server.prompts[0]) {
            serverName = safeString(server.prompts[0].serverName);
          }
          
          const rowId = `server-${index}`;
          const isExpanded = expandedRowId === rowId;
          
          return (
            <>
              <TableRow key={rowId}>
                <TableCell className="font-medium">{serverName}</TableCell>
                <TableCell>{server.tools.length}</TableCell>
                <TableCell>{server.resources.length}</TableCell>
                <TableCell>{server.prompts.length}</TableCell>
                <TableCell>
                  <JsonViewer 
                    data={server} 
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
                        value={JSON.stringify(server, null, 2)}
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
