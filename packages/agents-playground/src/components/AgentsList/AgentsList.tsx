import type { ListAgentsResponse } from "@/types";
import { RefreshCw } from "lucide-react";
import { Spinner } from "../Spinner";
import { Button } from "../ui/button";
import { AgentCard } from "./AgentCard";

export function AgentsList(props: {
  agents?: ListAgentsResponse;
  selectAgent: (agent: string) => void;
  selectAgentInstance: (agent: string, instance: string) => void;
  isLoading: boolean;
  refetch: () => void;
}) {
  // console.log('isLoading', props.isLoading)
  if (!props.agents || props.agents.length === 0) {
    return <div>Empty</div>;
  }

  // Render a list of agents as cards
  return (
    <div className="h-full w-[1000px] max-w-full mx-auto grid gap-4 grid-rows-[auto_1fr]">
      <div className="grid grid-cols-[1fr_auto] items-center  pt-3 px-2">
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
      <div
        className="grid grid-cols-1 lg:grid-cols-3 xlg:grid-cols-3 gap-4 items-start "
        style={{
          gridAutoRows: "min-content",
        }}
      >
        {props.agents.map((agent) => (
          <div key={agent.id} className="h-auto">
            <AgentCard
              agent={agent}
              selectAgent={props.selectAgent}
              selectAgentInstance={props.selectAgentInstance}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
