import { type Env, Hono } from "hono";
import type { FetchFn, FiberplaneAppType } from "../../types";
import createAssistantApiRoute from "./assistant";
import createReportsApiRoute from "./reports";
import createTokensApiRoute from "./tokens";
import createWorkflowsApiRoute from "./workflows";

/**
 * Creates the internal API router (except for the tracing routes)
 *
 * @NOTE - Tracing routes are not gated by a Fiberplane API key,
 *         so those routes are set up in a different factory.
 */
export default function createApiRoutes<E extends Env>(
  fetchFn: FetchFn,
  apiKey: string,
  fiberplaneServicesUrl: string,
) {
  const app = new Hono<E & FiberplaneAppType<E>>();

  app.route(
    "/workflows",
    createWorkflowsApiRoute(apiKey, fetchFn, fiberplaneServicesUrl),
  );
  app.route(
    "/tokens",
    createTokensApiRoute(apiKey, fetchFn, fiberplaneServicesUrl),
  );
  app.route(
    "/reports",
    createReportsApiRoute(apiKey, fetchFn, fiberplaneServicesUrl),
  );
  app.route(
    "/assistant",
    createAssistantApiRoute(apiKey, fetchFn, fiberplaneServicesUrl),
  );

  return app;
}
