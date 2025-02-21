import { useWorkflowStore } from "@/lib/workflowStore";
import { Route } from "@/routes/workflows.$workflowId";
import type { Parameter } from "@/types";
import { Link } from "@tanstack/react-router";
import { Edit } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../ui/button";
import { extractStepName } from "./utils";

export const NOT_FOUND = Symbol("NOT_FOUND");

export function ParameterItem({ param }: { param: Parameter }) {
  const { workflow } = Route.useLoaderData();
  const steps = workflow.steps;
  const { resolveRuntimeExpression } = useWorkflowStore(
    useShallow((state) => ({
      resolveRuntimeExpression: state.resolveRuntimeExpression,
    })),
  );
  const resolvedValue = resolveRuntimeExpression(param.value);
  const value = resolvedValue === param.value ? NOT_FOUND : resolvedValue;
  const stepName = extractStepName(param.value);
  const stepIndex = stepName
    ? steps.findIndex((step) => step.stepId === stepName)
    : -1;
  return (
    <div className="text-sm grid grid-cols-[200px_auto] max-w-full overflow-hidden">
      <div>{param.name}:</div>
      <div className="overflow-x-auto">
        {value === NOT_FOUND ? (
          param.value.startsWith("$steps.") ? (
            <div>
              <div className="italic text-danger">No value set</div>
              <div className="font-sans text-sm text-muted-foreground">
                (source:{" "}
                {stepName && (
                  <Link
                    className="underline text-foreground hover:text-accent"
                    to="."
                    search={(prev) => ({
                      ...prev,
                      stepId: stepName,
                    })}
                  >
                    {stepIndex !== -1 && stepIndex + 1}. {stepName}
                  </Link>
                )}
                , full selector: {param.value})
              </div>
            </div>
          ) : param.value.startsWith("$inputs.") ? (
            <div className="flex items-center justify-start gap-2">
              <div className="italic text-danger">No value set</div>
              <Button
                variant="outline"
                size="icon-xs"
                title={param.name}
                className="w-auto px-1 py-1 font-normal hover:text-primary-foreground"
              >
                <Edit />
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-start gap-2">
              {JSON.stringify(param.value)}
            </div>
          )
        ) : (
          <>
            <pre className="max-w-full overflow-auto font-mono bg-background">
              <code>
                {JSON.stringify(value, null, "\t").replaceAll(
                  '],\n\t"',
                  '],\n\n\t"',
                )}
              </code>
            </pre>
            <div className="font-sans text-sm text-muted-foreground">
              (value selector: {param.value}){" "}
              {stepName && (
                <Link
                  className="underline text-foreground hover:text-accent"
                  to="."
                  search={(prev) => ({
                    ...prev,
                    stepId: stepName,
                  })}
                >
                  {stepName}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
