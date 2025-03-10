import type { ExecutionError } from "@/lib/api/errors";
import { Route } from "@/routes/workflows.$workflowId";
import type { WorkflowStep } from "@/types";
import { cn } from "@/utils";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { KeyValueTable } from "../../KeyValueTableV2";
import { Method } from "../../Method";
import { StatusCode } from "../../StatusCode";
import { useRoutes } from "../../playground/routes";
import { Button } from "../../ui/button";
import { ListSection } from "../ListSection";
import { StepDetailBodyViewer } from "./StepDetailBodyViewer";
import { useOpenInPlayground } from "./useOpenInPlayground";

export function StepDetail(
  props: Pick<
    WorkflowStep,
    "stepId" | "operation" | "description" | "parameters"
  > & {
    index: number;
    error?: ExecutionError;
  },
) {
  useRoutes();
  const { index, description, operation, stepId, error } = props;

  const { stepId: paramStepId } = Route.useSearch();

  // If paramStepId is defined, expanded is true if stepId matches paramStepId, otherwise it's true if there's an error
  const expanded = paramStepId ? stepId === paramStepId : error;

  // Make it easy to access the request and response
  const request = error?.payload.request;
  const response = error?.payload.response;

  // Get a function that opens the playground with the request and response
  const openInPlayground = useOpenInPlayground({
    operation,
    error,
  });

  return (
    <div
      className={cn(
        "block rounded-md relative",
        `before:content-[""] before:absolute before:border-l before:border-l-foreground/10 before:left-[15px] before:z-10`,
        "before:h-[calc(100%)] before:top-8 last:before:hidden",
      )}
    >
      <div className="pe-4">
        <Link
          type="button"
          className={cn(
            "w-full grid grid-cols-[auto_1fr] gap-4 pt-2 pb-2 px-1",
            {
              "hover:bg-muted rounded-md": !expanded,
              "cursor-default": expanded,
              "text-danger": !!error,
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
          <div className="ml-10 pr-2 pb-2 text-sm pl-2 pt-0 grid gap-4">
            <div className="grid gap-2 grid-cols-[1fr_auto] items-center">
              <div
                className={cn(
                  "grid gap-2 items-center",
                  response?.status
                    ? "grid-cols-[auto_auto_1fr]"
                    : "grid-cols-[auto_1fr]",
                )}
              >
                {response?.status && (
                  <StatusCode
                    status={response.status.toString()}
                    isFailure={false}
                  />
                )}
                <Method method={operation.method} />
                <span className="font-mono">{operation.path}</span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                className="w-auto px-2"
                onClick={openInPlayground}
              >
                <Play /> playground
              </Button>
            </div>
            {error && (
              <div className={cn("grid gap-4")}>
                {request && (
                  <ListSection
                    title={<span>Request</span>}
                    titleClassName="py-2 min-h-0 grid grid-cols-[auto_auto] justify-between"
                    contentClassName="grid gap-3 py-3"
                  >
                    <div className="grid gap-2">
                      <div>Url:</div>
                      <div className="text-muted-foreground">{request.url}</div>
                    </div>
                    <div>
                      Headers
                      <KeyValueTable
                        keyValue={Object.entries(request.headers)}
                      />
                    </div>
                    {request.body && (
                      <div className="grid gap-2">
                        Body
                        <StepDetailBodyViewer
                          body={request.body}
                          className="text-muted-foreground"
                        />
                      </div>
                    )}
                  </ListSection>
                )}
                {response?.status && (
                  <ListSection
                    title={
                      <div className="grid gap-2 grid-cols-[auto_auto] justify-start">
                        <span>Response</span>
                        <StatusCode
                          status={response.status.toString()}
                          isFailure={false}
                        />
                      </div>
                    }
                    titleClassName="py-2 min-h-0"
                  >
                    <div>
                      Headers
                      <KeyValueTable
                        keyValue={Object.entries(response.headers)}
                      />
                    </div>
                    <div className="grid gap-2">
                      Body
                      <StepDetailBodyViewer
                        body={response.body || ""}
                        className="text-muted-foreground"
                      />
                    </div>
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
