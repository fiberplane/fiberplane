import { WorkflowDetail } from "@/components/WorkflowDetail/WorkflowDetail";
import { workflowQueryOptions } from "@/lib/hooks/useWorkflows";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/workflows/$workflowId")({
  validateSearch: z.object({
    stepId: z.string().optional(),
  }),
  component: WorkflowDetail,
  loader: async ({ context: { queryClient }, params: { workflowId } }) => {
    const response = await queryClient.ensureQueryData(
      workflowQueryOptions(workflowId),
    );

    return { workflow: response.data };
  },
});
