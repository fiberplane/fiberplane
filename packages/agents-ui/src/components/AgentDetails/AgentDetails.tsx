import { useAgentDB } from "@/hooks";
import { useAgentInstanceEvents, useFilteredEvents } from "@/hooks";
import { cn } from "@/lib/utils";
import { type SSEStatus, usePlaygroundStore } from "@/store";
import type { ListAgentsResponse } from "@/types";
import { TabsContent } from "@radix-ui/react-tabs";
import { Database, History, ListIcon } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { KeyValueTable } from "../KeyValueTable";
import { ListSection } from "../ListSection";
import { FpTabs, FpTabsContent, FpTabsList, FpTabsTrigger } from "../ui/tabs";
import {
  ChatMessagesRenderer,
  type MessagesTable,
  isMessagesTable,
} from "./ChatMessageTableView";
import { DataTableView } from "./DataTableView";
import { EventsView } from "./EventsView";
import {
  ScheduleColumnsSchema,
  type ScheduleDBTable,
  ScheduleTableView,
} from "./ScheduleTableView";
import {
  type StateDBTable,
  StateTableView,
  isStateTable,
} from "./StateTableView";

const POLL_INTERVAL = 2000;

export function AgentDetails({
  agent: agentDetails,
  instance,
}: { agent: ListAgentsResponse[0]; instance: string }) {
  const { data: db, refetch } = useAgentDB(agentDetails.id, instance);
  useAgentInstanceEvents(agentDetails.id, instance);

  useEffect(() => {
    const id = setInterval(refetch, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [refetch]);

  const [activeTab, setActiveTab] = useState("");
  const [sideBarTab, setSideBarTab] = useState("details");
  useEffect(() => {
    if (!db || activeTab !== "") {
      return;
    }
    const keys = Object.keys(db);
    if (keys.length === 0) {
      return;
    }

    setActiveTab(keys[0]);
  }, [activeTab, db]);

  const tabContent: Array<{
    title: ReactNode;
    key: string;
    content: ReactNode;
  }> = useMemo(() => {
    if (!db) {
      return [];
    }

    return Object.entries(db)
      .map(([tableName, data]) => {
        if (tableName.startsWith("_cf")) {
          return null;
        }

        if (isMessagesTable(tableName, data as MessagesTable)) {
          return {
            title: "Messages",
            key: tableName,
            content: (
              <ChatMessagesRenderer data={data.data as MessagesTable["data"]} />
            ),
          };
        }

        if (
          tableName === "cf_agents_schedules" &&
          ScheduleColumnsSchema.safeParse(data.columns).success
        ) {
          return {
            title: "Schedule",
            key: tableName,
            content: <ScheduleTableView table={data as ScheduleDBTable} />,
          };
        }

        if (isStateTable(tableName, data as StateDBTable)) {
          return {
            title: "State",
            key: tableName,
            content: <StateTableView table={data as StateDBTable} />,
          };
        }

        return {
          title: tableName,
          key: tableName,
          content: <DataTableView table={data} title={tableName} />,
        };
      })
      .filter(Boolean) as Array<{
      title: ReactNode;
      key: string;
      content: ReactNode;
    }>;
  }, [db]);

  return (
    <ListSection
      title={
        <div className="flex gap-2">
          Agent:
          <span className="font-bold text-neutral-500">
            {agentDetails.id} - {instance}
          </span>
        </div>
      }
      className="h-full"
      contentClassName="h-full"
    >
      <div className="flex flex-col gap-2 grid-rows-2 lg:grid lg:grid-rows-1 h-full lg:grid-cols-[auto_auto]">
        <FpTabs
          value={activeTab}
          onValueChange={setActiveTab}
          className={cn(
            "grid grid-rows-[auto_1fr]",
            // NOTE - This max-height is necessary to allow overflow to be scrollable
            "max-h-fit overflow-hidden",
            "lg:overflow-scroll",
          )}
        >
          <FpTabsList className="bg-transparent">
            {tabContent.map(({ title, key }) => (
              <FpTabsTrigger key={key} value={key} className="flex gap-2">
                <Database className="w-3.5" />
                {title}
              </FpTabsTrigger>
            ))}
          </FpTabsList>
          {tabContent.map(({ key, content }) => (
            <TabsContent key={key} value={key}>
              {content}
            </TabsContent>
          ))}
        </FpTabs>
        <div>
          <FpTabs
            value={sideBarTab}
            onValueChange={setSideBarTab}
            className={cn(
              "grid grid-rows-[auto_1fr]",
              // NOTE - This max-height is necessary to allow overflow to be scrollable
              // "max-h-full",
              "max-h-fit overflow-hidden",
            )}
          >
            <FpTabsList className="bg-transparent">
              <FpTabsTrigger value="details" className="flex gap-2">
                <ListIcon className="w-3.5" />
                Details
              </FpTabsTrigger>
              <FpTabsTrigger value="Events" className="flex gap-2">
                <EventsTabLabel
                  instance={instance}
                  namespace={agentDetails.id}
                />
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
              value="Events"
              className={cn("min-h-0 overflow-hidden")}
            >
              <EventsView namespace={agentDetails.id} instance={instance} />
            </FpTabsContent>
          </FpTabs>
        </div>
      </div>
    </ListSection>
  );
}

function EventsTabLabel(props: { instance: string; namespace: string }) {
  const events = useFilteredEvents();
  const eventsCount = events.length;
  const eventStreamStatus = usePlaygroundStore(
    (state) =>
      state.agentsState[props.namespace]?.instances[props.instance]
        ?.eventStreamStatus ?? "disconnected",
  );

  return (
    <div className="flex gap-2 items-center">
      <History className="w-3.5" />
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
