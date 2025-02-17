import { Hono } from "hono";
import type { FiberplaneAppType } from "../../types.js";
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
export default function createApiRoutes(apiKey: string) {
  const app = new Hono<FiberplaneAppType>();

  app.route("/workflows", createWorkflowsApiRoute(apiKey));
  app.route("/tokens", createTokensApiRoute(apiKey));
  app.route("/reports", createReportsApiRoute(apiKey));
  app.route("/assistant", createAssistantApiRoute(apiKey));

  return app;
}
