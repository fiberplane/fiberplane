import type { DatabaseResult, ListAgentsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
import { Database, History, ListIcon } from "lucide-react";

const POLL_INTERVAL = 2000;

function useAgentDB(id: string) {
  return useQuery({
    queryKey: ["agent_db", id],
    queryFn: () =>
      fetch(`/fp-agents/api/agents/${id}/db`).then((res) =>
        res.json(),
      ) as Promise<DatabaseResult>,
  });
}
export function AgentDetails({
  agent: agentDetails,
  instance,
}: { agent: ListAgentsResponse[0]; instance: string }) {
  const { data: db, refetch } = useAgentDB(agentDetails.id);
  const ref = useRef<WebSocket | null>(null);

  const stateTable =
    db &&
    (Object.entries(db).find(([name, table]) =>
      isStateTable(name, table as StateDBTable),
    )?.[1] as undefined | StateDBTable);
  const messagesTable =
    db &&
    (Object.entries(db).find(([name, table]) =>
      isMessagesTable(name, table as MessagesTable),
    )?.[1] as undefined | MessagesTable);

  useEffect(() => {
    setInterval(refetch, POLL_INTERVAL);
  }, [refetch]);

  const [activeTab, setActiveTab] = useState("messages");

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
            <FpTabsTrigger value="messages" className="flex gap-2">
              <Database className="w-3.5" />
              Messages
            </FpTabsTrigger>
            <FpTabsTrigger value="schedule" className="flex gap-2">
              <Database className="w-3.5" />
              Schedule
            </FpTabsTrigger>
            <FpTabsTrigger value="state" className="flex gap-2">
              <Database className="w-3.5" />
              State
            </FpTabsTrigger>
            {/* <FpTabsTrigger value="Details" className="flex gap-2">
						<ListIcon className="w-3.5" />Details
					</FpTabsTrigger>
					<FpTabsTrigger value="History" className="flex gap-2">
						<History className="w-3.5" />History
					</FpTabsTrigger> */}
          </FpTabsList>
          <FpTabsContent
            value="messages"
            className={cn(
              // Need a lil bottom padding to avoid clipping the inputs of the last row in the form
              "pb-16",
            )}
          >
            {db &&
              db !== null &&
              Object.entries(db).map(([tableName, data]) => {
                if (
                  (stateTable && data === stateTable) ||
                  tableName.startsWith("_cf")
                ) {
                  return null;
                }

                if (data === messagesTable) {
                  return (
                    <ChatMessagesRenderer
                      key={tableName}
                      data={messagesTable.data}
                    />
                  );
                }

                return null;
              })}
          </FpTabsContent>
          <FpTabsContent
            value="Details"
            className={cn(
              // Need a lil bottom padding to avoid clipping the inputs of the last row in the form
              "pb-16",
            )}
          >
            <ListSection title="Details" contentClassName="gap-2 grid">
              {stateTable && <StateTableView table={stateTable} />}
            </ListSection>
          </FpTabsContent>
        </FpTabs>
        <div>
          <FpTabs
            value={"details"}
            onValueChange={setActiveTab}
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
              <FpTabsTrigger value="History" className="flex gap-2">
                <History className="w-3.5" />
                History
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
          </FpTabs>
        </div>
      </div>
      {/* <div className="grid grid-cols-[auto_400px] gap-2 min-w-0 overflow-hidden">
				<div className="grid gap-2 rounded-md">
					<div className="grid gap-2 xlg:grid-cols-2">
						{db &&
							db !== null &&
							Object.entries(db).map(([tableName, data]) => {
								if (
									(stateTable && data === stateTable) ||
									tableName.startsWith("_cf")
								) {
									return null;
								}

								if (data === messagesTable) {
									return (
										<ChatMessagesRenderer
											key={tableName}
											data={messagesTable.data}
										/>
									);
								}

								console.log("tableName", tableName);
								if (
									tableName === "cf_agents_schedules" &&
									ScheduleColumnsSchema.safeParse(data.columns).success
								) {
									return (
										<ScheduleTableView
											key={tableName}
											table={data as ScheduleDBTable}
										/>
									);
								}

								return (
									<DataTableView
										key={tableName}
										table={data}
										title={tableName}
									/>
								);
							})}
					</div>
				</div>
		</div> */}
    </ListSection>
  );
}
