import { type Env, Hono } from "hono";
import type { FetchFn, FiberplaneAppType, OpenAPIOptions } from "../../types";
import createAssistantApiRoute from "./assistant";
import createChatApiRoute from "./chat";
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
  chatApiKey?: string,
  openapi?: OpenAPIOptions
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
  
  // Add chat route if chat API key is available
  if (chatApiKey) {
    app.route(
      "/chat",
      createChatApiRoute(chatApiKey, fetchFn, fiberplaneServicesUrl, openapi),
    );
  } else {
    // Return an error for chat routes if chat API key is not available
    app.use("/chat/*", async (c) => {
      return c.json({ error: "Key for AI provider is not set" }, 403);
    });
  }

  return app;
}
