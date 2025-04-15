import type { MCPConnection } from "@/hooks/useAgentMCP";
import { Server } from "lucide-react";
import { Spinner } from "../Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Component for displaying MCP Servers
export function MCPServersView({
  data,
  isLoading,
}: {
  data?: MCPConnection[];
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

// MCP Servers grid component with cards
function MCPServersGrid({ data }: { data: MCPConnection[] }) {
  if (data.length === 0) {
    return <div className="text-muted-foreground">No servers available</div>;
  }

  const MAX_ITEMS_TO_DISPLAY = 3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((server: MCPConnection, index: number) => {
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
                      {toolsToDisplay.map((tool, toolIndex: number) => (
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
                        {resourcesToDisplay.map(
                          (resource, resourceIdx: number) => (
                            <div
                              className="text-xs bg-muted rounded-md px-1 py-0.5 truncate flex items-center max-w-[95%]"
                              key={resourceIdx}
                              title={safeString(resource.name)}
                            >
                              {safeString(resource.name)}
                            </div>
                          ),
                        )}
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

// Helper function to convert any value to a string safely
function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}
