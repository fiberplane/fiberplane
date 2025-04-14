import { redirect, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/agents/$agentId/$instanceId/")({
  loader: async ({ params }) => {
    const { agentId, instanceId } = params;
    throw redirect({
      to: "/agents/$agentId/$instanceId/$tabId",
      params: { agentId, instanceId, tabId: "state" },
      replace: true,
    });
  },
});
