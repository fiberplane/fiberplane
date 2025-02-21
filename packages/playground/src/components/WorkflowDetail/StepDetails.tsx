import { Method } from "@/components/Method";
import { Button } from "@/components/ui/button";
import { FpTabsContent, FpTabsList, FpTabsTrigger } from "@/components/ui/tabs";
import { FpTabs } from "@/components/ui/tabs";
import { useShake } from "@/hooks";
import { useOpenApiParse } from "@/lib/hooks/useOpenApiParse";
import { useOpenApiSpec } from "@/lib/hooks/useOpenApiSpec";
import type { ExecuteStepResult } from "@/lib/hooks/useWorkflows";
import { useExecuteStep } from "@/lib/hooks/useWorkflows";
import {
  type SupportedOperationObject,
  isOpenApiV2,
  isOpenApiV3x,
} from "@/lib/isOpenApi";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { WorkflowStep } from "@/types";
import { Link, useRouteContext } from "@tanstack/react-router";
import { ArrowDownToDot, StepBack, StepForward } from "lucide-react";
import { useState } from "react";
import { CollapsibleList } from "./CollapsibleList";
import { ListSection } from "./ListSection";
import { OutputItem } from "./OutputItem";
import { ParameterItem } from "./ParameterItem";
import { StatusBadge } from "./StatusBadge";

interface StepDetailsProps {
  step: WorkflowStep;
  nextStepId?: string;
  previousStepId?: string;
  operationDetails: {
    method: string;
    path: string;
    operation: SupportedOperationObject;
  } | null;
}

