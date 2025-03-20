import type { ListAgentsResponse } from "@/types";
import { AgentCard } from "./AgentCard";
import type { unset } from "../App";
import { ListSection } from "../ListSection";

export function AgentsList(props: {
  agents?: ListAgentsResponse;
  selectAgent: (agent: string | typeof unset) => void;
  selectInstance: (agent: string | typeof unset) => void;
}) {
  if (!props.agents || props.agents.length === 0) {
    return <div>Empty</div>;
  }

  // Render a list of agents as cards
  return (
    <div className="h-full w-[1000px] max-w-full mx-auto grid gap-4 grid-rows-[auto_1fr]">
      <h2 className="text-xl pt-3 px-2">Agents</h2>
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
              selectInstance={props.selectInstance}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
