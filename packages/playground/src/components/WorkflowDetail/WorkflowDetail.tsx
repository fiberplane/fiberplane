import { FpApiError } from "@/lib/api/errors";
import { Route } from "@/routes/workflows.$workflowId";
import { safeParseJson } from "@/utils";
import { useHandler } from "@fiberplane/hooks";
import { CloudAlert } from "lucide-react";
import { useMemo } from "react";
import { InputItem } from "./InputItem";
import { ListSection } from "./ListSection";
import { OutputItem } from "./OutputItem";
import { RunButton } from "./RunButton";
import { StepperItem } from "./StepperItem";
import { WorkflowUrl } from "./WorkflowUrl";
import { useExecuteWorkflow } from "./useExecuteWorkflow";

export function WorkflowDetail() {
  const { workflow } = Route.useLoaderData();

  const {
    mutate: executeWorkflow,
    isPending,
    failureReason,
  } = useExecuteWorkflow(workflow.workflowId, workflow.inputs);
  const submit = useHandler(() => {
    return executeWorkflow();
  });

  const failureDetails = useMemo(() => {
    if (
      failureReason &&
      failureReason instanceof FpApiError &&
      failureReason.details
    ) {
      try {
        const result = safeParseJson(failureReason.details);
        // TODO: use zod validation schema here
        if (typeof result === "object" && "error" in result) {
          if (
            typeof result.error === "object" &&
            "type" in result.error &&
            result.error.type === "WORKFLOW_ERROR"
          ) {
            return result.error as {
              type: "WORKFLOW_ERROR";
              message: string;
              details: { stepId: string; path: string; method: string };
            };
          }

          if (typeof result.error === "string") {
            return {
              type: "WORKFLOW_ERROR",
              message: result.error,
            };
          }
        }
      } catch (error) {
        return undefined;
      }
      return undefined;
    }
  }, [failureReason]);
  const errorMessage = failureDetails?.message || failureReason?.message;

  const testTitle = (
    <div className="grid justify-between items-center grid-cols-[1fr_auto]">
      <span>Test workflow</span>
      <RunButton isPending={isPending} error={failureReason} submit={submit} />
    </div>
  );

  return (
    <div className="overflow-y-auto h-full">
      <ListSection title={workflow.summary}>
        <div className="grid gap-2.5">
          <div className="grid grid-cols-[2fr_1fr] items-start gap-2">
            <div className="border rounded-md p-2 grid gap-2 text-sm text-muted-foreground">
              <h4 className="text-foreground/70 mb-2">Description</h4>
              {workflow.description}
            </div>
            <div className="border rounded-md p-2 text-sm grid gap-2 text-muted-foreground">
              <h4 className="text-foreground/70">What are workflows?</h4>
              Workflows are sequences of requests against the API that can be
              used as custom POST endpoints. Workflows request all the necessary
              data in one place and resolve intermediate values.
            </div>
          </div>
          <div className="grid grid-cols-[2fr_1fr] items-start gap-2">
            <ListSection title={testTitle} contentClassName="p-0 pt-2">
              {errorMessage && (
                <div className="grid items-center justify-center">
                  <div className="border border-danger text-foreground m-2 rounded-md p-2 grid gap-2 max-w-[50ch]">
                    <div className="flex gap-2 font-bold">
                      <CloudAlert className="text-danger" />
                      <span>Workflow execution failed</span>
                    </div>
                    <div className="text-sm">{errorMessage}</div>
                  </div>
                </div>
              )}
              <WorkflowUrl workflowId={workflow.workflowId} />

              <div className="grid grid-cols-2 items-stretch">
                <ListSection
                  title={
                    <div className="flex justify-between items-center">
                      <span>Inputs</span>
                    </div>
                  }
                  className="rounded-none rounded-b-md border-0 border-t border-r"
                >
                  <div className="grid gap-2">
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
                <ListSection
                  title="Outputs"
                  className="rounded-none rounded-b-md border-0 border-t"
                  contentClassName="grid gap-2 items-start"
                >
                  {Object.entries(workflow.outputs).map(([key, output]) => (
                    <OutputItem key={key} output={output} />
                  ))}
                </ListSection>
              </div>
            </ListSection>
            <ListSection title="Steps" contentClassName="px-1 pr-2">
              <div>
                {workflow.steps.map((step, index) => (
                  <StepperItem
                    key={step.stepId}
                    index={index}
                    stepId={step.stepId}
                    description={step.description}
                    operation={step.operation}
                    parameters={step.parameters}
                  />
                ))}
              </div>
            </ListSection>
          </div>
        </div>
      </ListSection>
    </div>
  );
}
