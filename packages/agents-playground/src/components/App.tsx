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

  return (
    <div className="flex flex-col h-full w-full">
      <div className="border-b flex items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="logoTitle"
          >
            <title id="logoTitle">Fiberplane logo</title>
            <rect width="32" height="32" rx="8" fill="#FF5733" />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7 14.5V17L16.5 17.1L17.1 14.5H7ZM7 9V11.5L17.7 11.6L17.8 11.1C18 10 17.2 9 16.1 9H7ZM16 19.5L16.6 17L22.5 17.1L21.6 19.5H16ZM17.1 14.5L17.7 11.6L26 11.5L25 14.5H17.1ZM7 19.5V22H15L15.6 19.5H7ZM19 25H17.2C15.9 25 15 23.7 15.3 22.4H20L19 25Z"
              fill="white"
            />
          </svg>
          <span className="font-medium">Agent Playground</span>
        </div>
      </div>

      {!binding ? (
        <div className="h-full w-full p-4">
          <AgentsList
            agents={data}
            selectAgent={setSelectedAgent}
            selectInstance={setSelectInstance}
          />
        </div>
      ) : (
        <div className="h-full w-full grid gap-4 grid-cols-[200px_auto] p-4">
          <ListSection title="Detected Agents">
            <div className="w-full grid gap-2 h-full">
              {data.map((agent) => (
                <Fragment key={agent.id}>
                  <div className="flex items-center px-2 py-2 font-medium text-sm">
                    <Cpu className="w-3 h-3 mr-2" />
                    {agent.id}
                  </div>
                  {agent.instances.length > 0 && (
                    <div className="ml-4 pl-2">
                      {agent.instances.map((item, index) => (
                        <div 
                          key={item} 
                          className={`relative ${index !== agent.instances.length - 1 ? "mb-1" : ""}`}
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-px bg-gray-300" style={{ 
                            bottom: index === agent.instances.length - 1 ? '50%' : 0 
                          }} />
                          
                          <Button
                            onClick={() => {
                              setSelectedAgent(agent.id);
                              setSelectInstance(item);
                            }}
                            variant="ghost"
                            className={`relative justify-start px-4 w-full ml-2 ${item === instance ? "bg-muted" : ""}`}
                          >
                            <div className="absolute -left-2 top-1/2 w-2 h-px bg-gray-300" />
                            <Box className="w-3 h-3 mr-2" />
                            {item}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <div className="flex gap-2">
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
      )}
    </div>
  );
}
