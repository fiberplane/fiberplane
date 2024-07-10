import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";
import { z } from "zod";
import type { Bindings, Variables } from "../lib/types.js";

const FRIENDLY_PARAMETER_GENERATION_SYSTEM_PROMPT = cleanPrompt(`
  You are a code debugging assistant for apps that use Hono (web framework), 
  Neon (serverless postgres), Drizzle (ORM), and run on Cloudflare workers.
  You need to help craft a request to route handlers. 
  You will be provided the source code for handlers, and you should generate
  query parameters and a request body that will test the request.

  Be clever and creative with test data. Avoid just writing things like "test".

  For example, if you get a route like \`/users/:id\`, you should return a URL like:
  \`/users/1234567890\` and a pathParams parameter like this:

  { "pathParams": { "key": ":id", "value": "1234567890" } }

  Use the tool "make_request". Always respond in valid JSON.
`);

const QA_PARAMETER_GENERATION_SYSTEM_PROMPT = cleanPrompt(`
  You are an expert QA Engineer and code debugging assistant for apps that use Hono (web framework), 
  Neon (serverless postgres), Drizzle (ORM), and run on Cloudflare workers.

  You need to help craft a request to route handlers. 
  You will be provided the source code for handlers, and you should generate
  query parameters and a request body that will test the request.

  Be clever and creative with test data. Avoid just writing things like "test".

  For example, if you get a route like \`/users/:id\`, you should return a URL like:
  \`/users/1234567890\` and a pathParams parameter like this:

  { "pathParams": { "key": ":id", "value": "1234567890" } }

  You should focus on trying to break things. You are a QA. 
  You are the enemy of bugs. To protect quality, you must find bugs.
  Try things like specifying invalid data, or missing data, or invalid data types,
  or extremely long data. Try to break the system.

  Use the tool "make_request". Always respond in valid JSON.
`);

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.post("/v0/generate-request", cors(), async (ctx) => {
  const { handler, method, path, history, persona } = await ctx.req.json();

  const openaiClient = new OpenAI({
    apiKey: ctx.env.OPENAI_API_KEY,
  });

  const response = await openaiClient.chat.completions.create({
    // NOTE - This model should guarantee function calling to have json output
    model: "gpt-4o",
    // NOTE - We can restrict the response to be from this single tool call
    tool_choice: { type: "function", function: { name: "make_request" } },
    // Define the make_request tool
    tools: [
      {
        type: "function" as const,
        function: {
          name: "make_request",
          description:
            "Generates some random data for a request to the backend",
          // Describe parameters as json schema https://json-schema.org/understanding-json-schema/
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
              },
              pathParams: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    key: {
                      type: "string",
                    },
                    value: {
                      type: "string",
                    },
                  },
                },
              },
              queryParams: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    key: {
                      type: "string",
                    },
                    value: {
                      type: "string",
                    },
                  },
                },
              },
              body: {
                type: "string",
              },
            },
            // TODO - Mark fields like `pathParams` as required based on the route definition?
            required: ["path"],
          },
        },
      },
    ],
    messages: [
      {
        role: "system",
        content:
          persona === "QA"
            ? QA_PARAMETER_GENERATION_SYSTEM_PROMPT
            : FRIENDLY_PARAMETER_GENERATION_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: cleanPrompt(`
            I need to make a request to one of my Hono api handlers.

            Here are some recent requests/responses, which you can use as inspiration for future requests.
            ${persona !== "QA" ? "E.g., if we recently created a resource, you can look that resource up." : ""}

            <history>
            ${history?.join("\n") ?? "NO HISTORY"}
            </history>

            The request you make should be a ${method} request to route: ${path}

            Here is the code for the handler:
            ${handler}

            ${persona === "QA" ? "REMEMBER YOU ARE A QA. DELIBERATELY TRY TO MISUSE THE API." : ""}
          `),
      },
    ],
    temperature: 0.18,
    max_tokens: 4096,
  });

  const {
    choices: [{ message }],
  } = response;

  const makeRequestCall = message.tool_calls?.[0];
  const toolArgs = makeRequestCall?.function?.arguments;
  const parsedArgs = toolArgs ? JSON.parse(toolArgs) : null;

  return ctx.json({
    request: parsedArgs,
  });
});

app.post(
  "/v0/analyze-error",
  cors(),
  zValidator(
    "json",
    z.object({ errorMessage: z.string(), handlerSourceCode: z.string() }),
  ),
  async (ctx) => {
    const { handlerSourceCode, errorMessage } = ctx.req.valid("json");

    const openaiClient = new OpenAI({
      apiKey: ctx.env.OPENAI_API_KEY,
    });

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: cleanPrompt(`
            You are a code debugging assistant for apps that use Hono (web framework), 
            Neon (serverless postgres), Drizzle (ORM), and run on Cloudflare workers.
            You are given a function and an error message.
            Provide a succinct suggestion to fix the error, or say "I need more context to help fix this".
          `),
        },
        {
          role: "user",
          content: cleanPrompt(`
            I hit the following error: 
            ${errorMessage}
            This error originated in the following route handler for my Hono application:
            ${handlerSourceCode}
          `),
        },
      ],
      temperature: 0,
      max_tokens: 2048,
    });

    const {
      choices: [{ message }],
    } = response;

    return ctx.json({
      suggestion: message.content,
    });
  },
);

/**
 * Used in AI Builders Demo
 *
 * Takes in an fpx trace and tries to make sense of what happened when a route was invoked.
 */
app.post("/v0/summarize-trace-error/:traceId", cors(), async (ctx) => {
  const { handlerSourceCode, trace } = await ctx.req.json();
  const traceId = ctx.req.param("traceId");

  const openaiClient = new OpenAI({
    apiKey: ctx.env.OPENAI_API_KEY,
  });

  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: cleanPrompt(`
            You are a code debugging assistant for apps that use Hono (web framework), 
            Neon (serverless postgres), Drizzle (ORM), and run on Cloudflare workers.

            You are given a route handler and some trace events that happened when the handler was executed.

            Provide a succinct summary/overview of what happened, especially if there was an error.

            If you have a suggestion for a fix, give that too. But always be concise!!!

            We are rendering your response in a compact UI.

            If you don't see any errors, just summarize what happened as briefly as possible.

            Format your response as markdown. Do not include a "summary" heading specifically, because that's already in our UI.
          `),
      },
      {
        role: "user",
        content: cleanPrompt(`
            I tried to invoke the following handler in my hono app while making a request:
            ${handlerSourceCode}

            And this is a summary of event data (logs, network requests) that happened inside my app:
            ${trace.join("\n")}
          `),
      },
    ],
    temperature: 0,
    max_tokens: 2048,
  });

  const {
    choices: [{ message }],
  } = response;

  return ctx.json({
    summary: message.content,
    traceId,
  });
});

export default app;

function cleanPrompt(prompt: string) {
  return prompt
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .join("\n");
}
