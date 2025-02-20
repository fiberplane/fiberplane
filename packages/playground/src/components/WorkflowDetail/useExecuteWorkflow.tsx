import { api } from "@/lib/api";
import { useWorkflowStore } from "@/lib/workflowStore";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

export function useExecuteWorkflow() {
  const { resetOutputValues, setOutputValue } = useWorkflowStore(useShallow(({ resetOutputValues, setOutputValue }) => ({ resetOutputValues, setOutputValue })))
  return useMutation({
    mutationFn: api.executeWorkflow,
    onSuccess: (data) => {
      resetOutputValues()
      for (const [key, value] of Object.entries(data)) {
        setOutputValue(key, value);
      }
    }

  });
}
