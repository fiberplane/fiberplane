import type { QueryClient } from "@tanstack/react-query";
import { z } from "zod";

// Define types for the result structure
export type DBColumnType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";

// Map SQLite column types to TypeScript types
type TypeMapping<T extends DBColumnType[]> = T extends ["string"]
  ? string
  : T extends ["null", "string"]
  ? string | null
  : T extends ["number"]
  ? number
  : T extends ["null", "number"]
  ? number | null
  : T extends ["boolean"]
  ? boolean
  : T extends ["null", "boolean"]
  ? boolean
  : T extends ["null"]
  ? null
  : T extends ["object"]
  ? Record<string, unknown>
  : T extends ["null", "object"]
  ? Record<string, unknown> | null
  : T extends ["array"]
  ? unknown[]
  : T extends Array<infer U>
  ? U extends DBColumnType
  ? unknown
  : never
  : unknown;

// Generic table type that ensures data matches column structure
export type DBTable<
  C extends Record<string, DBColumnType[]> = Record<string, DBColumnType[]>,
> = {
  columns: C;
  data: Array<{
    [K in keyof C]: TypeMapping<C[K]>;
  }>;
};

// Database result type
export type DatabaseResult = Record<string, DBTable>;

// API Types
export type AgentDetails = {
  id: string;
  scriptName: string | null;
  className: string;
  instances: Array<string>;
};

export type ListAgentsResponse = Array<AgentDetails>;

export const unset = Symbol("unset");

// Schema for an object that may contain a message property
// If message exists and is a string, it will be transformed by parsing it as JSON
export const MessagePayloadSchema = z
  .object({
    // Optional message property that's a string
    message: z
      .string()
      .optional()
      .transform((val, ctx) => {
        // If there's no message, return undefined
        if (!val) {
          return undefined;
        }

        try {
          // Attempt to parse the string as JSON
          return JSON.parse(val);
        } catch (error) {
          // If parsing fails, add an issue to the context and return the original string
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Failed to parse message as JSON: ${error instanceof Error ? error.message : "unknown error occurred"}`,
          });
          return val; // Return the original string if parsing fails
        }
      }),
    // You can add other properties to the schema as needed
  })
  .passthrough(); // Allow other properties not explicitly defined in the schema

export type MessagePayload = z.infer<typeof MessagePayloadSchema>;

/**
 * Schema for options passed from the server via data-options
 */
export const OptionsSchema = z.object({
  mountedPath: z.string().default("/fp"),
  version: z.string().optional(),
  commitHash: z.string().optional(),
});

/**
 * Extract the type from the Zod schema
 */
export type RouterOptions = z.infer<typeof OptionsSchema> & {
  queryClient: QueryClient;
};

/**
 * Schema for the agent/instance parameters
 */
export type AgentInstanceParameters = { namespace: string; instance: string };


// Define the schema for text parts
const TextPartSchema = z.object({
  type: z.literal('text'),
  text: z.string()
});

// Define the schema for tool invocation parts
const ToolInvocationPartSchema = z.object({
  type: z.literal('tool-invocation'),
  toolInvocation: z.object({
    state: z.string(),
    step: z.number(),
    args: z.object({}).catchall(z.any()),
    toolCallId: z.string(),
    toolName: z.string(),
    result: z.string()
  })
});

// Union type for parts
const MessagePartSchema = z.discriminatedUnion('type', [
  TextPartSchema,
  ToolInvocationPartSchema
]);

// Define the schema for tool invocations
const ToolInvocationSchema = z.object({
  state: z.string(),
  step: z.number(),
  args: z.object({}).catchall(z.any()),
  toolCallId: z.string(),
  toolName: z.string(),
  result: z.string()
});

// Define the schema for user messages
const UserMessageSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  role: z.literal('user'),
  content: z.string(),
  parts: z.array(z.union([
    z.object({
      type: z.literal('text'),
      text: z.string()
    }),
    // In the example, user messages only have text parts, 
    // but we'll allow for the possibility of other part types
    z.object({}).catchall(z.any())
  ]))
});

// Define the schema for assistant messages
const AssistantMessageSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  role: z.literal('assistant'),
  content: z.string(),
  toolInvocations: z.array(ToolInvocationSchema).optional(),
  parts: z.array(MessagePartSchema)
});

// Define the schema for scheduled messages from the user
const ScheduledMessageSchema = z.object({
  id: z.string(),
  role: z.literal('user'),
  content: z.string().startsWith('scheduled message:')
});

// Union type for messages
const MessageSchema = z.discriminatedUnion('role', [
  UserMessageSchema,
  AssistantMessageSchema
]);

// Define the root schema for cf_agent_chat_messages
const ChatMessagesSchema = z.object({
  type: z.literal('cf_agent_chat_messages'),
  messages: z.array(
    z.union([
      MessageSchema,
      ScheduledMessageSchema
    ])
  )
});

export type ChatMessages = z.infer<typeof ChatMessagesSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type UserMessage = z.infer<typeof UserMessageSchema>;
export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;
export type ScheduledMessage = z.infer<typeof ScheduledMessageSchema>;

export { ChatMessagesSchema };
