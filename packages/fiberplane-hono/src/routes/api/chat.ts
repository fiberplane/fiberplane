import { type Env, Hono, type ExecutionContext } from "hono";
import { logIfDebug } from "../../debug";
import type { FetchFn, FiberplaneAppType, OpenAPIOptions } from "../../types";
import { streamText, tool, createDataStream } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { stream } from "hono/streaming";
import { getContext } from "../../utils";

const createSystemPrompt = (openApiSpec?: OpenAPIOptions) => {
  let basePrompt = `
You are tasked with providing information about this API and making requests to it.

You are only to respond to requests about the API. Any other requests should be ignored and the user be informed about what you can do.

Be aware that user may submit requests in natural language, so you may need to parse the request and make an appropriate request to the API.

Options might be something like:
- Get all users
- Get user with id 123
- Create a new user
- Update user with id 123
- Delete user with id 123
- What are the routes
- What are the parameters for the /users route

ALWAYS try to coerce the user request into correct tool use and API call.

Be as concise as you can in your answers - only return the information requested.

<toolInformation>
Use the help tool to show the user what you can do.

Use the request tool to make requests to the API if the user asks you to do so. You are also only to make requests to the API that are allowed by the OpenAPI specification.

Use the route tool to list one or more routes that the user can interact with.

If you use any of these tools - you don't need to return anything else AFTER the tool has been called.
</toolInformation>
`;

  // If we have an OpenAPI spec, add it to the prompt
  if (openApiSpec?.content) {
    basePrompt += `<openApiSpec>\n\nHere is the API's OpenAPI specification:\n\n${openApiSpec.content}\n\n</openApiSpec>`;
  }

  return basePrompt;
};

const routeTool = tool({
  description: "Show information about available API routes",
  parameters: z.object({
    routes: z
      .array(
        z.object({
          method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
          path: z.string().describe("The API path to request"),
        })
      )
      .describe("List of available API routes"),
  }),
});

const requestTool = tool({
  description: "Make a request to an API endpoint",
  parameters: z.object({
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
    path: z.string().describe("The API path to request"),
    headers: z.record(z.string()).optional().describe("The request headers"),
    body: z
      .record(z.string(), z.any())
      .optional()
      .describe("The request body (for POST/PUT/PATCH)"),
    status: z.enum(["pending", "success", "error"]).optional(),
  }),
});

const helpTool = tool({
  description: "Show available options for interacting with the API",
  parameters: z.object({
    query: z
      .string()
      .optional()
      .describe("Optional query to filter help results"),
  }),
  execute: async () => {
    return Promise.resolve({
      options: [
        {
          title: "Ask about API endpoints",
          description:
            "You can ask questions about available API endpoints, their parameters, and expected responses",
          examples: [
            "'What endpoints are available?'",
            "'How do I use the users API?'",
            "'What parameters does the POST /api/users endpoint accept?'",
          ],
        },
        {
          title: "Make requests to API endpoints",
          description:
            "You can ask to perform API operations like fetching data or creating resources",
          examples: [
            "'Get all users'",
            "'Create a new user'",
            "'Update the user with ID 123'",
          ],
        },
      ],
    });
  },
});

