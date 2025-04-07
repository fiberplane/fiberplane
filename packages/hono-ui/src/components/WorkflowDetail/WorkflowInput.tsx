import type { ValidationDetail } from "@/lib/api/errors";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { JSONPropertyValueSchema } from "@/types";
import type { ReactNode } from "react";
import { WorkflowInputField } from "./WorkflowInputField";

export function WorkflowInput({
  propertyKey,
  schema,
  error,
}: {
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
          <div className="flex flex-wrap items-center gap-1 py-1">
            <span className="text-sm font-medium">
              {schema.title || propertyKey}
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
          <WorkflowInputField
            propertyKey={propertyKey}
            value={value}
            schema={schema}
            setInputValue={setInputValue}
          />
          {error && (
            <div className="text-danger grid gap-1 text-xs px-2 pt-0.5">
              {error.code === "required-property-error"
                ? value === ""
                  ? "This field is required"
                  : undefined
                : error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
