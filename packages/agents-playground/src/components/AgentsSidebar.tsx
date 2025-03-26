import { cn } from "@/lib/utils";
import { type ListAgentsResponse, unset } from "@/types";
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
        {data.map((item) => (
          <Fragment key={item.id}>
            <Button
              className={cn(
                "flex justify-start px-2 py-2 font-medium text-sm",
                instance === unset && item.id === agent ? "bg-muted" : "",
              )}
              variant="ghost"
              onClick={() => setSelectedAgent(item.id)}
            >
              <Cpu className="w-3 h-3 mr-2" />
              {item.id}
            </Button>
            {item.instances.length > 0 && (
              <div className="ml-4 pl-2">
                {item.instances.map((instanceItem, index) => (
                  <div
                    key={instanceItem}
                    className={`relative ${index !== item.instances.length - 1 ? "mb-1" : ""}`}
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-px bg-gray-300"
                      style={{
                        bottom: index === item.instances.length - 1 ? "50%" : 0,
                      }}
                    />

                    <Button
                      onClick={() => {
                        setSelectAgentInstance(item.id, instanceItem);
                      }}
                      variant="ghost"
                      className={`relative justify-start px-4 w-full ml-2 ${instanceItem === instance ? "bg-muted" : ""}`}
                    >
                      <div className="absolute -left-2 top-1/2 w-2 h-px bg-gray-300" />
                      <Box className="w-3 h-3 mr-2" />
                      {instanceItem}
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
