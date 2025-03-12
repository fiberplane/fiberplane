import {
  TracesList,
  TracesListErrorBoundary,
} from "@/components/traces/TracesList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { isFpApiError } from "@/lib/api/errors";
import { type UserProfile, isAdmin, isOwner } from "@/lib/auth";
import { useLoginHandler } from "@/lib/hooks/useLogin";
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
  errorComponent: ({ error }) => {
    const user = useAuth();
    if (isFpApiError(error)) {
      if (!user && error.statusCode === 401) {
        return <Unauthenticated />;
      }
      if (user && error.statusCode === 403) {
        return <Unauthorized />;
      }
    }
    return <TracesListErrorBoundary error={error} />;
  },

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
    return <Unauthenticated />;
  }

  if (!canViewTraces(user)) {
    return <Unauthorized />;
  }

  return <TracesList traces={traces} reload={reload} />;
}

export function Unauthenticated() {
  const login = useLoginHandler();

  return (
    <div className="flex flex-col items-center justify-center h-full w-[400px] mx-auto p-8 gap-2">
      <h2 className="text-2xl font-semibold text-foreground">
        Authentication Required
      </h2>
      <p className="text-muted-foreground text-center">
        You must be logged in to view traces
      </p>
      <div className="mt-2">
        <Button onClick={login}>Log in</Button>
      </div>
    </div>
  );
}

export function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Unauthorized
      </h2>
      <p className="text-muted-foreground text-center">
        You are not authorized to view traces for this application.
      </p>
    </div>
  );
}

function canViewTraces(user: UserProfile | null) {
  return user && (isAdmin(user) || isOwner(user));
}
