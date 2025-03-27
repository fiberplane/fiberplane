import { Button } from "./ui/button";

import { useListAgents } from "@/hooks";
import { useMinimumLoadingRefetch } from "@/useMinimumLoadingRefetch";
import { Box, BoxIcon, HeartHandshake } from "lucide-react";
import { usePlaygroundStore } from "../store";
import { AgentDetails } from "./AgentDetails";
import { AgentsList } from "./AgentsList";
import { AgentsSidebar } from "./AgentsSidebar";
import { Layout } from "./Layout";
import { ListSection } from "./ListSection";

export function App() {
  const { data, refetch: rawRefetch } = useListAgents();
  const [refetch, isLoading] = useMinimumLoadingRefetch(rawRefetch, 500);

  const selectedAgent = usePlaygroundStore((state) => state.agent);
  const selectedInstance = usePlaygroundStore((state) => state.instance);
  const setSelectedAgent = usePlaygroundStore((state) => state.selectAgent);
  const setSelectedAgentInstance = usePlaygroundStore(
    (state) => state.selectAgentInstance,
  );
  const reset = usePlaygroundStore((state) => state.reset);

  if (data?.length === 0) {
    return (
      <Layout reset={reset}>
        <div className="h-full grid items-center justify-center">
          <div className="grid gap-2 mx-auto border p-4 rounded-lg max-w-[400px]">
            <div className="flex items-center gap-2 justify-center">
              <HeartHandshake className="w-4 h-4" />
              <span>Oops. No agents found!</span>
            </div>
            <p className="text-muted-foreground">
              Please make sure you've decorated your Agents classes with the{" "}
              <code className="font-mono text-warning">`@Fiber()`</code>{" "}
              decorator
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const agent = data?.find((a) => a.id === selectedAgent);
  const hasBinding = data && agent;
  const instance = agent?.instances.find((i) => i === selectedInstance);

  return (
    <Layout reset={reset}>
      {hasBinding ? (
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
              <AgentDetails agent={agent} instance={instance} />
            ) : (
              <ListSection
                title={agent.id}
                className="h-full"
                contentClassName="grid items-center justify-center"
              >
                <div className="grid gap-4 max-w-prose mx-auto border rounded-lg p-4 m-4">
                  <h2 className="text-lg ">Active instances</h2>
                  <p className="text-muted-foreground">
                    An active instance is an instance of the agent that is
                    currently running. In order to view the details of an agent,
                    you must select one.
                  </p>
                  <div>Detected instances: </div>

                  {agent.instances.length ? (
                    <div className="flex gap-2">
                      {agent.instances.map((instance) => (
                        <Button
                          key={instance}
                          onClick={(event) => {
                            setSelectedAgentInstance(agent.id, instance);
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
                  ) : (
                    // <div className="text-muted-foreground text-center mx-auto border p-2 rounded-lg">
                    <div className="text-muted-foreground text-center mx-auto">
                      <em className="text-foreground italic font-normal mb-1 flex items-center justify-center">
                        <Box className="w-4 h-4 mr-2" />
                        No instances detected yet.
                      </em>
                      Please make a request to the agent to start an instance.
                    </div>
                  )}
                </div>
              </ListSection>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full w-full p-4">
          <AgentsList
            agents={data}
            isLoading={isLoading}
            refetch={refetch}
            selectAgent={setSelectedAgent}
            selectAgentInstance={setSelectedAgentInstance}
          />
        </div>
      )}
    </Layout>
  );
}
