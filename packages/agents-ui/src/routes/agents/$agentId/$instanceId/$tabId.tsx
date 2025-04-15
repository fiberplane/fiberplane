import {
  ChatMessagesRenderer,
  isMessagesTable,
} from "@/components/AgentDetails/ChatMessageTableView";
import { DataTableView } from "@/components/AgentDetails/DataTableView";
import { MCPServersView } from "@/components/AgentDetails/MCPViews";
import {
  ScheduleColumnsSchema,
  type ScheduleDBTable,
  ScheduleTableView,
} from "@/components/AgentDetails/ScheduleTableView";
import {
  StateTableView,
  isStateTable,
} from "@/components/AgentDetails/StateTableView";
import { Spinner } from "@/components/Spinner";
import { useAgentDB } from "@/hooks/useAgentDB"; // Import hook
import { useAgentMCP } from "@/hooks/useAgentMCP"; // Import hook
import { createFileRoute } from "@tanstack/react-router";

// Map friendly tab IDs back to actual DB table names
const tabToTableMap: Record<string, string | null> = {
  messages: "cf_ai_chat_agent_messages",
  schedule: "cf_agents_schedules",
  state: "cf_agents_state",
  mcp: null, // Represents the MCP tab, not a DB table
};

// Loader only returns tabId
interface AgentTabLoaderData {
  tabId: string;
}

export const Route = createFileRoute("/agents/$agentId/$instanceId/$tabId")({
  component: AgentTabContent,
  loader: async ({ params }): Promise<AgentTabLoaderData> => {
    const { tabId } = params;
    // Loader doesn't need complex validation, component will handle data availability
    return { tabId };
  },
  pendingComponent: () => (
    <div className="p-4 flex items-center gap-2 justify-center">
      <Spinner spinning={true} />
      <span>Loading tab...</span>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-4 border rounded-lg m-4 bg-destructive/10 text-destructive">
      <h2 className="text-lg font-semibold">Error Loading Tab</h2>
      <p>{error instanceof Error ? error.message : "Unknown error"}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-4 border rounded-lg m-4">
      <h2 className="text-lg font-semibold">Tab Not Found</h2>
      <p className="text-muted-foreground">
        The tab '{Route.useParams().tabId}' does not exist or has no data.
      </p>
    </div>
  ),
});

function AgentTabContent() {
  const { tabId } = Route.useLoaderData();
  // Get agentId and instanceId from URL parameters
  const { agentId, instanceId } = Route.useParams();

  // Fetch data directly using hooks
  const { data: db, isLoading: isDbLoading } = useAgentDB(agentId, instanceId);
  const { data: mcpData, isLoading: isMcpLoading } = useAgentMCP(
    agentId,
    instanceId,
  );

  return <div className="p-4 overflow-auto h-full">{renderTabContent()}</div>;

  function renderTabContent() {
    // Handle MCP Tab separately
    if (tabId === "mcp") {
      // Use MCP loading state
      if (isMcpLoading) {
        return (
          <div className="p-4 flex items-center gap-2 justify-center">
            <Spinner spinning={true} />
            <span>Loading MCP data...</span>
          </div>
        );
      }
      return <MCPServersView data={mcpData ?? undefined} isLoading={false} />;
    }

    // Handle DB tabs
    // Use DB loading state
    if (isDbLoading) {
      return (
        <div className="text-muted-foreground flex items-center justify-center h-full">
          Loading database data...
        </div>
      );
    }

    // Check if DB data exists after loading
    if (!db) {
      return (
        <div className="text-muted-foreground flex items-center justify-center h-full">
          Database data not available for this instance.
        </div>
      );
    }

    // Determine the actual table name
    const tableName = tabToTableMap[tabId] ?? tabId;
    const tableData = db[tableName];

    // Handle case where the specific table doesn't exist
    if (!tableData) {
      return (
        <div className="text-muted-foreground flex items-center justify-center h-full">
          No data available for the '{tableName}' table in this instance.
        </div>
      );
    }

    if (isMessagesTable(tableName, tableData)) {
      // tableData is now MessagesTable
      return <ChatMessagesRenderer data={tableData.data} />;
    }

    if (isStateTable(tableName, tableData)) {
      // tableData is now StateDBTable
      return <StateTableView table={tableData} />;
    }

    if (
      tableName === "cf_agents_schedules" &&
      ScheduleColumnsSchema.safeParse(tableData.columns).success
    ) {
      // tableData is now ScheduleDBTable (cast is safe)
      return <ScheduleTableView table={tableData as ScheduleDBTable} />;
    }

    // Fallback for any other DB table type (tableData is base DBTable type)
    return <DataTableView table={tableData} title={tableName} />;
  }
}
