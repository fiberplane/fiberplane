import { Route } from "@/routes/workflows.$workflowId";
import type { WorkflowStep } from "@/types";
import { cn } from "@/utils";
import { Link } from "@tanstack/react-router";
import { Link2Icon } from "lucide-react";
import { Method } from "../Method";

export function StepperItem(
  props: Pick<
    WorkflowStep,
    "stepId" | "operation" | "description" | "parameters"
  > & {
    index: number;
  },
) {
  const { index, description, operation, stepId } = props;

  const { stepId: paramStepId } = Route.useSearch();
  const expanded = stepId === paramStepId;

  return (
    <div
      className={cn(
        "block rounded-md relative",
        `before:content-[""] before:absolute before:border-l before:border-l-foreground/10 before:left-[19px] before:z-10`,
        "before:h-[calc(100%)] before:top-8 last:before:hidden",
      )}
    >
      <div>
        <Link
          type="button"
          className={cn(
            "w-full grid grid-cols-[auto_1fr] gap-4 pt-4 pb-2 px-2",
            {
              "hover:bg-muted rounded-md": !expanded,
              "cursor-default": expanded,
            },
            "text-start",
          )}
          to="."
          search={(param) => {
            const newParams = { ...param };
            newParams.stepId = stepId;
            return newParams;
          }}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center z-10 relative",
              expanded
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span className="">{index + 1}</span>
          </div>
          <div>{description}</div>
        </Link>
        {expanded && (
          <div className="ml-10 pr-2 pb-2 text-sm pl-2 pt-0">
            <div className="grid">
              <div className="text-xs">Endpoint:</div>
              <Link
                className={cn(
                  "grid grid-cols-[auto_auto_1fr] gap-2 items-center",
                  "hover:underline  w-full",
                )}
                to="/"
                search={(params) => ({
                  ...params,
                  method: operation.method.toUpperCase(),
                  uri: operation.path,
                })}
              >
                <Method method={operation.method} />
                <span className="font-mono">{operation.path}</span>
                <Link2Icon className="w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
