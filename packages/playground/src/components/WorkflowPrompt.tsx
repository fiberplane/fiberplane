import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useShake } from "@/hooks";
import { cn } from "@/lib/utils";
import { Spinner } from "./playground/Settings/Auths/Spinner";

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
  isPending: disabled,
}: WorkflowPromptProps) {
  const { shakeClassName, triggerShake } = useShake();
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Textarea
          value={userStory}
          disabled={disabled}
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
          disabled={disabled}
          size="sm"
          variant={disabled ? undefined : "primary"}
          className={cn(
            "flex-auto grid items-center w-36 transition-all",
            disabled ? "grid-cols-[auto_auto]" : "",
            shakeClassName,
          )}
        >
          {disabled ? (
            <>
              <div>
                <Spinner
                  spinning={disabled}
                  className="opacity-100 animate-fadeIn delay-300 both"
                />
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
