import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AgentDetails } from "@/types";
import { Button } from "../ui/button";
import { unset } from "../App";
import { BoxIcon, HeartHandshake } from "lucide-react";

type AgentCardProps = {
  agent: AgentDetails;
  selectAgent: (agent: string | typeof unset) => void;
  selectInstance: (instance: string | typeof unset) => void;
};

export function AgentCard({
  agent,
  selectAgent,
  selectInstance,
}: AgentCardProps) {
  return (
    <Card
      onClick={() => {
        console.log("card");
        selectAgent(agent.id);
        selectInstance(unset);
      }}
    >
      <CardHeader>
        <HeartHandshake className="w-4 h-4" />
        <CardTitle className="flex gap-2 items">{agent.id}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <p className="text-sm text-muted-foreground">
          Class Name: {agent.className}
        </p>
        <p className="text-sm text-muted-foreground">
          Script Name: {agent.scriptName ?? <em>null</em>}
        </p>
      </CardContent>
      <CardFooter className="grid gap-2">
        <span className="text-xs text-muted-foreground font-bold">
          Instances:
        </span>
        <div>
          {agent.instances.length > 0 &&
            agent.instances.map((instance) => (
              <Button
                key={instance}
                onClick={(event) => {
                  console.log("instance", instance);
                  event.stopPropagation();
                  selectAgent(agent.id);
                  selectInstance(instance);
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
      </CardFooter>
    </Card>
  );
}
