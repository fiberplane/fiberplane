import { useAgentDB, useAgentMCP, useFilteredEvents } from "@/hooks";
import { cn } from "@/lib/utils";
import { type SSEStatus, usePlaygroundStore } from "@/store";
import type { AgentInstanceParameters, ListAgentsResponse } from "@/types";
import { Link, Outlet, useMatches } from "@tanstack/react-router";
import {
  Code2,
  FileText,
  FolderTree,
  ListCheck,
  MessagesSquare,
  ChevronRight,
  Database,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { KeyValueTable } from "../KeyValueTable";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { FpTabs, FpTabsContent, FpTabsList, FpTabsTrigger } from "../ui/tabs";
import { EventsView } from "./EventsView";
import { NavTabs } from "./NavTabs";

// Tab ordering preference
export const TAB_ORDER = ["state", "messages", "schedule", "mcp"];

// Map DB table names to friendly tab IDs
export const tableToTabMap: Record<string, string> = {
  cf_ai_chat_agent_messages: "messages",
  cf_agents_schedules: "schedule",
  cf_agents_state: "state",
};

// Map friendly tab IDs to titles for display
export const tabTitleMap: Record<string, string> = {
  messages: "Messages",
  schedule: "Schedule",
  state: "State",
  mcp: "Servers (MCP)",
};

function TabIcon({ tabId }: { tabId: string }) {
  switch (tabId) {
    case "messages":
      return <MessagesSquare className="w-4 h-4" />;
    case "schedule":
      return <ListCheck className="w-4 h-4" />;
    case "state":
      return <FolderTree className="w-4 h-4" />;
    case "mcp":
      return <Code2 className="w-4 h-4" />;
    default:
      return <Database className="w-4 h-4" />;
  }
}

// Dedicated component for MCP breadcrumb label
function McpBreadcrumbLabel({
  parentLabel,
  nestedLabel,
  onParentClick,
}: {
  parentLabel: string;
  nestedLabel: string;
  onParentClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="truncate max-w-[10em] cursor-pointer"
        tabIndex={onParentClick ? 0 : undefined}
        role={onParentClick ? "button" : undefined}
        aria-label={onParentClick ? `Go to ${parentLabel}` : undefined}
      >
        {parentLabel}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
      <span
        className="truncate max-w-[14em] text-muted-foreground"
        title={nestedLabel}
      >
        {nestedLabel}
      </span>
    </span>
  );
}

export function AgentDetails({
  agent: agentDetails,
  instance,
}: {
  agent: ListAgentsResponse[0];
  instance: string;
}) {
  const matches = useMatches();

  // Find the match for the tab route and extract tabId
  const tabRouteMatch = matches.find(
    (match) => match.routeId === "/agents/$agentId/$instanceId/$tabId",
  );
  let tabId = tabRouteMatch?.params.tabId as string | undefined;

  // Use TanStack Router routeId matching for MCP subroutes
  const mcpServerMatch = matches.find(
    (match) => match.routeId === "/agents/$agentId/$instanceId/mcp/$serverId",
  );
  const isMcpRoute = matches.some(
    (match) =>
      match.routeId === "/agents/$agentId/$instanceId/mcp/" || mcpServerMatch,
  );
  if (isMcpRoute) {
    tabId = "mcp";
  }

  const { data: db } = useAgentDB(agentDetails.id, instance);
  const [sideBarTab, setSideBarTab] = useState("events");
  const { data: mcpServers } = useAgentMCP(agentDetails.id, instance);

  // Derive current MCP server from route params
  const currentServerId = mcpServerMatch?.params.serverId as string | undefined;
  const mcpServer =
    currentServerId && mcpServers?.find((s) => s.serverId === currentServerId);
  const mcpLabel = mcpServer ? (
    <McpBreadcrumbLabel
      parentLabel={tabTitleMap.mcp}
      nestedLabel={mcpServer.url}
    />
  ) : (
    tabTitleMap.mcp
  );

  const tabs = useMemo(() => {
    const availableTabs = new Map<string, ReactNode>();
    availableTabs.set("mcp", mcpLabel);
    if (db) {
      const dbTables = Object.keys(db);
      for (const [tableName, friendlyName] of Object.entries(tableToTabMap)) {
        if (dbTables.includes(tableName)) {
          availableTabs.set(
            friendlyName,
            tabTitleMap[friendlyName] || friendlyName,
          );
        }
      }
      for (const table of dbTables) {
        if (
          !table.startsWith("_cf") &&
          !Object.values(tableToTabMap).includes(table) &&
          !Object.keys(tableToTabMap).includes(table)
        ) {
          availableTabs.set(table, table);
        }
      }
    }
    const orderedTabs: Array<{ title: ReactNode; key: string }> = [];
    for (const tabKey of TAB_ORDER) {
      if (availableTabs.has(tabKey)) {
        orderedTabs.push({ title: availableTabs.get(tabKey), key: tabKey });
        availableTabs.delete(tabKey);
      }
    }
    for (const [tabKey, tabTitle] of availableTabs.entries()) {
      orderedTabs.push({ title: tabTitle, key: tabKey });
    }
    return orderedTabs;
  }, [db, mcpLabel]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      id="layout"
      className="w-full h-full"
    >
      <ResizablePanel id="left" order={0}>
        <div className={cn("flex flex-col h-full", "overflow-hidden")}>
          <NavTabs
            tabs={tabs}
            tabId={tabId}
            renderTab={({ key, title }) => {
              return (
                <Link
                  to="/agents/$agentId/$instanceId/$tabId"
                  params={{
                    agentId: agentDetails.id,
                    instanceId: instance,
                    tabId: key,
                  }}
                  tabIndex={-1}
                  className="flex gap-2"
                >
                  <TabIcon tabId={key} />
                  {title}
                </Link>
              );
            }}
          />
          <div className="min-h-0 grow overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle
        hitAreaMargins={{ coarse: 20, fine: 10 }}
        className="w-[1px]"
      />
      <ResizablePanel id="right" order={1}>
        <FpTabs
          value={sideBarTab}
          onValueChange={setSideBarTab}
          className={cn("grid grid-rows-[auto_1fr]", "h-full overflow-hidden")}
        >
          <FpTabsList>
            <FpTabsTrigger value="events" className="flex gap-2">
              <ListCheck className="w-4 h-4" />
              Events
            </FpTabsTrigger>
            <FpTabsTrigger value="details" className="flex gap-2">
              <FileText className="w-4 h-4" />
              Details
            </FpTabsTrigger>
          </FpTabsList>
          <FpTabsContent
            value="details"
            className={cn("min-h-0 overflow-hidden p-2")}
          >
            <KeyValueTable
              keyValue={{
                Name: agentDetails.id,
                ClassName: agentDetails.className,
                ScriptName: agentDetails.scriptName ?? "",
              }}
              className="border border-muted rounded-lg"
              keyCellClassName="px-2 py-1"
              valueCellClassName="px-2 py-1"
            />
          </FpTabsContent>
          <FpTabsContent
            value="events"
            className={cn("min-h-0 overflow-hidden px-0 py-0")}
          >
            <EventsView namespace={agentDetails.id} instance={instance} />
          </FpTabsContent>
        </FpTabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
