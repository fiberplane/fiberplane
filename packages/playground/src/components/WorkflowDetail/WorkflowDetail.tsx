import { Button } from "@/components/ui/button";

import { useOpenApiParse } from "@/lib/hooks/useOpenApiParse";
import {
  type OpenApiContext,
  useOpenApiSpec,
} from "@/lib/hooks/useOpenApiSpec";
import type { SupportedDocument } from "@/lib/isOpenApi";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/workflows.$workflowId";
import type { Workflow, WorkflowStep } from "@/types";
import {
  Link,
  // useRouteContext,
  useSearch,
} from "@tanstack/react-router";
import { Play, StepBack, StepForward } from "lucide-react";
import { CollapsibleList } from "./CollapsibleList";
import { InputItem } from "./InputItem";
import { ListSection } from "./ListSection";
import { OutputItem } from "./OutputItem";
import { RunButton } from "./RunButton";
import { StepDetails } from "./StepDetails";
import { StepperItem } from "./StepperItem";
import { WorkflowUrl } from "./WorkflowUrl";

export function WorkflowDetail() {
  const { workflow } = Route.useLoaderData();

  const testTitle = (
    <div className="grid justify-between items-center grid-cols-[1fr_auto]">
      <span>Test workflow</span>
      <RunButton id={workflow.workflowId} workflow={workflow} />
    </div>
  );

  return (
    <div className="overflow-y-auto h-full">
      <ListSection title={workflow.summary}>
        <div className="grid gap-2.5">
          <div className="grid grid-cols-[2fr_1fr] items-start gap-2">
            <div className="border p-2 grid gap-2 text-sm text-muted-foreground">
              <h4 className="text-foreground/70">Description</h4>
              {workflow.description}
            </div>
            <div className="border p-2 text-sm grid gap-2  text-muted-foreground">
              <h4 className="text-foreground/70">What are workflows?</h4>
              Workflows are sequences of requests against the API that can be used as custom POST endpoints. Workflows request all the necessary data in one place and resolve intermediate values.
            </div>
          </div>
          <div className="grid grid-cols-[2fr_1fr] items-start gap-2">
            <ListSection title={testTitle}>
              <WorkflowUrl workflowId={workflow.workflowId} />
              <div className="grid grid-cols-2 gap-2">
                <ListSection
                  title={
                    <div className="grid grid-cols-[1fr_auto]">
                      <span>Inputs</span>
                    </div>
                  }
                >
                  <div>
                    {Object.entries(workflow.inputs.properties).map(
                      ([key, schema]) => (
                        <InputItem
                          workflow={workflow}
                          key={key}
                          propertyKey={key}
                          schema={schema}
                          value={""}
                        />
                      ),
                    )}
                  </div>
                </ListSection>
                <ListSection title="Outputs">
                  {Object.entries(workflow.outputs).map(([key, output]) => (
                    <OutputItem key={key} output={output} />
                  ))}
                </ListSection>
              </div>
            </ListSection>
            <ListSection title="Steps">
              <div>
                {workflow.steps.map((step, index) => (
                  <StepperItem
                    key={step.stepId}
                    index={index}
                    stepId={step.stepId}
                    description={step.description}
                    operation={step.operation}
                  />
                ))}
              </div>
            </ListSection>
          </div>
        </div>
      </ListSection>
      {/* <OldWorkflowDetail
        workflow={workflow}
        openapi={openapi} /> */}
    </div>
  );
}

