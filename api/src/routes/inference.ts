import path from "node:path";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";
import { z } from "zod";
import { generateRequestWithAiProvider } from "../lib/ai/index.js";
import { cleanPrompt } from "../lib/ai/prompts.js";
import {
  type ExpandedFunctionResult,
  expandFunction,
} from "../lib/expand-function/index.js";
import { getInferenceConfig } from "../lib/settings/index.js";
import type { Bindings, Variables } from "../lib/types.js";
import logger from "../logger.js";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * REMOVE ME (eventually)
 *
 * This route is just here to quickly test the expand-function helper
 */
app.post("/v0/expand-function", cors(), async (ctx) => {
  const { handler } = await ctx.req.json();
  const expandedFunction = await expandFunctionForThisProject(handler);
  return ctx.json({ expandedFunction });
});

/**
 * Expand a handler function's out-of-scope identifiers to help with ai request generation
 *
 * ...
 *
 * @param handler - The stringified version of a handler function
 * @returns The handler function location with certain out-of-scope identifiers expanded
 */
async function expandFunctionForThisProject(handler: string) {
  // HACK - Assume we're in the project root for now
  //        We should either pick this up via an environment variable (from the CLI)
  //        or allow it to be set in settings.
  const projectRoot = path.resolve(process.env.FPX_WATCH_DIR ?? process.cwd());
  logger.debug(
    `Expanding function ${handler.slice(0, 20)} in project root ${projectRoot}`,
  );

  // HACK - Assume src/ directory exists
  // INVESTIGATE - Is src path even needed?
  const srcPath = path.join(projectRoot, "src");
  const expandedFunction = await expandFunction(projectRoot, srcPath, handler);
  return expandedFunction;
}

function transformExpandedFunction(
  expandedFunction: ExpandedFunctionResult | null,
) {
  if (!expandedFunction) {
    return undefined;
  }
  if (!expandedFunction.context?.length) {
    return undefined;
  }
  // HACK - Remove references to `console`... this should be fixed downstream in the expand-function lib
  const filteredContext = expandedFunction.context.filter(
    (context) => context.name !== "console",
  );
  // TODO - Improve this prompt info
  return filteredContext
    .map((context) =>
      `
    NAME: ${context.name}
    DEFINITION:
    ${context.definition?.text}
  `.trim(),
    )
    .join("\n---\n");
}

const generateRequestSchema = z.object({
  handler: z.string(),
  method: z.string(),
  path: z.string(),
  history: z.array(z.string()).nullish(),
  persona: z.string(),
  openApiSpec: z.string().nullish(),
  middleware: z
    .array(
      z.object({
        handler: z.string(),
        method: z.string(),
        path: z.string(),
      }),
    )
    .nullish(),
});

app.post(
  "/v0/generate-request",
  cors(),
  zValidator("json", generateRequestSchema),
  async (ctx) => {
    const { handler, method, path, history, persona, openApiSpec, middleware } =
      ctx.req.valid("json");

    const db = ctx.get("db");
    const inferenceConfig = await getInferenceConfig(db);

    if (!inferenceConfig) {
      return ctx.json(
        {
          message: "No inference configuration found",
        },
        403,
      );
    }

    // Expand out of scope identifiers in the handler function, to add as additional context
    const expandedFunction = await expandFunctionForThisProject(handler);
    const handlerContext = transformExpandedFunction(expandedFunction);
    // Generate the request
    const { data: parsedArgs, error: generateError } =
      await generateRequestWithAiProvider({
        inferenceConfig,
        persona,
        method,
        path,
        handler,
        handlerContext,
        history: history ?? undefined,
        openApiSpec: openApiSpec ?? undefined,
        middleware: middleware ? middleware : undefined,
      });

    if (generateError) {
      return ctx.json({ message: generateError.message }, 500);
    }

    return ctx.json({
      request: parsedArgs,
    });
  },
);

app.post(
  "/v0/analyze-error",
  cors(),
  zValidator(
    "json",
    z.object({ errorMessage: z.string(), handlerSourceCode: z.string() }),
  ),
  async (ctx) => {
    const { handlerSourceCode, errorMessage } = ctx.req.valid("json");

    const db = ctx.get("db");
    const inferenceConfig = await getInferenceConfig(db);
    if (!inferenceConfig) {
      return ctx.json(
        {
          error: "No OpenAI configuration found",
        },
        403,
      );
    }
    const { openaiApiKey, openaiModel } = inferenceConfig;
    const openaiClient = new OpenAI({
      apiKey: openaiApiKey,
    });
    const response = await openaiClient.chat.completions.create({
      model: openaiModel ?? "gpt-4o", // TODO - Update this to use correct model and provider (later problem)
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

export default app;
