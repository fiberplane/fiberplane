import { Fragment, useState } from "react";
import { Button } from "./ui/button";

import type { ListAgentsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Box, BoxIcon, Cpu } from "lucide-react";
import { AgentDetails } from "./AgentDetails";
import { ListSection } from "./ListSection";
import { AgentsList } from "./AgentsList";

export const unset = Symbol("unset");

function useListAgents() {
  return useQuery<ListAgentsResponse>({
    queryKey: ["list_agents"],
    queryFn: () => fetch("/fp-agents/api/agents").then((res) => res.json()),
  });
}

export function App() {
  const { data, isLoading } = useListAgents();
  const [selectedAgent, setSelectedAgent] = useState<string | typeof unset>(
    unset,
  );

  const [selectedInstance, setSelectInstance] = useState<string | typeof unset>(
    unset,
  );

  console.log("selectedAgent", selectedAgent);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div>Empty</div>;
  }

  const binding = data.find((a) => a.id === selectedAgent);

  const instance = binding?.instances.find((i) => i === selectedInstance);

  if (!binding) {
    return (
      <div className="h-full w-full">
        <AgentsList
          agents={data}
          selectAgent={setSelectedAgent}
          selectInstance={setSelectInstance}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full grid gap-4 grid-cols-[200px_auto]">
      <ListSection title="Detected Agents">
        <div className="w-full grid gap-2 h-full">
          {data.map((agent) => (
            <Fragment key={agent.id}>
              <Button
                onClick={() => {
                  setSelectedAgent(agent.id);
                  setSelectInstance(unset);
                }}
                variant="ghost"
                className={`justify-start px-2 ${agent.id === selectedAgent && instance === undefined ? "bg-muted" : ""}`}
              >
                <Cpu className="w-3 h-3" />
                {agent.id}
              </Button>
              {agent.instances.map((item) => (
                <Button
                  key={item}
                  onClick={() => {
                    setSelectedAgent(agent.id);
                    setSelectInstance(item);
                  }}
                  variant="ghost"
                  className={`ml-2 justify-start px-4 ${item === instance ? "bg-muted" : ""}`}
                >
                  <Box />
                  {item}
                </Button>
              ))}
            </Fragment>
          ))}
        </div>
      </ListSection>
      <div>
        {instance !== undefined ? (
          <AgentDetails agent={binding} instance={instance} />
        ) : (
          <ListSection title={binding.id}>
            <div className="grid gap-2">
              <h2>Active instances</h2>
              <div className="flex">
                {binding.instances.map((instance) => (
                  <Button
                    key={instance}
                    onClick={(event) => {
                      setSelectInstance(instance);
                    }}
                    type="button"
                    size="sm"
                    className="bg-info/15 hover:bg-info/35"
                  >
                    <BoxIcon className="w-3.5 h-3.5" />
                    {instance}
                  </Button>
                ))}
              </div>
            </div>
          </ListSection>
        )}
      </div>
    </div>
  );
}
