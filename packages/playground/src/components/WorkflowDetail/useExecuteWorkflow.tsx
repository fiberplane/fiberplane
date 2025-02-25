import { api } from "@/lib/api";
import { useWorkflowStore } from "@/lib/workflowStore";
import type { JSONPropertyValueSchema, Workflow } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

export function useExecuteWorkflow(id: string, inputs: Workflow["inputs"]) {
  const { resetOutputValues, setOutputValue, inputValues } = useWorkflowStore(
    useShallow(({ resetOutputValues, setOutputValue, inputValues }) => ({
      resetOutputValues,
      setOutputValue,
      inputValues,
    })),
  );

  return useMutation({
    mutationFn: () => {
      const parameters = parsedValues(inputValues, inputs);
      return api.executeWorkflow({
        id,
        parameters,
      });
    },
    mutationKey: ["executeWorkflow", id],
    onSuccess: (data) => {
      resetOutputValues();
      for (const [key, value] of Object.entries(data)) {
        setOutputValue(key, value);
      }
    },
  });
}

function parsedValues(
  inputValues: Record<string, string>,
  inputs: Workflow["inputs"],
): Record<string, unknown> {
  const entries = Object.entries(inputValues).map(([key, value]) => {
    const schema = inputs.properties[key];
    if (schema) {
      return [key, constrainValueToSchema(value, schema)];
    }

    return [key, value];
  });
  return Object.fromEntries(entries);
}

function constrainValueToSchema(
  value: string,
  schema: JSONPropertyValueSchema,
) {
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
    case "number": {
      if (!value) {
        return undefined;
      }

      return Number.parseFloat(value);
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
