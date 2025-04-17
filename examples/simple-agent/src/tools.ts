/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool } from "ai";
import { z } from "zod";

import { agentContext } from "./server";

/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 * The actual implementation is in the executions object below
 */
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  parameters: z.object({ city: z.string() }),
  // Omitting execute function makes this tool require human confirmation
});

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: "get the local time for a specified location",
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  },
});

const scheduleTask = tool({
  description:
    "schedule a task to be executed at a later time. 'when' can be a date, a delay in seconds, or a cron pattern.",
  parameters: z.object({
    type: z.enum(["scheduled", "delayed", "cron"]),
    when: z.union([z.number(), z.string()]),
    payload: z.string(),
  }),
  execute: async ({ type, when, payload }) => {
    // we can now read the agent context from the ALS store
    const agent = agentContext.getStore();
    if (!agent) {
      throw new Error("No agent found");
    }
    try {
      agent.schedule(
        type === "scheduled"
          ? new Date(when) // scheduled
          : type === "delayed"
            ? when // delayed
            : when, // cron
        "executeTask",
        payload,
      );
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for ${when}`;
  },
});

const memoryTool = tool({
  description:
    "store or retrieve information from memory. Use this when the user wants to remember something or when they express preferences.",
  parameters: z.object({
    action: z.enum(["store", "retrieve"]),
    key: z.string().describe("The key to store or retrieve the memory under"),
    value: z
      .string()
      .optional()
      .describe("The value to store. Only required for store action."),
    context: z
      .string()
      .optional()
      .describe("Optional context about when/why this memory was stored"),
  }),
  execute: async ({ action, key, value, context }) => {
    const agent = agentContext.getStore();
    if (!agent) {
      throw new Error("No agent found");
    }

    const state = agent.state as {
      memories: Record<
        string,
        { value: string; timestamp: string; context?: string }
      >;
    };

    if (action === "store") {
      if (!value) {
        throw new Error("Value is required for store action");
      }

      state.memories[key] = {
        value,
        timestamp: new Date().toISOString(),
        context,
      };

      agent.setState(state);
      return `Stored memory under key "${key}"`;
    }

    const memory = state.memories[key];
    if (!memory) {
      return `No memory found for key "${key}"`;
    }
    return `Memory for "${key}": ${memory.value}${memory.context ? ` (Context: ${memory.context})` : ""}`;
  },
});

export const mcpServerTool = tool({
  description: "Register remote MCP servers in chat",
  parameters: z.object({
    url: z
      .string()
      .min(1)
      .url()
      .describe("The full URL of the remote MCP server"),
  }),
  execute: async ({ url }) => {
    const agent = agentContext.getStore();
    if (!agent) {
      throw new Error("Agent not found");
    }
    return agent.addMcpServer(url);
  },
});

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getWeatherInformation,
  getLocalTime,
  scheduleTask,
  memoryTool,
  mcpServerTool,
};

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  },
};
