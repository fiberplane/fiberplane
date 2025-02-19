import { useWorkflowStore } from "@/lib/workflowStore";
import type { JSONPropertyValueSchema, Workflow } from "@/types";
import type { ReactNode } from "react";
import { WorkflowInput } from "./WorkflowInput";

export function InputItem({
  workflow,
  propertyKey,
  schema,
}: {
  workflow: Workflow;
  propertyKey: string;
  value: string;
  schema: JSONPropertyValueSchema;
}): ReactNode {
  const { setInputValue, inputValues } = useWorkflowStore();
  const value = inputValues[propertyKey] || "";

  return (
    <div key={propertyKey} className="grid items-center gap-1 lg:grid-cols-2">
      <div className="pt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {schema.title || propertyKey}
          </span>
          <span className="text-xs text-muted-foreground">({schema.type})</span>
          {workflow.inputs.required?.includes(propertyKey) && (
            <span className="text-xs text-destructive">*required</span>
          )}
        </div>
        {schema.description && (
          <p className="text-sm text-muted-foreground">{schema.description}</p>
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
  );
}
