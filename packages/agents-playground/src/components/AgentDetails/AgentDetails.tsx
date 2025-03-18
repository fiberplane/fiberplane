import type { DatabaseResult, DurableObjectsSuccess, Table } from "@/types";
import { MessageSchema } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Database } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ListSection } from "../ListSection";
import { DataTableView } from "./DataTableView";
import ScheduledTasksView from "./ScheduledTableView";
import {
  type StateTableColumns,
  StateTableColumnsSchema,
  StateTableName,
  StateTableView,
} from "./StateTableView";

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
  // const agent = useAgent({
  // 	onMessage: (message: WebSocketEventMap["message"]) => {
  // 		if (message.data === JSON.stringify("ACK")) {
  // 			console.log("Agent::ACK received");
  // 		}
  // 	},
  // 	agent: agentDetails.name.toLowerCase(),

  // 	onOpen: (event) => {
  // 		console.log("Agent::Connection established");
  // 		setConnected(true);
  // 	},
  // 	onClose: (event) => console.log("Agent::Connection closed", event),
  // 	onStateUpdate: (state) => console.log("Agent::State updated", state),
  // 	onError: (error) => console.error(error),
  // });

  // const { readyState } = agent;
  const { readyState } = { readyState: 0 };
  // const close = useCallback(() => agent.close(), [agent.close]);
  // const closeConnection =
  // 	readyState === WebSocket.OPEN ? () => agent.close() : undefined;
  // useEffect(() => {
  // 	if (!closeConnection) {
  // 		return;
  // 	}

  // 	return () => {
  // 		closeConnection();
  // 	};
  // }, [closeConnection]);

  const { data: db, refetch } = useAgentDB(agentDetails.name);
  const ref = useRef<WebSocket | null>(null);

  useEffect(() => {
    ref.current = new WebSocket("ws://localhost:4001/fp-agents/ws");
    const socket = ref.current;
    ref.current.onopen = (event) => {
      console.log("opened", event, ref.current?.readyState === WebSocket.OPEN);
      if (ref.current === event.target) {
        ref.current?.send(
          JSON.stringify({
            type: "subscribe",
            payload: { agent: agentDetails.name },
          }),
        );
      }
    };
    ref.current.onmessage = (event) => {
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
    };

    ref.current.onclose = (event) => {
      console.log("onClose", event);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "unsubscribe",
            payload: { agent: agentDetails.name },
          }),
        );
        socket.close();
      }

      socket.onopen = null;
      socket.onmessage = null;
    };
  });

  // const websocket = useWebSocket({
  // 	url: "ws://localhost:4001/fp-agents/ws",
  // 	debug: true,
  // 	onMessage: (event) => {

  // 		console.log("onMessage", event);
  // 		const data = JSON.parse(event.data);
  // 		const result = MessageSchema.safeParse(data);
  // 		if (!result.success) {
  // 			console.error("Invalid message", result.error);
  // 			return;
  // 		}

  // 		if (result.data.type === "update") {
  // 			refetch();
  // 		}
  // 	},
  // 	onClose: (event) => {
  // 		console.log("onClose", event);
  // 	},
  // 	retryOnError: true,
  // 	reconnectAttempts: 10,
  // });

  // useEffect(() => {
  // 	websocket.sendMessage(
  // 		JSON.stringify({
  // 			type: "subscribe",
  // 			payload: { agent: agentDetails.name },
  // 		}),
  // 	);

  // 	return () => {
  // 		websocket.sendMessage(
  // 			JSON.stringify({
  // 				type: "unsubscribe",
  // 				payload: { agent: agentDetails.name },
  // 			}),
  // 		);
  // 		// }
  // 	};
  // }, [websocket.sendMessage, agentDetails.name]);

  if (
    typeof db === "object" &&
    "error" in db &&
    db.error === "No database found"
  ) {
    return <div>No database found</div>;
  }

  return (
    <ListSection
      title={
        <div className="flex gap-2">
          Details:
          <span className="font-bold text-neutral-500">
            {agentDetails.name}
          </span>
        </div>
      }
      className="h-full"
    >
      {/* <div className="grid gap-2 border border-gray-200 p-2 rounded-md"> */}
      <div className="grid gap-2 p-2 rounded-md">
        <h2 className="text-accent-foreground text-lg px-4 flex gap-2 items-center">
          <Database className="w-3.5 h-3.5" />
          Databases:
        </h2>
        <div className="grid gap-2 xlg:grid-cols-2">
          {db &&
            db !== null &&
            Object.entries(db).map(([tableName, data]) => {
              console.log(
                tableName,
                tableName === StateTableName,
                data,
                StateTableColumnsSchema.safeParse(data.columns),
              );
              if (
                tableName === StateTableName &&
                StateTableColumnsSchema.safeParse(data.columns).success
              ) {
                return (
                  <StateTableView
                    key={tableName}
                    table={data as Table<StateTableColumns>}
                  />
                );
              }

              return (
                <DataTableView key={tableName} table={data} title={tableName} />
              );
            })}
          <ScheduledTasksView />
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
    </ListSection>
  );
  // return null;
}
