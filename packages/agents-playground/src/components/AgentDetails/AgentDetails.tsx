import type { DatabaseResult, DurableObjectsSuccess } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
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
}: { agent: DurableObjectsSuccess["durableObjects"]["bindings"][0] }) {
	const { data: db, refetch } = useAgentDB(agentDetails.name);
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

	return (
		<ListSection
			title={
				<div className="flex gap-2">
					Agent:
					<span className="font-bold text-neutral-500">
						{agentDetails.name}
					</span>
				</div>
			}
			className="h-full"
		>
			<div className="grid grid-cols-[auto_400px] gap-2 min-w-0 overflow-hidden">
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
						{/* <ScheduledTasksView /> */}
					</div>
				</div>
				<ListSection title="Details" contentClassName="gap-2 grid">
					<KeyValueTable
						keyValue={{
							Name: agentDetails.name,
							ClassName: agentDetails.className,
							ScriptName: agentDetails.scriptName ?? "",
						}}
						className="border border-muted rounded-lg"
					/>
					{stateTable && <StateTableView table={stateTable} />}
				</ListSection>
			</div>
		</ListSection>
	);
}
