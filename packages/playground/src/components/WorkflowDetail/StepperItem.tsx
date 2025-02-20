import type { WorkflowStep } from "@/types";
import { cn } from "@/utils";

export function StepperItem(
  props: Pick<WorkflowStep, "stepId" | "operation" | "description"> & {
    index: number;
    selected?: boolean;
  },
) {
  const { index, selected, description } = props;
  return (
    <div
      className={cn(
        "block rounded-md relative",
        `before:content-[""] before:absolute before:border-l before:border-l-foreground/10 before:left-[19px] before:z-10`,
        "before:h-[calc(100%)] before:top-8 last:before:hidden",
        selected ? "bg-primary/10" : "",
      )}
    >
      <div className="grid grid-cols-[auto_1fr] gap-4 py-2 px-2">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center z-10 relative",
            selected
              ? "bg-muted text-muted-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          <span className="">{index + 1}</span>
        </div>
        <div>{description}</div>
      </div>
    </div>
  );
}