export function StepDetails({
  step,
  operationDetails,
  nextStepId,
  previousStepId,
}: StepDetailsProps) {
  const {
    workflowState,
    resolveRuntimeExpression,
    setStepResult,
    setOutputValue,
  } = useWorkflowStore();
  const [responseView, setResponseView] = useState<"body" | "headers">("body");
  const executeStep = useExecuteStep();

  const openapi = useRouteContext({
    from: "__root__",
    select: (context) => context.openapi,
  });
  const { data: spec } = useOpenApiSpec(openapi);
  const { data: validatedOpenApi } = useOpenApiParse(spec);
  const { shakeClassName, triggerShake } = useShake();

  const addServiceUrlIfBarePath = (path: string) => {
    if (!validatedOpenApi) {
      return path;
    }

    if (isOpenApiV2(validatedOpenApi) && validatedOpenApi.host) {
      return new URL(path, validatedOpenApi.host).toString();
    }

    if (
      isOpenApiV3x(validatedOpenApi) &&
      validatedOpenApi.servers &&
      validatedOpenApi.servers?.length > 0
    ) {
      const baseUrl = validatedOpenApi.servers[0].url;
      return new URL(path, baseUrl).toString();
    }

    return path;
  };

  const handleExecute = () => {
    const method = step.operation.method;
    const path = step.operation.path;
    if (!method || !path) {
      return;
    }

    // Check if all parameters have resolved values
    const unresolvedParams = step.parameters.filter((param) => {
      const value = resolveRuntimeExpression(param.value);
      return value === param.value && param.value.startsWith("$");
    });

    if (unresolvedParams.length > 0) {
      // Don't execute if there are unresolved params
      return;
    }

    // Process parameters into query params and body
    const queryParams = new URLSearchParams();
    const lowerCaseMethod = method?.toLowerCase();
    const body: Record<string, unknown> | undefined =
      lowerCaseMethod === "get" || lowerCaseMethod === "head" ? undefined : {};
    let processedPath = path;

    for (const param of step.parameters) {
      const value = resolveRuntimeExpression(param.value);

      if (path.includes(`{${param.name}}`)) {
        processedPath = processedPath.replace(
          `{${param.name}}`,
          encodeURIComponent(String(value)),
        );
      } else if (
        lowerCaseMethod === "get" ||
        // HACK - Delete could support a body - not sure why we default to putting query params here
        lowerCaseMethod === "delete" ||
        lowerCaseMethod === "head"
      ) {
        queryParams.append(param.name, String(value));
      } else {
        if (body) {
          body[param.name] = value;
        } else {
          console.debug(
            "Trying to add some body params to a GET or HEAD request ... skipping to avoid errors!!",
          );
        }
      }
    }

    // Add query string if any params
    const queryString = queryParams.toString();
    if (queryString) {
      processedPath += (processedPath.includes("?") ? "&" : "?") + queryString;
    }

    // Add base URL
    const url = addServiceUrlIfBarePath(processedPath);

    executeStep.mutate(
      {
        stepId: step.stepId,
        url,
        method,
        body: body && Object.keys(body).length > 0 ? body : undefined,
      },
      {
        onSuccess: (result) => {
          // First store the step result
          setStepResult(step.stepId, result);

          // Then resolve outputs in next tick to ensure state is updated
          queueMicrotask(() => {
            for (const output of step.outputs) {
              const resolvedValue = resolveRuntimeExpression(output.value);
              setOutputValue(
                `$steps.${step.stepId}.outputs.${output.key}`,
                resolvedValue,
              );
            }
          });
        },
      },
    );
  };

  const stepState = workflowState[step.stepId];
  const result =
    executeStep.data?.stepId === step.stepId ? executeStep.data : undefined;
  const isLoading =
    executeStep.isPending && executeStep.variables?.stepId === step.stepId;

  const stepError = executeStep.error;
  const errorMessage =
    stepError === null
      ? null
      : stepError instanceof Error
        ? stepError.message
        : "An unknown error occurred";

  const hasUnresolvedParams = step.parameters.some((param) => {
    const value = resolveRuntimeExpression(param.value);
    return value === param.value && param.value.startsWith("$");
  });

  const unresolvedParams = step.parameters.filter((param) => {
    const value = resolveRuntimeExpression(param.value);
    return value === param.value && param.value.startsWith("$");
  });

  const stepMethod = step.operation.method;
  const stepPath = step.operation.path;

  return (
    <div className="h-full p-4 overflow-x-hidden overflow-y-auto border rounded-md ">
      <div className="max-w-[800px]">
        <div className="grid items-center mb-6">
          <div className="grid grid-cols-[1fr_auto] gap-1">
            <h2 className="text-2xl font-medium">{step.description}</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  if (hasUnresolvedParams) {
                    triggerShake();
                    e.preventDefault();
                    return;
                  }
                  handleExecute();
                }}
                size="sm"
                className={cn("gap-1", shakeClassName)}
                disabled={isLoading}
              >
                <ArrowDownToDot className="w-4 h-4" />
                {result ? "Re-run Step" : "Run Step"}
              </Button>
              <Link
                to="."
                className={cn(
                  "flex items-center gap-1 text-sm text-muted-foreground  p-1 rounded-sm",
                  previousStepId
                    ? "pointer-events-auto bg-secondary text-secondary-foreground hover:bg-primary/50"
                    : "pointer-events-none",
                )}
                search={(prev) => ({
                  ...prev,
                  stepId: previousStepId,
                })}
              >
                <StepBack className="w-4 h-4" />
              </Link>
              <Link
                to="."
                className={cn(
                  "flex items-center gap-1 text-sm text-muted-foreground  p-1 rounded-sm",
                  nextStepId
                    ? "pointer-events-auto bg-secondary text-secondary-foreground hover:bg-primary/50"
                    : "pointer-events-none",
                )}
                search={(prev) => ({
                  ...prev,
                  stepId: nextStepId,
                })}
              >
                <StepForward className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        {hasUnresolvedParams && (
          <ListSection title={<div className="">Issues</div>}>
            <p>Cannot execute: Unresolved values for parameters:</p>
            <ul className="mt-2 list-disc list-inside">
              {unresolvedParams.map((param) => (
                <li key={param.name} className="text-sm">
                  {param.name}: {param.value}
                </li>
              ))}
            </ul>
          </ListSection>
        )}

        <div className="grid gap-6">
          <div className="grid gap-4 overflow-scroll">
            <div className="flex justify-between gap-2 mx-1.5">
              <div>
                <p className="mb-1 text-sm font-medium">Operation</p>
                <div className="flex items-end gap-2 font-mono text-sm">
                  <Method method={operationDetails?.method || stepMethod} />
                  <span className="text-muted-foreground">
                    {operationDetails?.path || stepPath}
                  </span>
                </div>
                {operationDetails?.operation?.summary && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {operationDetails.operation.summary}
                  </p>
                )}
              </div>

              {/* Execution controls */}
            </div>
            {(result || executeStep.error || isLoading) && (
              <div className="mt-6 space-y-4">
                <div className="py-1.5 rounded-md bg-muted">
                  {errorMessage && (
                    <div className="p-3 rounded-md bg-destructive/10">
                      <pre className="text-sm text-destructive">
                        {String(errorMessage)}
                      </pre>
                    </div>
                  )}

                  {(!!result || !!stepState) && (
                    <FpTabs
                      value={responseView}
                      onValueChange={(value) =>
                        setResponseView(value as "body" | "headers")
                      }
                      className="grid grid-rows-[auto_1fr] overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-3 mx-2 mb-3">
                        <div className="text-sm font-medium">Response</div>
                        <StatusBadge
                          status={
                            isLoading
                              ? "pending"
                              : executeStep.error
                                ? "error"
                                : "success"
                          }
                          title={
                            result?.status
                              ? `Status code: ${result?.status}`
                              : undefined
                          }
                        />
                      </div>
                      <FpTabsList className="mx-2">
                        <FpTabsTrigger
                          key="body"
                          value="body"
                          className="flex items-center"
                        >
                          Body
                        </FpTabsTrigger>
                        <FpTabsTrigger
                          key="headers"
                          value="headers"
                          className="flex items-center"
                        >
                          Headers
                        </FpTabsTrigger>
                      </FpTabsList>
                      <FpTabsContent value="headers" className="h-full">
                        <div className="overflow-x-auto">
                          <pre className="p-3 text-sm rounded-md bg-background">
                            {String(
                              JSON.stringify(
                                (stepState as ExecuteStepResult)?.headers ??
                                  result?.headers ??
                                  {},
                                null,
                                2,
                              ),
                            )}
                          </pre>
                        </div>
                      </FpTabsContent>
                      <FpTabsContent value="body" className="h-full">
                        <div className="overflow-x-auto">
                          <pre className="p-3 text-sm rounded-md bg-background">
                            {String(
                              JSON.stringify(
                                (stepState as ExecuteStepResult)?.data ??
                                  result?.data,
                                null,
                                2,
                              ),
                            )}
                          </pre>
                        </div>
                      </FpTabsContent>
                    </FpTabs>
                  )}
                </div>
              </div>
            )}

            {step.parameters.length > 0 && (
              <ListSection title="Parameters">
                <CollapsibleList
                  items={step.parameters}
                  renderItem={(param) => (
                    <ParameterItem key={param.name} param={param} />
                  )}
                />
              </ListSection>
            )}
            {step.outputs.length > 0 && (
              <ListSection title="Outputs">
                <CollapsibleList
                  className="mx-1 overflow-hidden"
                  items={step.outputs}
                  renderItem={(output) => (
                    <OutputItem
                      key={output.key}
                      stepId={step.stepId}
                      output={output}
                    />
                  )}
                />
              </ListSection>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
