import { useWorkflowStore } from "@/lib/workflowStore";
import { NOT_FOUND } from "./ParameterItem";
import { useShallow } from "zustand/react/shallow";

export function OutputItem({
  output,
  stepId,
}: {
  output: { key: string; value: string };
  stepId?: string;
}) {
  // const fullStepId = stepId
  //   ? `$steps.${stepId}.outputs.${output.key}`
  //   : output.key;
  // const { resolveRuntimeExpression } = useWorkflowStore();
  // const resolvedValue = resolveRuntimeExpression(fullStepId);
  // const value = resolvedValue === fullStepId ? NOT_FOUND : resolvedValue;
  const { outputValues } = useWorkflowStore(useShallow(({ outputValues }) => ({ outputValues })))
  const value = outputValues[output.key] ?? NOT_FOUND
  return (
    <div className="text-sm grid grid-cols-[200px_auto] max-w-full overflow-hidden">
      <div>{output.key}</div>

      <div className="overflow-x-auto">
        {value === NOT_FOUND ? (
          <>
            <em className="text-muted-foreground">No value set</em>
          </>
        ) : (
          <>
            <pre className="max-w-full overflow-auto font-mono bg-background">
              <code>
                {JSON.stringify(value, null, "\t").replaceAll(
                  '],\n\t"',
                  '],\n\n\t"',
                )}
              </code>
            </pre>
            {/* <div className="font-sans text-sm text-muted-foreground">
              (value selector: {output.value})
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}
