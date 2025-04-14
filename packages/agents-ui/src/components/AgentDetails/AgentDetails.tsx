import { useAgentDB, useAgentMCP } from "@/hooks";
import { useAgentInstanceEvents, useFilteredEvents } from "@/hooks";
import { cn } from "@/lib/utils";
import { type SSEStatus, usePlaygroundStore } from "@/store";
import type { AgentInstanceParameters, ListAgentsResponse } from "@/types";
import { Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { KeyValueTable } from "../KeyValueTable";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { FpTabs, FpTabsContent, FpTabsList, FpTabsTrigger } from "../ui/tabs";
import { EventsView } from "./EventsView";

const POLL_INTERVAL = 2000;

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

export function AgentDetails({
  agent: agentDetails,
  instance,
}: {
  agent: ListAgentsResponse[0];
  instance: string;
}) {
  const navigate = useNavigate();
  const { tabId } = useParams({ from: "/agents/$agentId/$instanceId/$tabId" });

  const { data: db, refetch: refetchDb } = useAgentDB(
    agentDetails.id,
    instance,
  );
  const {
    data: mcpData,
    refetch: refetchMCP,
    isLoading: isMcpLoading,
  } = useAgentMCP(agentDetails.id, instance);
  useAgentInstanceEvents(agentDetails.id, instance);

  useEffect(() => {
    const id = setInterval(() => {
      refetchDb();
      refetchMCP();
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [refetchDb, refetchMCP]);

  // For right sidebar tab
  const [sideBarTab, setSideBarTab] = useState("events");

  // Build the list of tabs with friendly URLs
  const tabs = useMemo(() => {
    // Collect all available tabs
    const availableTabs = new Map<string, ReactNode>();

    // Add known tabs based on database presence
    if (db) {
      // Add tables with known friendly URLs
      for (const [tableName, friendlyName] of Object.entries(tableToTabMap)) {
        if (tableName in db) {
          availableTabs.set(
            friendlyName,
            tabTitleMap[friendlyName] || friendlyName,
          );
        }
      }

      // Add remaining tables that don't have friendly mappings
      for (const table of Object.keys(db)) {
        if (!table.startsWith("_cf") && !(table in tableToTabMap)) {
          availableTabs.set(table, table);
        }
      }
    }

    // Add MCP tab
    availableTabs.set("mcp", "Servers (MCP)");

    // Order tabs according to preference
    const orderedTabs: Array<{ title: ReactNode; key: string }> = [];

    // First add tabs in preferred order
    for (const tabKey of TAB_ORDER) {
      if (availableTabs.has(tabKey)) {
        orderedTabs.push({
          title: availableTabs.get(tabKey) as ReactNode,
          key: tabKey,
        });
        availableTabs.delete(tabKey);
      }
    }

    // Then add any remaining tabs
    for (const [tabKey, tabTitle] of availableTabs.entries()) {
      orderedTabs.push({
        title: tabTitle,
        key: tabKey,
      });
    }

    return orderedTabs;
  }, [db]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    navigate({
      to: "/agents/$agentId/$instanceId/$tabId",
      params: {
        agentId: agentDetails.id,
        instanceId: instance,
        tabId: value,
      },
    });
  };

  return (
    <ResizablePanelGroup direction="horizontal" id="layout" className="w-full">
      <ResizablePanel id="left" order={0}>
        <FpTabs
          value={tabId || ""}
          onValueChange={handleTabChange}
          className={cn(
            "grid grid-rows-[auto_1fr]",
            "max-h-fit overflow-hidden",
            "lg:overflow-scroll",
          )}
        >
          <FpTabsList>
            {tabs.map(({ title, key }) => (
              <FpTabsTrigger key={key} value={key} className="flex gap-2">
                {title}
              </FpTabsTrigger>
            ))}
          </FpTabsList>
          <FpTabsContent value={tabId || ""}>
            <Outlet />
          </FpTabsContent>
        </FpTabs>
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
              <EventsTabLabel instance={instance} namespace={agentDetails.id} />
            </FpTabsTrigger>
            <FpTabsTrigger value="details" className="flex gap-2">
              Details
            </FpTabsTrigger>
          </FpTabsList>
          <FpTabsContent
            value="details"
            className={cn("min-h-0 overflow-hidden")}
          >
            <KeyValueTable
              keyValue={{
                Name: agentDetails.id,
                ClassName: agentDetails.className,
                ScriptName: agentDetails.scriptName ?? "",
              }}
              className="border border-muted rounded-lg"
              keyCellClassName="px-2"
              valueCellClassName="px-2"
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

function EventsTabLabel(props: AgentInstanceParameters) {
  const events = useFilteredEvents(props);
  const eventsCount = events.length;
  const eventStreamStatus = usePlaygroundStore(
    (state) =>
      state.agentsState[props.namespace]?.instances[props.instance]
        ?.eventStreamStatus ?? "disconnected",
  );

  return (
    <div className="flex gap-2 items-center">
      Events {eventsCount ? `(${eventsCount})` : null}{" "}
      <ConnectionStatus status={eventStreamStatus} />
    </div>
  );
}

function ConnectionStatus(props: { status: SSEStatus }) {
  const { status } = props;

  if (status !== "open") {
    return (
      <div
        className="bg-warning w-2 h-2 rounded-full animate-in fade-in-0 duration-500"
        title={`Event stream offline: ${status}`}
      />
    );
  }

  return null;
}