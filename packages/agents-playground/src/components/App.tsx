import { Fragment, useCallback, useReducer, useRef, useState } from "react";
import { Button } from "./ui/button";

import { type ListAgentsResponse, unset } from "@/types";
import { useStickyLoading } from "@/useStickyLoading";
import { useUpdate } from "@/useUpdate";
import { useQuery } from "@tanstack/react-query";
import { Box, BoxIcon, Cpu, HeartHandshake } from "lucide-react";
import { AgentDetails } from "./AgentDetails";
import { AgentsList } from "./AgentsList";
import { AgentsSidebar } from "./AgentsSidebar";
import { Layout } from "./Layout";
import { ListSection } from "./ListSection";

function useListAgents() {
  return useQuery<ListAgentsResponse>({
    queryKey: ["list_agents"],
    queryFn: () => fetch("/fp-agents/api/agents").then((res) => res.json()),
  });
}

const initialState = {
  selectedAgent: unset as string | typeof unset,
  selectedInstance: unset as string | typeof unset,
};

type State = typeof initialState;

type Action =
  | { type: "reset" }
  | { type: "setAgent"; agent: string }
  | { type: "setInstance"; instance: string; agent: string };

export function App() {
  const {
    data,
    isLoading: rawIsLoading,
    refetch: rawRefetch,
  } = useListAgents();
  const update = useUpdate();
  const refetchInitiatedRef = useRef(false);
  const refetch = useCallback(() => {
    refetchInitiatedRef.current = true;
    rawRefetch();
    update();
  }, [update, rawRefetch]);

  const isLoading = useStickyLoading(
    rawIsLoading || refetchInitiatedRef.current,
    1000,
  );
  refetchInitiatedRef.current = false;

  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case "reset":
        return initialState;
      case "setAgent":
        return {
          ...state,
          selectedAgent: action.agent,
          selectedInstance: unset,
        };
      case "setInstance":
        return {
          ...state,
          selectedAgent: action.agent,
          selectedInstance: action.instance,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const { selectedAgent, selectedInstance } = state;

  const setSelectedAgent = useCallback((agent: string) => {
    dispatch({ type: "setAgent", agent });
  }, []);

  const setSelectedAgentInstance = useCallback(
    (agent: string, instance: string) => {
      dispatch({ type: "setInstance", instance, agent });
    },
    [],
  );
  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  if (data?.length === 0) {
    return (
      <Layout reset={reset}>
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4" />
          <span>No agents found</span>
        </div>
      </Layout>
    );
  }

  const binding = data?.find((a) => a.id === selectedAgent);
  const instance = binding?.instances.find((i) => i === selectedInstance);

  return (
    <Layout reset={reset}>
      {!data || !binding ? (
        <div className="h-full w-full p-4">
          <AgentsList
            agents={data}
            isLoading={isLoading}
            refetch={refetch}
            selectAgent={setSelectedAgent}
            selectAgentInstance={setSelectedAgentInstance}
          />
        </div>
      ) : (
        <div className="h-full w-full grid gap-4 grid-cols-[200px_auto] p-4">
          <AgentsSidebar
            agent={selectedAgent}
            instance={selectedInstance}
            data={data}
            refetch={refetch}
            isLoading={isLoading}
            setSelectedAgent={setSelectedAgent}
            setSelectAgentInstance={setSelectedAgentInstance}
          />
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
                          setSelectedAgentInstance(binding.id, instance);
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
    </Layout>
  );
}
