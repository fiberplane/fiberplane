import { useShake } from "@/hooks";
import { cn } from "@/utils";
import { Play } from "lucide-react";
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

  return (
    <div className="flex gap-2">
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
