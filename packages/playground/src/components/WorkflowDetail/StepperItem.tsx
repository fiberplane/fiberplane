import type { ExecutionError } from "@/lib/api/errors";
import { Route } from "@/routes/workflows.$workflowId";
import type { WorkflowStep } from "@/types";
import { cn } from "@/utils";
import { Link } from "@tanstack/react-router";
import { Link2Icon } from "lucide-react";
import { Method } from "../Method";
import { StatusCode } from "../StatusCode";
import { ListSection } from "./ListSection";

export function StepperItem(
  props: Pick<
    WorkflowStep,
    "stepId" | "operation" | "description" | "parameters"
  > & {
    index: number;
    error?: ExecutionError;
  },
) {
  const { index, description, operation, stepId, error } = props;

  const { stepId: paramStepId } = Route.useSearch();
  const expanded = paramStepId ? stepId === paramStepId : error;

  return (
    <div
      className={cn(
        "block rounded-md relative",
        `before:content-[""] before:absolute before:border-l before:border-l-foreground/10 before:left-[15px] before:z-10`,
        "before:h-[calc(100%)] before:top-8 last:before:hidden",
        {
          "border-danger": !!error,
        },
      )}
    >
      <div>
        <Link
          type="button"
          className={cn(
            "w-full grid grid-cols-[auto_1fr] gap-4 pt-2 pb-2 px-1",
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
          <div className="ml-10 pr-2 pb-2 text-sm pl-2 pt-0 grid gap-2">
            <div className="grid gap-2">
              <Link
                className={cn(
                  "grid grid-cols-[auto_auto_1fr] gap-2 items-center",
                  "hover:underline w-full",
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
            {error && (
              <div>
                {/* <div className="grid gap-2">
                <div>Inputs</div>
                <div className="grid gap-2">
                  {Object.entries(error.details.inputs).map(([name, value]) => <NameValueItem key={name} name={name} value={value} />)}
                </div>
              </div> */}
                {error.payload.response?.status && (
                  <ListSection
                    className="border-warning bg-warning/10"
                    title={
                      <div className="grid gap-2 grid-cols-[auto_auto] justify-start">
                        <span>HTTP Response</span>
                        <StatusCode
                          status={error.payload.response.status.toString()}
                          isFailure={false}
                        />
                      </div>
                    }
                    titleClassName="border-warning py-2 min-h-0"
                  >
                    <pre className="max-w-full overflow-auto font-mono">
                      <code>{error.payload.response.body}</code>
                    </pre>
                  </ListSection>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
