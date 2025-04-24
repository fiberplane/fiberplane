import { Button } from "@/components/ui/button";
import { useHandler } from "@/hooks";
import { usePlaygroundStore } from "@/store";
import type { AgentInstanceParameters } from "@/types";
import { WifiOff, WifiZero } from "lucide-react";

type Props = AgentInstanceParameters & {
  short: boolean;
};

export function StreamConnectionStatus(props: Props) {
  const connectionStatus = usePlaygroundStore((state) => {
    const agentState = state.agentsState[props.namespace];
    const instanceDetails = agentState?.instances[props.instance];
    return instanceDetails?.eventStreamStatus ?? "connecting";
  });

  const setAgentInstanceStreamStatus = usePlaygroundStore(
    (state) => state.setAgentInstanceStreamStatus,
  );
  console.log("connectionStatus", connectionStatus);

  const reconnect = useHandler(() => {
    setAgentInstanceStreamStatus(props.namespace, props.instance, "connecting");
  });

  return (
    <div
      className="flex gap-2 items-center text-sm text-muted-foreground"
      title={`Stream status: ${connectionStatus}`}
    >
      {connectionStatus === "connecting" ? (
        <>
          <WifiZero className="w-4 h-4 text-muted-foreground" />
          Connecting...
        </>
      ) : connectionStatus === "open" ? null : (
        <>
          <WifiOff className="w-4 h-4 text-danger" />
          <Button size="sm" variant="outline" onClick={reconnect}>
            Reconnect
          </Button>
        </>
      )}
    </div>
  );
}
