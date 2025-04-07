import { Layout } from "@/components/Layout";
import { useRouterContext } from "@/hooks";
import { listAgentsQueryOptions } from "@/hooks/useListAgents";
import type { RouterOptions } from "@/types";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<RouterOptions>()({
  component: RootComponent,
  loader: async ({ context: { queryClient } }) => {
    const agents = await queryClient.ensureQueryData(listAgentsQueryOptions());
    return agents;
  },
  errorComponent: ({ error }) => {
    return (
      <Layout>
        <div className="h-full grid items-center justify-center">
          <div className="grid gap-2 mx-auto border p-4 rounded-lg max-w-[400px]">
            <h2 className="text-lg font-semibold">Unexpected Error</h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "An unknown error occurred"}
            </p>
          </div>
        </div>
      </Layout>
    );
  },
});

function RootComponent() {
  const { version, commitHash } = useRouterContext();

  if (version) {
    console.log(`Agent Playground version: ${version}`);
  }

  if (commitHash) {
    console.log(`Agent Playground commit hash: ${commitHash}`);
  }

  return (
    <div className="bg-popover text-foreground text-sm min-h-dvh min-w-dvw grid">
      <Outlet />
      {/* <TanStackRouterDevtools />
      <ReactQueryDevtools /> */}
    </div>
  );
}
