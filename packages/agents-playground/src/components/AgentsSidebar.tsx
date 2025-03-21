import type { ListAgentsResponse, unset } from "@/types";
import { Box, Cpu, RefreshCw } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { ListSection } from "./ListSection";
import { Spinner } from "./Spinner";
import { Button } from "./ui/button";

type Props = {
  setSelectedAgent: (agent: string) => void;
  setSelectAgentInstance: (agent: string, instance: string) => void;
  data: ListAgentsResponse;
  agent: string | typeof unset;
  instance: string | typeof unset;
  isLoading: boolean;
  refetch: () => void;
};

export function AgentsSidebar(props: Props) {
  const { setSelectedAgent, setSelectAgentInstance, data, agent, instance } =
    props;

  return (
    <ListSection
      title={
        <div className="grid grid-cols-[1fr_auto] items-center">
          <h2 className="text-xl"> Agents</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={props.refetch}
            disabled={props.isLoading}
          >
            <Spinner spinning={props.isLoading} />
          </Button>
        </div>
      }
    >
      <div className="w-full grid gap-2 h-full">
        {data.map((agent) => (
          <Fragment key={agent.id}>
            <Button
              className="flex items-center px-2 py-2 font-medium text-sm"
              onClick={() => setSelectedAgent(agent.id)}
            >
              <Cpu className="w-3 h-3 mr-2" />
              {agent.id}
            </Button>
            {agent.instances.length > 0 && (
              <div className="ml-4 pl-2">
                {agent.instances.map((item, index) => (
                  <div
                    key={item}
                    className={`relative ${index !== agent.instances.length - 1 ? "mb-1" : ""}`}
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-px bg-gray-300"
                      style={{
                        bottom:
                          index === agent.instances.length - 1 ? "50%" : 0,
                      }}
                    />

                    <Button
                      onClick={() => {
                        setSelectAgentInstance(agent.id, item);
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
  );
}
