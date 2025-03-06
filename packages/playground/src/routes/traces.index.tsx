import {
  TracesList,
  TracesListErrorBoundary,
} from "@/components/traces/TracesList";
import { useAuth } from "@/contexts/auth";
import { TRACES_KEY, tracesQueryOptions } from "@/lib/hooks/useTraces";
import { useHandler } from "@fiberplane/hooks";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/traces/")({
  component: TracesIndexPage,
  loader: async ({ context: { queryClient } }) => {
    // TODO - Pull this flag from the store
    const tracingEnabled = true;
    const response = await queryClient.ensureQueryData(
      tracesQueryOptions(tracingEnabled),
    );
    return { traces: response.data };
  },
  onError: (error) => {
    console.error("Error loading traces", error);
  },
  pendingComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h2 className="mb-2 text-lg font-medium">Loading traces...</h2>
      </div>
    );
  },
  errorComponent: TracesListErrorBoundary,

  // HACK - Forces us to refresh the traces list when the route is entered
  beforeLoad: async ({ context: { queryClient } }) => {
    // Force the loader to re-run when the route is entered
    await queryClient.invalidateQueries({ queryKey: [TRACES_KEY] });

    // Remove the query data
    queryClient.removeQueries({ queryKey: [TRACES_KEY] });
  },
});

function TracesIndexPage() {
  const { queryClient } = Route.useRouteContext();
  const user = useAuth();
  console.log("user", user);
  const { traces } = Route.useLoaderData();
  const router = useRouter();

  const reload = useHandler(async () => {
    if (router) {
      // Mark query as stale
      await queryClient.invalidateQueries({ queryKey: [TRACES_KEY] });

      // Evict query data
      queryClient.removeQueries({ queryKey: [TRACES_KEY] });

      // Trigger the route loader to run again
      await router.invalidate();
    } else {
      console.error("[reloading traces] No router found");
    }
  });

  if (!user) {
    return <div>You must be logged in to view traces</div>;
  }

  return <TracesList traces={traces} reload={reload} />;
}
