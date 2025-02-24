import { Route } from "@/routes/workflows.$workflowId";
import { InputItem } from "./InputItem";
import { ListSection } from "./ListSection";
import { OutputItem } from "./OutputItem";
import { RunButton } from "./RunButton";
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

  console.log("workflow", workflow);
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
              Workflows are sequences of requests against the API that can be
              used as custom POST endpoints. Workflows request all the necessary
              data in one place and resolve intermediate values.
            </div>
          </div>
          <div className="grid grid-cols-[2fr_1fr] items-start gap-2">
            <ListSection title={testTitle} contentClassName="p-0 pt-2">
              <WorkflowUrl workflowId={workflow.workflowId} />

              <div className="grid grid-cols-2 items-start gap-2">
                <ListSection
                  title={
                    <div className="grid grid-cols-[1fr_auto]">
                      <span>Inputs</span>
                    </div>
                  }
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
                <ListSection title="Outputs" contentClassName="grid gap-2">
                  {Object.entries(workflow.outputs).map(([key, output]) => (
                    <OutputItem key={key} output={output} />
                  ))}
                </ListSection>
              </div>
            </ListSection>
            <ListSection title="Steps" contentClassName="px-0 pr-2">
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
