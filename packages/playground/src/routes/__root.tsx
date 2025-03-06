import { AuthProvider } from "@/components/AuthProvider";
import { ErrorScreen } from "@/components/ErrorScreen";
import { WorkflowCommand } from "@/components/WorkflowCommand";
import { isFetchOpenApiSpecError } from "@/lib/api";
import type { UserProfile } from "@/lib/auth";
import { openApiSpecQueryOptions } from "@/lib/hooks/useOpenApiSpec";
import { userProfileQueryOptions } from "@/lib/hooks/useUser";
import { Icon } from "@iconify/react";
import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import React from "react";

type RootRouteContext = {
  queryClient: QueryClient;
  openapi:
    | {
        url?: string;
        content?: string;
      }
    | undefined;
  user: UserProfile | null;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootComponent,
  loader: async ({ context }) => {
    // if (!context.openapi?.url && !context.openapi?.content) {
    //   return { context };
    // }

    const hasFetchableOpenApiSpec =
      context.openapi?.url || context.openapi?.content;
    const queryOptions = openApiSpecQueryOptions(context.openapi);
    const openApiPromise = !hasFetchableOpenApiSpec
      ? Promise.resolve(null)
      : context.queryClient.ensureQueryData(queryOptions);

    const userPromise = context.queryClient.ensureQueryData(
      userProfileQueryOptions(),
    );

    const [openApiContent, userResponse] = await Promise.all([
      openApiPromise,
      userPromise,
    ]);

    console.log("userResponse", userResponse);
    console.log("userResponse.data", userResponse.data);

    return {
      // This is confusing the hell out of me.
      // It seems like this is not set as route context for downstream routes?
      // Then why are we descring it as "context" in the route loader?
      context: {
        ...context,
        ...(openApiContent && {
          openapi: {
            ...context.openapi,
            content: openApiContent,
          },
        }),
        user: userResponse.data ?? null,
      },
    };
  },

  pendingComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h2 className="mb-2 text-lg font-medium">Loading API Spec</h2>
      </div>
    );
  },

  staleTime: 10 * 60 * 1000,

  onError: (error) => {
    console.error("Error loading openapi spec", error);
  },
  errorComponent: ({ error, info }) => {
    if (isFetchOpenApiSpecError(error)) {
      return (
        <ErrorScreen
          error={error}
          title="Error fetching OpenAPI spec"
          message={
            error.message ??
            "Something went wrong while loading the OpenAPI spec."
          }
        />
      );
    }
    return (
      <ErrorBoundary
        error={error}
        info={info ? info : { componentStack: "" }}
      />
    );
  },
});

function RootComponent() {
  const loaderData = Route.useLoaderData();
  return (
    <AuthProvider user={loaderData.context.user}>
      <div className="min-h-screen bg-background">
        <div className="flex-1">
          <WorkflowCommand />
          <Outlet />
        </div>
        {/*  Commented out because they're annoying but leaving them here in case you need them */}
        {/* <TanStackRouterDevtools position="bottom-right" /> */}
          {/* <ReactQueryDevtools /> */}
        </div>
    </AuthProvider>
  );
}

function ErrorBoundary({
  error,
  info,
}: { error: Error; info: { componentStack: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center h-screen gap-2">
        <Icon
          icon="lucide:alert-triangle"
          width={48}
          height={48}
          className="text-danger"
        />
        <p className="text-lg">
          {error.message}
          {process.env.NODE_ENV !== "production" ? info?.componentStack : null}
        </p>
      </div>
      {/*  Commented out because they're annoying but leaving them here in case you need them */}
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
      {/* <ReactQueryDevtools /> */}
    </div>
  );
}

// NOTE - Only exported to avoid typescript errors during compilation when this is commented out
export const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

// NOTE - Only exported to avoid typescript errors during compilation when this is commented out
export const ReactQueryDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/react-query-devtools").then((res) => ({
          default: res.ReactQueryDevtools,
        })),
      );
