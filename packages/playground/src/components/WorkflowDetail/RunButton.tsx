import { useShake } from "@/hooks";
import { cn } from "@/utils";
import { CloudAlert, Play } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button";

export function RunButton({
  error,
  submit,
  isPending,
}: { isPending: boolean; error?: null | Error; submit: () => void }) {
  const { shakeClassName, triggerShake } = useShake();

  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error, triggerShake]);
  // console.log('isError', isError, failureReason);

  return (
    <div className="flex gap-2">
      {error && <CloudAlert className="text-danger" />}
      <Button
        variant="primary"
        size="sm"
        className={cn("h-6", shakeClassName)}
        disabled={isPending}
        onClick={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Play />
        Run
      </Button>
    </div>
  );
}

// const { inputValues } = useWorkflowStore(
//   useShallow(({ inputValues }) => ({ inputValues })),
// );
// const parameters = parsedValues(inputValues, inputs);
// executeWorkflow({
//   parameters,
// }).catch(() => triggerShake());
