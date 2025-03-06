import { useWorkflowStore } from "@/lib/workflowStore";
import { useShallow } from "zustand/react/shallow";
import { NameValueItem } from "./NameValueItem";
import { NOT_FOUND } from "./utils";

export function OutputItem({
  output,
}: {
  output: { key: string; value: string };
  stepId?: string;
}) {
  const { outputValues } = useWorkflowStore(
    useShallow(({ outputValues }) => ({ outputValues })),
  );
  const value = outputValues[output.key] ?? NOT_FOUND;
  return <NameValueItem name={output.key} value={value} />;
}
