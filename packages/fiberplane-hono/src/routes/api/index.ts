import { type Env, Hono } from "hono";
import type { FetchFn, FiberplaneAppType } from "../../types.js";
import createAssistantApiRoute from "./assistant.js";
import createReportsApiRoute from "./reports.js";
import createTokensApiRoute from "./tokens.js";
import createWorkflowsApiRoute from "./workflows.js";

/**
 * Creates the internal API router (except for the tracing routes)
 *
 * @NOTE - Tracing routes are not gated by a Fiberplane API key,
 *         so those routes are set up in a different factory.
 */
export default function createApiRoutes<E extends Env>(
  fetchFn: FetchFn,
  apiKey: string,
) {
  const app = new Hono<E & FiberplaneAppType<E>>();

  app.route("/workflows", createWorkflowsApiRoute(apiKey, fetchFn));
  app.route("/tokens", createTokensApiRoute(apiKey, fetchFn));
  app.route("/reports", createReportsApiRoute(apiKey, fetchFn));
  app.route("/assistant", createAssistantApiRoute(apiKey, fetchFn));

  return app;
}
