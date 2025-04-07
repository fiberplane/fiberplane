import type { ListAgentsResponse } from "@/types";
import { HeartHandshake } from "lucide-react";
import { Spinner } from "../Spinner";
import { Button } from "../ui/button";
import { AgentCard } from "./AgentCard";

export function AgentsList(props: {
  agents?: ListAgentsResponse;
  isLoading: boolean;
  refetch: () => void;
  error?: Error | null;
}) {
  // Render a list of agents as cards
  return (
    <div className="h-full w-[1000px] max-w-full mx-auto grid gap-4 grid-rows-[auto_1fr]">
      <div className="grid grid-cols-[1fr_auto] items-center pt-3 px-2">
        <h2 className="text-xl">Agents</h2>
        <Button
          variant="ghost"
          size="icon"
          disabled={props.isLoading}
          onClick={props.refetch}
        >
          <Spinner spinning={props.isLoading} />
        </Button>
      </div>
      {props.error && (
        <div>
          <div className="border p-4 rounded-lg text-danger w-64 mx-auto border-danger flex flex-col gap-2">
            <div className="font-bold flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" />
              Failed to load agents
            </div>
            <div className="flex flex-col gap-2 text-foreground">
              <p>Due to an error:</p>
              <pre>
                <code>{props.error.message}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
      {!props.agents || props.agents.length === 0 ? (
        props.error ? null : (
          <div className="text-muted-foreground mx-auto">No agents found</div>
        )
      ) : (
        <div
          className="grid grid-cols=1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start "
          style={{
            gridAutoRows: "min-content",
          }}
        >
          {props.agents.map((agent) => (
            <div key={agent.id} className="h-auto">
              <AgentCard agent={agent} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
