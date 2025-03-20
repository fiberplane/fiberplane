import type { DatabaseResult, ListAgentsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ListSection } from "../ListSection";
import { DataTableView } from "./DataTableView";
import {
  isStateTable,
  type StateDBTable,
  StateTableView,
} from "./StateTableView";
import { KeyValueTable } from "../KeyValueTable";
import {
  ChatMessagesRenderer,
  isMessagesTable,
  type MessagesTable,
} from "./ChatMessageTableView";
import {
  ScheduleColumnsSchema,
  ScheduleTableView,
  type ScheduleDBTable,
} from "./SchedulaTableView";
import { FpTabs, FpTabsContent, FpTabsList, FpTabsTrigger } from "../ui/tabs";
import { cn, noop } from "@/lib/utils";
import { Database, History, ListIcon, Sidebar } from "lucide-react";
import { TabsContent } from "@radix-ui/react-tabs";
import { EventsView } from "./EventsView";

const POLL_INTERVAL = 2000;

function useAgentDB(namespace: string, instance: string) {
  return useQuery({
    queryKey: ["agent_db", namespace, instance],
    queryFn: () =>
      fetch(`/agents/${namespace}/${instance}/admin/db`).then((res) =>
        // fetch(`/fp-agents/api/agents/${namespace}/db`).then((res) =>
        res.json(),
      ) as Promise<DatabaseResult>,
  });
}

export function AgentDetails({
  agent: agentDetails,
  instance,
}: { agent: ListAgentsResponse[0]; instance: string }) {
  const { data: db, refetch } = useAgentDB(agentDetails.id, instance);
  const ref = useRef<WebSocket | null>(null);

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
    >
      <div className="grid gap-2 grid-cols-[auto_400px]">
        <FpTabs
          value={activeTab}
          onValueChange={setActiveTab}
          className={cn(
            "grid grid-rows-[auto_1fr]",
            // NOTE - This max-height is necessary to allow overflow to be scrollable
            "max-h-full",
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
              "max-h-full",
            )}
          >
            <FpTabsList className="bg-transparent">
              <FpTabsTrigger value="details" className="flex gap-2">
                <ListIcon className="w-3.5" />
                Details
              </FpTabsTrigger>
              <FpTabsTrigger value="Events" className="flex gap-2">
                <History className="w-3.5" />
                Events
              </FpTabsTrigger>
            </FpTabsList>
            <FpTabsContent
              value="details"
              className={cn(
                // Need a lil bottom padding to avoid clipping the inputs of the last row in the form
                "pb-16",
              )}
            >
              <KeyValueTable
                keyValue={{
                  Name: agentDetails.id,
                  ClassName: agentDetails.className,
                  ScriptName: agentDetails.scriptName ?? "",
                }}
                className="border border-muted rounded-lg"
              />
            </FpTabsContent>
            <FpTabsContent value="Events">
              <EventsView namespace={agentDetails.id} instance={instance} />
            </FpTabsContent>
          </FpTabs>
        </div>
      </div>
    </ListSection>
  );
}