export default function createChatApiRoute<E extends Env>(
  apiKey: string,
  fetchFn: FetchFn,
  fiberplaneServicesUrl: string,
  openApiSpec?: OpenAPIOptions
) {
  const app = new Hono<E & FiberplaneAppType<E>>();

  // Use the provided API key instead of the hardcoded one
  const openai = createOpenAI({
    apiKey,
  });

  // Store the resolved OpenAPI spec
  let resolvedOpenApiSpec = openApiSpec;

  // Flag to track if we've already tried to fetch the spec
  let specFetchAttempted = false;

  // If we have a URL, set up the spec fetching
  if (openApiSpec?.url) {
    const specUrl = openApiSpec.url;

    // We'll fetch the spec on the first request only
    app.use("*", async (c, next) => {
      // Only try to fetch once
      if (!specFetchAttempted) {
        specFetchAttempted = true;

        const result = await fetchOpenApiSpec(fetchFn, specUrl);
        if (result.success && result.content) {
          resolvedOpenApiSpec = { content: result.content };

          logIfDebug(
            c,
            "[chat]",
            "- OpenAPI Spec -",
            `Successfully cached OpenAPI spec from ${specUrl}`
          );
        } else {
          logIfDebug(
            c,
            "[chat]",
            "- OpenAPI Spec -",
            `Failed to fetch OpenAPI spec from ${specUrl}, will not retry`
          );
        }
      }

      await next();
    });
  }

  app.post("/", async (c) => {
    try {
      // Parse the request body to get messages
      const body = await c.req.json();
      const partitionKey = c.req.header("X-Fiberplane-Partition-Key");
      const { messages } = body;

      logIfDebug(
        c,
        "[chat]",
        "- POST /api/chat -",
        "Processing chat request with messages:",
        JSON.stringify(messages)
      );

      // Create a data stream that immediately starts streaming
      const dataStream = createDataStream({
        execute: async (dataStreamWriter) => {
          // Send an initial message to start streaming immediately
          dataStreamWriter.writeData("initializing chat response");

          const result = streamText({
            model: openai("gpt-4o", {
              user: `partition-key: ${partitionKey}`,
            }),
            system: createSystemPrompt(resolvedOpenApiSpec),
            messages,
            toolCallStreaming: true,
            tools: {
              request: requestTool,
              help: helpTool,
              route: routeTool,
            },
            maxSteps: 5,
          });

          // Merge the AI response into the data stream
          result.mergeIntoDataStream(dataStreamWriter);
        },
        onError: (error) => {
          logIfDebug(
            c,
            "[chat]",
            "- POST /api/chat -",
            "Error in data stream:",
            error
          );
          return error instanceof Error ? error.message : String(error);
        },
      });

      logIfDebug(
        c,
        "[chat]",
        "- POST /api/chat -",
        "Streamed response initialized"
      );

      // Mark the response as a v1 data stream
      c.header("X-Vercel-AI-Data-Stream", "v1");
      c.header("Content-Type", "text/plain; charset=utf-8");

      // Return the streamed response using Hono's streaming API
      return stream(c, (streamWriter) =>
        streamWriter.pipe(dataStream.pipeThrough(new TextEncoderStream()))
      );
    } catch (error) {
      logIfDebug(
        c,
        "[chat]",
        "- POST /api/chat -",
        "Error processing chat request:",
        error
      );

      return c.json({ error: "Failed to process chat request" }, 500);
    }
  });

  return app;
}

/**
 * Fetches the OpenAPI specification from a URL
 *
 * @param fetchFn The fetch function for external requests
 * @param specUrl The URL to fetch the OpenAPI spec from
 * @returns An object with success status and content if successful
 */
async function fetchOpenApiSpec<E extends Env>(
  fetchFn: FetchFn,
  specUrl: string
): Promise<{ success: boolean; content?: string }> {
  try {
    const c = getContext<E & FiberplaneAppType<E>>();
    const userApp = c.get("userApp");
    const userEnv = c.get("userEnv");
    const userExecutionCtx = c.get("userExecutionCtx");

    let response: Response;

    // Handle external URLs
    if (specUrl.startsWith("http")) {
      logIfDebug(
        true,
        "[chat]",
        "- OpenAPI Spec -",
        "Fetching from external URL:",
        specUrl
      );
      response = await fetchFn(specUrl);
      return processResponse(response, specUrl);
    }

    // Handle internal URLs - require userApp
    if (!userApp) {
      logIfDebug(
        true,
        "[chat]",
        "- OpenAPI Spec -",
        "userApp not available, cannot fetch internal URL:",
        specUrl
      );
      return { success: false };
    }

    // Fetch from internal URL using userApp
    logIfDebug(
      true,
      "[chat]",
      "- OpenAPI Spec -",
      "Fetching from internal URL using userApp:",
      specUrl
    );

    const baseUrl = new URL("http://localhost");
    const url = new URL(specUrl, baseUrl);
    const request = new Request(url, { method: "GET" });
    response = await userApp.request(request, {}, userEnv, userExecutionCtx);

    return processResponse(response, specUrl);
  } catch (error) {
    logIfDebug(
      true,
      "[chat]",
      "- OpenAPI Spec -",
      "Error fetching OpenAPI spec:",
      error instanceof Error ? error.message : String(error)
    );

    return { success: false };
  }
}

/**
 * Process the response from fetching an OpenAPI spec
 */
async function processResponse(
  response: Response,
  specUrl: string
): Promise<{ success: boolean; content?: string }> {
  // Check for HTTP errors
  if (!response.ok) {
    logIfDebug(
      true,
      "[chat]",
      "- OpenAPI Spec -",
      `Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`
    );
    return { success: false };
  }

  // Get and validate content
  const content = await response.text();
  if (!content || content.trim() === "") {
    logIfDebug(
      true,
      "[chat]",
      "- OpenAPI Spec -",
      "Received empty content from URL:",
      specUrl
    );
    return { success: false };
  }

  logIfDebug(
    true,
    "[chat]",
    "- OpenAPI Spec -",
    `Successfully fetched OpenAPI spec (${content.length} bytes)`
  );

  return { success: true, content };
}
