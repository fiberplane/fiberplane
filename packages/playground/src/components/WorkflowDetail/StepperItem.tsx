import type { WorkflowStep } from "@/types";
import { cn } from "@/utils";
import { Link } from "@tanstack/react-router";

export function StepperItem(
  props: Pick<WorkflowStep, "stepId" | "operation" | "description"> & {
    index: number;
    selected?: boolean;
  },
) {
  const { index, selected, stepId, description } = props;
  return (
    <Link
      to="."
      search={(prev) => ({ ...prev, stepId })}
      className={cn(
        "block rounded-md cursor-pointer relative",
        `before:content-[""] before:absolute before:border-l before:border-l-foreground before:left-[20px] before:z-10`,
        "before:h-[calc(100%)] before:top-8 last:before:hidden",
        selected ? "bg-primary/10" : "hover:bg-muted",
      )}
    >
      <div className="grid grid-cols-[auto_1fr] gap-4 py-2 px-2">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center z-10 relative",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-accent-foreground",
          )}
        >
          <span className="text-primary-foreground">{index + 1}</span>
        </div>
        <div>{description}</div>
      </div>
    </Link>
  );
}
