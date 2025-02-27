import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useShake } from "@/hooks";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

interface WorkflowPromptProps {
  userStory: string;
  setUserStory: (userStory: string) => void;
  handleSubmit: () => Promise<unknown>;
  isPending: boolean;
}

export function WorkflowPrompt({
  userStory,
  setUserStory,
  handleSubmit,
  isPending,
}: WorkflowPromptProps) {
  const { shakeClassName, triggerShake } = useShake();
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Textarea
          value={userStory}
          disabled={isPending}
          onChange={(e) => setUserStory(e.target.value)}
          placeholder="Enter a user story or description..."
          className={cn("w-full bg-input text-foreground", "p-4")}
          rows={4}
        />
      </div>
      <div className="grid justify-end">
        <Button
          onClick={() => {
            handleSubmit().catch(() => triggerShake());
          }}
          disabled={isPending}
          size="sm"
          variant={isPending ? undefined : "primary"}
          className={cn(
            "flex-auto grid items-center w-32 transition-all",
            isPending ? "grid-cols-[auto_auto]" : "",
            shakeClassName,
          )}
        >
          {isPending ? (
            <>
              <div className="animate-fadeIn delay-2000 fill-mode-both">
                <LoaderCircle className="animate-spin ease-in-out duration-2000" />
              </div>
              Creating...
            </>
          ) : (
            " Create Workflow"
          )}
        </Button>
      </div>
    </div>
  );
}
