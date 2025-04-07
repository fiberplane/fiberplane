import { AgentsList } from "@/components/AgentsList";
import { Layout } from "@/components/Layout";
import { Spinner } from "@/components/Spinner";
import { useListAgents } from "@/hooks";
import type { ListAgentsResponse } from "@/types";
import { useMinimumLoadingRefetch } from "@/useMinimumLoadingRefetch";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/")({
  component: AgentsListRoute,
  pendingComponent: () => (
    <Layout>
      <div className="h-full grid items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner spinning={true} />
          <span>Loading agents list...</span>
        </div>
      </div>
    </Layout>
  ),
});

function AgentsListRoute() {
  const agents = useLoaderData({ from: "__root__" }) as ListAgentsResponse;
  const { refetch: rawRefetch } = useListAgents();
  const [refetch, isLoading] = useMinimumLoadingRefetch(rawRefetch, 500);

  if (agents.length === 0) {
    return (
      <Layout>
        <div className="h-full grid items-center justify-center">
          <div className="grid gap-2 mx-auto border p-4 rounded-lg max-w-[400px]">
            <div className="flex items-center gap-2 justify-center">
              <HeartHandshake className="w-4 h-4" />
              <span>Oops. No agents found!</span>
            </div>
            <p className="text-muted-foreground">
              Please make sure you've decorated your Agents classes with the{" "}
              <code className="font-mono text-warning">`@Observed()`</code>{" "}
              decorator
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full w-full p-4">
        <AgentsList agents={agents} isLoading={isLoading} refetch={refetch} />
      </div>
    </Layout>
  );
}
