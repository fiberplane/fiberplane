import type { ValidationDetail } from "@/lib/api/errors";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { JSONPropertyValueSchema, Workflow } from "@/types";
import type { ReactNode } from "react";
import { WorkflowInput } from "./WorkflowInput";

export function InputItem({
  workflow,
  propertyKey,
  schema,
  error,
}: {
  workflow: Workflow;
  propertyKey: string;
  schema: JSONPropertyValueSchema;
  error?: ValidationDetail;
}): ReactNode {
  const { setInputValue, inputValues } = useWorkflowStore();
  const value = inputValues[propertyKey] || "";

  return (
    <div>
      <div key={propertyKey} className="grid items-start gap-2 lg:grid-cols-2">
        <div>
          <div className="flex flex-wrap items-center gap-2 py-1">
            <span className="text-sm font-medium">
              {schema.title || propertyKey}
              {workflow.inputs.required?.includes(propertyKey) && (
                <span className="text-xs text-destructive" title="(required)">
                  *
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              ({schema.type})
            </span>
          </div>
          {schema.description && (
            <p className="text-sm text-muted-foreground">
              {schema.description}
            </p>
          )}
          {schema.examples && schema.examples.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Example: {JSON.stringify(schema.examples[0])}
            </p>
          )}
        </div>

        <div>
          <WorkflowInput
            propertyKey={propertyKey}
            value={value}
            schema={schema}
            setInputValue={setInputValue}
          />
        </div>
      </div>
      {error && (
        <div>
          {/* <div className="grid items-center justify-center"> */}
          <div className="text-danger grid gap-1 text-xs font-sans">
            {/* <div className="text-sm"> */}
            {/* {error.code === "required-property-error" && value === "" ? "field is required" : error.message} */}
            {error.message}
            {/* </div> */}
          </div>
          {/* </div> */}
        </div>
      )}
    </div>
  );
}
