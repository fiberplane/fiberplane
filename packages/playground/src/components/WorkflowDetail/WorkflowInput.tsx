import type { JSONPropertyValueSchema } from "@/types";
import { cn } from "@/utils";
import type { ReactNode } from "react";
import {
  CodeMirrorInput,
  codeMirrorClassNames,
} from "../CodeMirrorEditor/CodeMirrorInput";
import { Input } from "../ui/input";

export function WorkflowInput(props: {
  propertyKey: string;
  value: string;
  schema: JSONPropertyValueSchema;
  setInputValue: (key: string, value: string) => void;
}): ReactNode {
  const { propertyKey, value, schema, setInputValue } = props;
  switch (schema.type) {
    case "boolean":
      return (
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(event) =>
            setInputValue(propertyKey, event.target.checked ? "true" : "false")
          }
          name={schema.title}
        />
      );
    case "integer":
      return (
        <Input
          type="number"
          className={cn(codeMirrorClassNames, "bg-muted", "px-2")}
          placeholder="Enter an integer"
          value={value}
          onChange={(e) => setInputValue(propertyKey, e.target.value)}
          name={schema.title}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          className={cn(codeMirrorClassNames, "bg-muted")}
          value={value}
          onChange={(e) => setInputValue(propertyKey, e.target.value)}
          name={schema.title}
        />
      );
  }

  return (
    <CodeMirrorInput
      value={value || ""}
      onChange={(value) => setInputValue(propertyKey, value || "")}
      placeholder={schema.examples?.[0]?.toString() || `Enter ${schema.type}`}
      className="mt-1 bg-muted"
    />
  );
}
