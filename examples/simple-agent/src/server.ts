import { AsyncLocalStorage } from "node:async_hooks";
import { createOpenAI } from "@ai-sdk/openai";
import { Observed, fiberplane } from "@fiberplane/agents";
import {
  Agent,
  type Schedule,
  getAgentByName,
  routeAgentRequest,
} from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  type StreamTextOnFinishCallback,
  createDataStreamResponse,
  generateId,
  streamText,
} from "ai";
import { executions, tools } from "./tools";
import { processToolCalls } from "./utils";

interface MemoryState {
  memories: Record<
    string,
    {
      value: string;
      timestamp: string;
      context?: string;
    }
  >;
}

// we use ALS to expose the agent context to the tools
export const agentContext = new AsyncLocalStorage<ChatClient>();

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
// @ts-ignore
@Observed()
export class ChatClient extends AIChatAgent<Env, MemoryState> {
  initialState = { memories: {} };

  /**
   * Handles incoming chat messages and manages the response stream
   * @param onFinish - Callback function executed when streaming completes
   */

  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>) {
    // Create a streaming response that handles both text and tool outputs
    return agentContext.run(this, async () => {
      const dataStreamResponse = createDataStreamResponse({
        execute: async (dataStream) => {
          // Process any pending tool calls from previous messages
          // This handles human-in-the-loop confirmations for tools
          const processedMessages = await processToolCalls({
            messages: this.messages,
            dataStream,
            tools,
            executions,
          });

          // Initialize OpenAI client with API key from environment
          const openai = createOpenAI({
            apiKey: this.env.OPENAI_API_KEY,
          });

          // Cloudflare AI Gateway
          // const openai = createOpenAI({
          //   apiKey: this.env.OPENAI_API_KEY,
          //   baseURL: this.env.GATEWAY_BASE_URL,
          // });

          // Stream the AI response using GPT-4
          const result = streamText({
            model: openai("gpt-4o-2024-11-20"),
            system: `
              You are a helpful assistant that can do various tasks. If the user asks, then you can also schedule tasks to be executed later. The input may have a date/time/cron pattern to be input as an object into a scheduler The time is now: ${new Date().toISOString()}.
              `,
            messages: processedMessages,
            tools,
            onFinish,
            maxSteps: 10,
          });

          // Merge the AI response stream with tool execution outputs
          result.mergeIntoDataStream(dataStream);
        },
      });

      return dataStreamResponse;
    });
  }

  async executeTask(description: string, task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        content: `scheduled message: ${description}`,
      },
    ]);
  }
}

// @ts-ignore
@Observed()
export class CustomClient extends Agent<Env, MemoryState> {
  async executeTask(description: string, task: Schedule<string>) {
    // Custom implementation for executing tasks
    console.log(`Executing task: ${description} at ${task}`);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
const worker = {
  fetch: fiberplane<Env>(
    async (request: Request, env: Env, ctx: ExecutionContext) => {
      if (!env.OPENAI_API_KEY) {
        console.error(
          "OPENAI_API_KEY is not set, don't forget to set it locally in .dev.vars, and use `wrangler secret bulk .dev.vars` to upload it to production",
        );
        return new Response("OPENAI_API_KEY is not set", { status: 500 });
      }

      // Only call this to generate some traffic to the custom client
      // completely outside of the backend agent routing logic
      // Make a call
      await doSomethingWithCustomClient(request, env);
      // return a response
      // return new Response("Not found", { status: 404 });

      // Use the agent request routing as provided by the agents library
      return (
        // Route the request to our agent or return 404 if not found
        (await routeAgentRequest(request, env)) ||
        new Response("Not found", { status: 404 })
      );
    },
  ),
};

async function doSomethingWithCustomClient(request: Request, env: Env) {
  const agent = await getAgentByName(env.CustomClient, "my-custom-client");
  if (!agent) {
    console.error("Agent not found");
    return new Response("Agent not found", { status: 404 });
  }
  agent.fetch(
    new Request("https://example.com", {
      headers: {
        "x-partykit-room": "my-custom-client",
      },
    }),
  );
}

export default worker;
