import { FpApiError } from "@/lib/api/errors";
import { Route } from "@/routes/workflows.$workflowId";
import { useHandler } from "@fiberplane/hooks";
import { CloudAlert } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
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

  useHotkeys(
    "mod+enter",
    () => {
      submit();
    },
    {
      enableOnFormTags: ["input"],
    },
  );

  const errorDetails =
    failureReason && failureReason instanceof FpApiError
      ? failureReason.details
      : undefined;
  const errorMessage = failureReason?.message;

  const testTitle = (
    <div className="grid justify-between items-center grid-cols-[1fr_auto]">
      <span>Test workflow</span>
      <RunButton isPending={isPending} error={failureReason} submit={submit} />
    </div>
  );

  return (
    <div className="overflow-y-auto h-full">
      <ListSection
        title={
          <div className="grid gap-2">
            <div>{workflow.summary}</div>
            <div className="text-muted-foreground">{workflow.description}</div>
          </div>
        }
        contentClassName="p-0 grid grid-cols-[2fr_1fr] h-full"
        className="h-full"
      >
        <ListSection
          title={testTitle}
          contentClassName="p-0 pt-2 h-full grid grid-rows-[auto_auto_1fr] order-t-0"
          className="rounded-none rounded-b-md border-0 border-t border-r"
        >
          <div>
            {errorMessage && !errorDetails && (
              <div className="grid items-center justify-center">
                <div className="border border-danger text-foreground m-2 rounded-md p-4 grid gap-1 max-w-[50ch]">
                  <div className="flex gap-2 font-bold">
                    <CloudAlert className="text-danger" />
                    <span>Workflow execution failed</span>
                  </div>
                  <div className="text-sm">{errorMessage}</div>
                </div>
              </div>
            )}
          </div>
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
                      key={key}
                      error={
                        errorDetails?.type === "VALIDATION_ERROR"
                          ? errorDetails.payload.find(
                              (detail) => detail.key === key,
                            )
                          : undefined
                      }
                      propertyKey={key}
                      schema={schema}
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
        <ListSection title="Steps" contentClassName="px-3 pr-2">
          <div>
            {workflow.steps.map((step, index) => (
              <StepperItem
                key={step.stepId}
                error={
                  errorDetails?.type === "EXECUTION_ERROR" &&
                  errorDetails.payload.stepId === step.stepId
                    ? errorDetails
                    : undefined
                }
                index={index}
                stepId={step.stepId}
                description={step.description}
                operation={step.operation}
                parameters={step.parameters}
              />
            ))}
          </div>
        </ListSection>
      </ListSection>
    </div>
  );
}
