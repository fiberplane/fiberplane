import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AgentDetails } from "@/types";
import { BoxIcon, HeartHandshake } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type AgentCardProps = {
  agent: AgentDetails;
  selectAgent: (agent: string) => void;
  selectAgentInstance: (agent: string, instance: string) => void;
};

export function AgentCard({
  agent,
  selectAgent,
  selectAgentInstance,
}: AgentCardProps) {
  return (
    <Card
      onClick={() => {
        selectAgent(agent.id);
      }}
      className={
        cn(
          "cursor-pointer",
          "shadow transition-all duration-300 hover:shadow-[0_0_15px_hsla(var(--accent)/.3)]"
        )}
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
        <div className="flex gap-2">
          {agent.instances.length > 0 ? (
            agent.instances.map((instance) => (
              <Button
                key={instance}
                onClick={(event) => {
                  // Prevent the card from being clicked
                  event.stopPropagation();
                  selectAgentInstance(agent.id, instance);
                }}
                type="button"
                size="sm"
                className="bg-info/15 hover:bg-info/35"
              >
                <BoxIcon className="w-3.5 h-3.5" />
                {instance}
              </Button>
            ))
          ) : (
            <div className="text-muted-foreground italic">
              No instances detected yet
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
