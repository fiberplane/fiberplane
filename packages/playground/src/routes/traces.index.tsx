import {
  TracesList,
  TracesListErrorBoundary,
} from "@/components/traces/TracesList";
import { tracesQueryOptions } from "@/lib/hooks/useTraces";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/traces/")({
  component: TracesIndexPage,
  loader: async ({ context: { queryClient, openapi } }) => {
    // TODO - Pull this from the store
    const tracingEnabled = true;
    console.time("ensureQueryData - traces");
    const response = await queryClient.ensureQueryData(
      tracesQueryOptions(tracingEnabled),
    );
    console.timeEnd("ensureQueryData - traces");
    // await new Promise((resolve) => setTimeout(resolve, 10000));
    return { traces: response.data, openapi };
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
});

function TracesIndexPage() {
  const loaderData = Route.useLoaderData();
  const { traces, openapi } = loaderData;

  return <TracesList traces={traces} openapi={openapi} />;
}