export function OldWorkflowDetail(props: {
  workflow: Workflow;
  openapi: OpenApiContext | undefined;
}) {
  const { workflow, openapi } = props;
  const { stepId } = useSearch({ from: Route.fullPath });

  const selectedStep =
    workflow.steps.find((step) => step.stepId === stepId) || workflow.steps[0];

  const { data: spec, error: loadingError } = useOpenApiSpec(openapi);
  const { data: validatedOpenApi, error: parsingError } = useOpenApiParse(spec);

  if (loadingError || parsingError) {
    return (
      <div className="grid h-full place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium">Error loading OpenAPI spec</h2>
          <p className="text-sm text-muted-foreground">
            {loadingError?.message || parsingError?.message}
          </p>
        </div>
      </div>
    );
  }

  const stepIndex = workflow.steps.findIndex(
    (step) => step.stepId === selectedStep.stepId,
  );

  const inputs = Object.entries(workflow.inputs.properties);
  return (
    <div
      className={cn(
        "grid h-full gap-4",
        selectedStep ? "grid-cols-3" : "grid-cols-1",
      )}
    >
      <div className="h-full p-4 overflow-auto border rounded-md">
        <div className="grid items-center justify-between mb-6">
          <div className="grid gap-1">
            <h2 className="text-2xl font-medium">{workflow.summary}</h2>
            {workflow.description && (
              <p className="text-sm text-foreground">{workflow.description}</p>
            )}
            <WorkflowUrl workflowId={workflow.workflowId} />
          </div>
        </div>

        <div className="grid gap-6">
          <ListSection title="Inputs">
            {inputs.length > 0 ? (
              <CollapsibleList
                items={inputs}
                maxItems={5}
                className="grid gap-2 max-w-[800px]"
                renderItem={([key, schema]) => (
                  <InputItem
                    workflow={workflow}
                    key={key}
                    propertyKey={key}
                    schema={schema}
                    value={""}
                  />
                )}
              />
            ) : (
              <em className="block text-sm text-center text-muted-foreground">
                No inputs required
              </em>
            )}
          </ListSection>
          <ListSection
            title={
              <div className="grid gap-2 items-center grid-cols-[1fr_auto]">
                <h3 className="flex items-center justify-between gap-2 text-lg font-medium">
                  Steps
                  <div className="flex items-center text-sm font-normal text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="w-auto gap-0 px-1 py-1 rounded-sm hover:text-muted"
                    >
                      <Play />
                      Run {workflow.steps.length} steps
                    </Button>
                  </div>
                </h3>
              </div>
            }
          >
            <div className="grid gap-1">
              <div className="grid">
                {workflow.steps.map((step, index) => (
                  <StepperItem
                    key={step.stepId}
                    index={index}
                    stepId={step.stepId}
                    operation={step.operation}
                    description={step.description}
                    selected={selectedStep.stepId === step.stepId}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 border-t h-fit text-muted-foreground border-t-muted">
                Go to
                <Link
                  to="."
                  className={cn(
                    "flex items-center gap-1 text-sm text-muted-foreground p-1 rounded-sm",
                    stepIndex <= 0
                      ? "pointer-events-none"
                      : "pointer-events-auto bg-secondary text-secondary-foreground hover:bg-primary/50",
                  )}
                  title="previous"
                  replace
                  search={
                    stepIndex > 0
                      ? (prev) => ({
                        ...prev,
                        stepId:
                          workflow.steps[stepIndex - 1]?.stepId ??
                          prev.stepId,
                      })
                      : undefined
                  }
                >
                  <StepBack className="w-4 h-4" />
                </Link>
                <Link
                  to="."
                  className={cn(
                    "flex items-center gap-1 text-sm text-muted-foreground  p-1 rounded-sm",
                    stepIndex < workflow.steps.length - 1 && stepIndex !== -1
                      ? "pointer-events-auto bg-secondary text-secondary-foreground hover:bg-primary/50 p-1 rounded-sm"
                      : "pointer-events-none",
                  )}
                  title="next"
                  search={
                    stepIndex < workflow.steps.length - 1 && stepIndex !== -1
                      ? (prev) => {
                        return {
                          ...prev,
                          stepId: workflow.steps[stepIndex + 1]?.stepId,
                        };
                      }
                      : undefined
                  }
                >
                  <StepForward className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ListSection>
        </div>
      </div>

      {selectedStep && validatedOpenApi && (
        <div className="col-span-2 overflow-y-auto">
          <StepDetails
            step={selectedStep}
            operationDetails={getOperationDetails(
              validatedOpenApi,
              selectedStep.operation,
            )}
            nextStepId={
              stepIndex < workflow.steps.length - 1
                ? workflow.steps[stepIndex + 1].stepId
                : undefined
            }
            previousStepId={
              stepIndex > 0 ? workflow.steps[stepIndex - 1].stepId : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
function getOperationDetails(
  validatedOpenApi: SupportedDocument,
  operationObject: WorkflowStep["operation"],
) {
  if (!validatedOpenApi) {
    return null;
  }

  if (!validatedOpenApi?.paths) {
    return null;
  }

  const method = operationObject.method;
  const path = operationObject.path;

  const pathObj = validatedOpenApi.paths[path];
  if (!pathObj) {
    return null;
  }

  type PathObjKeys = keyof typeof pathObj;

  // Assume that method results in a valid key
  // Also assume that the keys we care about are all lowercase
  const lowerCaseMethod = method.toLowerCase() as PathObjKeys;

  // Ignore non-methods properties
  const ignore = ["summary", "$ref", "description", "servers"] as const;
  if (lowerCaseMethod in ignore) {
    return null;
  }

  const operation = pathObj[lowerCaseMethod];
  if (!operation || typeof operation === "string") {
    return null;
  }

  if (Array.isArray(operation)) {
    // TODO handle array of operations
    return null;
  }

  return {
    method,
    path,
    operation,
  };
}
