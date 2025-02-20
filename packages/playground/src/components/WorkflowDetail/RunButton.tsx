import { useWorkflowStore } from "@/lib/workflowStore";
import { Play } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../ui/button";
import { useExecuteWorkflow } from "./useExecuteWorkflow";
import { JSONPropertyValueSchema, Workflow } from "@/types";

export function RunButton({ id, workflow }: { id: string, workflow: Workflow }) {
  const { mutate: executeWorkflow, isPending } = useExecuteWorkflow();

  const { inputValues } = useWorkflowStore(
    useShallow(({ inputValues }) => ({ inputValues })),
  );
  return (
    <Button
      variant="primary"
      size="sm"
      className="h-6"
      disabled={isPending}
      onClick={(event) => {
        event.preventDefault();
        const parameters = parsedValues(inputValues, workflow);
        executeWorkflow({
          id,
          parameters,
        });
      }}
    >
      <Play />
      Run
    </Button>
  );
}


function parsedValues(inputValues: Record<string, string>, workflow: Workflow): Record<string, unknown> {
  const entries = Object.entries(inputValues).map(([key, value]) => {
    const schema = workflow.inputs.properties[key];
    if (schema) {
      return [key, constrainValueToSchema(value, schema)];
    }

    return [key, value];
  })
  return Object.fromEntries(entries);
}

function constrainValueToSchema(value: string, schema: JSONPropertyValueSchema) {
  switch (schema.type) {
    case "boolean": {

      if (value.toLowerCase() === "true") {
        return true;
      }

      if (value.toLowerCase() === "false" || schema.required) {
        return false;
      }
      return undefined;
    }
    case "integer": {
      if (!value) {
        return undefined;
      }

      return Number.parseInt(value);
    }
    case "object": {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    case "array": {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }

  }

  return value;
}
