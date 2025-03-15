import { useCallback, useEffect, useState } from "react";
import { useAgent } from "./useAgent";
import { ConnectionStatus } from "./ConnectionStatus";
import { useQuery } from "@tanstack/react-query";
import type { DatabaseResult } from "@/plugin/utils";
import { DataTableView } from "./DataTableView";
import type { DurableObjectsSuccess } from "@/types";
import useWebSocket from "react-use-websocket";
import { MessageSchema } from "@/types";

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
	const [_connected, setConnected] = useState(false);
	const agent = useAgent({
		onMessage: (message: WebSocketEventMap["message"]) => {
			if (message.data === JSON.stringify("ACK")) {
				console.log("Agent::ACK received");
			}
		},
		agent: agentDetails.name.toLowerCase(),

		onOpen: (event) => {
			console.log("Agent::Connection established");
			setConnected(true);
		},
		onClose: (event) => console.log("Agent::Connection closed", event),
		onStateUpdate: (state) => console.log("Agent::State updated", state),
		onError: (error) => console.error(error),
	});

	const { readyState } = agent;
	const close = useCallback(() => agent.close(), [agent.close]);
	const closeConnection =
		readyState === WebSocket.OPEN ? () => agent.close() : undefined;
	useEffect(() => {
		if (!closeConnection) {
			return;
		}

		return () => {
			closeConnection();
		};
	}, [closeConnection]);

	const { data: db, refetch } = useAgentDB(agentDetails.name);

	const websocket = useWebSocket("ws://localhost:4001/fp-agents/ws", {
		onMessage: (event) => {
			console.log("onMessage", event);
			const data = JSON.parse(event.data);
			const result = MessageSchema.safeParse(data);
			if (!result.success) {
				console.error("Invalid message", result.error);
				return;
			}

			if (result.data.type === "update") {
				refetch();
			}
		},
		onClose: (event) => {
			console.log("onClose", event);
		},
		retryOnError: true,
		reconnectAttempts: 10,
	});

	useEffect(() => {
		websocket.sendMessage(
			JSON.stringify({
				type: "subscribe",
				payload: { agent: agentDetails.name },
			}),
		);

		return () => {
			websocket.sendMessage(
				JSON.stringify({
					type: "unsubscribe",
					payload: { agent: agentDetails.name },
				}),
			);
			// }
		};
	}, [websocket.sendMessage, agentDetails.name]);

	// console.log('db', db)
	if (typeof db === "object" && "error" in db && db.error === "No database found") {
		return <div>No database found</div>;
	}

	return (
		<div className="grid gap-2">
			<div className="grid grid-cols-[1fr_auto] items-center border  border-gray-200 px-2 rounded-md">
				<h2 className="text-accent-foreground text-lg py-2 px-4">
					Details:{" "}
					<span className="font-bold text-neutral-500">
						{agentDetails.name}
					</span>
				</h2>
				<ConnectionStatus readyState={readyState} />
			</div>

			<div className="grid gap-2 border border-gray-200 p-2 rounded-md">
				<h2 className="text-accent-foreground text-lg px-4">Databases:</h2>
				<div className="grid gap-2 lg:grid-cols-2">
					{db && db !== null &&
						Object.entries(db).map(([tableName, data]) => (
							<DataTableView key={tableName} table={data} title={tableName} />
						))}
				</div>
			</div>
			{/* <div className="grid gap-2 grid-cols-2">
        <Button
          className="cursor-pointer"
          onClick={() => {
            agent.send(JSON.stringify("I want a list user endpoint"));
          }}
        >
          Send
        </Button>
        <Button onClick={() => {
          agent.setState({ messageReceived: "client-side-yes" });
        }}>set state</Button>
        <Button onClick={close}>Close</Button>
      </div> */}
		</div>
	);
}
