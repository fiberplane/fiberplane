import type { QueryClient } from "@tanstack/react-query";
import type { ToolCall, ToolResult } from "ai";
import { z } from "zod";
import { tryCatch } from "./lib/utils";

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

// JSON value schema for nested JSON structures
const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);

// Define schemas for Message parts (UI parts)
const textUIPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const reasoningUIPartSchema = z.object({
  type: z.literal("reasoning"),
  reasoning: z.string(),
  details: z.array(
    z.union([
      z.object({
        type: z.literal("text"),
        text: z.string(),
        signature: z.string().optional(),
      }),
      z.object({
        type: z.literal("redacted"),
        data: z.string(),
      }),
    ]),
  ),
});

// For tool invocation part, we need to define the ToolInvocation schema
const toolCallSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.any(),
});

const toolResultSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.any(),
  result: z.any(),
});

const toolInvocationSchema = z.union([
  toolCallSchema.extend({
    state: z.literal("partial-call"),
    step: z.number().optional(),
  }),
  toolCallSchema.extend({
    state: z.literal("call"),
    step: z.number().optional(),
  }),
  toolResultSchema.extend({
    state: z.literal("result"),
    step: z.number().optional(),
  }),
]);

const toolInvocationUIPartSchema = z.object({
  type: z.literal("tool-invocation"),
  toolInvocation: toolInvocationSchema,
});

const sourceUIPartSchema = z.object({
  type: z.literal("source"),
  source: z.object({}).passthrough(), // LanguageModelV1Source structure
});

const fileUIPartSchema = z.object({
  type: z.literal("file"),
  mimeType: z.string(),
  data: z.string(), // base64 encoded data
});

const stepStartUIPartSchema = z.object({
  type: z.literal("step-start"),
});

const uiPartSchema = z.union([
  textUIPartSchema,
  reasoningUIPartSchema,
  toolInvocationUIPartSchema,
  sourceUIPartSchema,
  fileUIPartSchema,
  stepStartUIPartSchema,
]);

// Define the Attachment schema
const attachmentSchema = z.object({
  name: z.string().optional(),
  contentType: z.string().optional(),
  url: z.string(),
});

// Complete Message schema based on the imported type from UI utils
const chatMessageSchema = z.object({
  id: z.string(),
  createdAt: z.string().optional(),
  content: z.string(),
  reasoning: z.string().optional(),
  experimental_attachments: z.array(attachmentSchema).optional(),
  role: z.union([
    z.literal("system"),
    z.literal("user"),
    z.literal("assistant"),
    z.literal("data"),
  ]),
  data: jsonValueSchema.optional(),
  annotations: z.array(jsonValueSchema).optional(),
  toolInvocations: z.array(toolInvocationSchema).optional(),
  parts: z.array(uiPartSchema).optional(),
});

// Schema for RequestInit fields that are allowed in IncomingMessage
const requestInitSchema = z.object({
  method: z.string().optional(),
  keepalive: z.boolean().optional(),
  headers: z.record(z.string()).or(z.instanceof(Headers)).optional(),
  body: z.any().optional(), // Could be string, FormData, etc.
  redirect: z.enum(["follow", "error", "manual"]).optional(),
  integrity: z.string().optional(),
  credentials: z.enum(["omit", "same-origin", "include"]).optional(),
  mode: z.enum(["cors", "no-cors", "same-origin", "navigate"]).optional(),
  referrer: z.string().optional(),
  referrerPolicy: z
    .enum([
      "",
      "no-referrer",
      "no-referrer-when-downgrade",
      "same-origin",
      "origin",
      "strict-origin",
      "origin-when-cross-origin",
      "strict-origin-when-cross-origin",
      "unsafe-url",
    ])
    .optional(),
  window: z.any().optional(), // This might need refinement depending on use case
});

export const agentChatMessagesSchema = z.object({
  type: z.literal("cf_agent_chat_messages"),
  messages: z.array(chatMessageSchema),
});

export const agentUseChatResponseSchema = z.object({
  type: z.literal("cf_agent_use_chat_response"),
  id: z.string(),
  body: z.string(),
  done: z.boolean(),
});

export const agentChatClearSchema = z.object({
  type: z.literal("cf_agent_chat_clear"),
});

export const agentStateSchema = z.object({
  type: z.literal("cf_agent_state"),
  state: z.unknown(),
});

export const agentUseChatRequestSchema = z.object({
  type: z.literal("cf_agent_use_chat_request"),
  id: z.string(),
  init: requestInitSchema,
  url: z.string().optional(),
});
// IncomingMessage schema
export const incomingMessageSchema = z.discriminatedUnion("type", [
  agentUseChatRequestSchema,
  agentChatClearSchema,
  agentChatMessagesSchema,
  agentStateSchema,
]);

// OutgoingMessage schema
export const outgoingMessageSchema = z.discriminatedUnion("type", [
  agentChatMessagesSchema,
  agentUseChatResponseSchema,
  agentChatClearSchema,
  agentStateSchema,
]);

export const messageWithTypeSchema = z.union([
  z.object({
    type: z.string(),
  }),
  z.record(z.unknown()),
]);

// Export types inferred from the schemas
export type IncomingMessage = z.infer<typeof incomingMessageSchema>;
export type OutgoingMessage = z.infer<typeof outgoingMessageSchema>;

// Helper functions to validate messages
export function validateIncomingMessage(message: unknown): IncomingMessage {
  return incomingMessageSchema.parse(message);
}

export function validateOutgoingMessage(message: unknown): OutgoingMessage {
  return outgoingMessageSchema.parse(message);
}

// Safe parsers that return success/error instead of throwing
export function safeParseIncomingMessage(message: unknown) {
  return incomingMessageSchema.safeParse(message);
}

export function safeParseOutgoingMessage(message: unknown) {
  return outgoingMessageSchema.safeParse(message);
}

// Define a more specific type for HTTP request payloads
export interface HttpRequestPayload {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  [key: string]: unknown;
}

export interface HttpResponsePayload {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  url: string;
  method: string;
  body?: unknown;
  [key: string]: unknown;
}

// // Event types
// export const agentEventTypeSchema = z.enum([
//   "stream_open",
//   "stream_error",
//   "stream_close",
//   "http_request",
//   "http_response",
//   "ws_open",
//   "ws_close",
//   "ws_message",
//   "ws_send",
//   "broadcast",
//   "state_change",
// ]);

// export const agentEventSchema = z.object({
//   event: agentEventTypeSchema,
//   payload: z.any().optional(),
// });

// export type AgentEvent = z.infer<typeof agentEventSchema>;

export const streamOpenEventSchema = z.object({
  type: z.literal("stream_open"),
  // payload is the stringified value of null
  payload: z.undefined(),
});

export const streamCloseEventSchema = z.object({
  type: z.literal("stream_close"),
  // payload is the stringified value of null
  payload: z.undefined(),
});

export const streamErrorEventSchema = z.object({
  type: z.literal("stream_error"),
  payload: z.string(),
});

const httpRequestPayloadSchema = z.object({
  method: z.string(),
  url: z.string(),
  headers: z.record(z.string()),
  body: z.string().optional(),
});

export const httpRequestEventSchema = z.object({
  type: z.literal("http_request"),
  payload: httpRequestPayloadSchema,
});

export const httpResponsePayloadSchema = httpRequestPayloadSchema.extend({
  status: z.number(),
  statusText: z.string(),
});

export const httpResponseEventSchema = z.object({
  type: z.literal("http_response"),
  payload: httpResponsePayloadSchema,
});

export const wsOpenEventSchema = z.object({
  type: z.literal("ws_open"),
  payload: z.object({
    connectionId: z.string(),
  }),
});

export const wsCloseEventSchema = z.object({
  type: z.literal("ws_close"),
  // payload is the stringified value of null
  payload: z.object({
    connectionId: z.string(),
    code: z.number(),
    reason: z.string(),
    wasClean: z.boolean(),
  }),
});

export const wsMessageEventSchema = z.object({
  type: z.literal("ws_message"),
  payload: z
    .object({
      connectionId: z.string(),
      message: z.union([
        z.string(),
        z.object({
          type: z.literal("binary"),
          size: z.number(),
        }),
      ]),
      // Added by the transformation
      incomingMessage: incomingMessageSchema.optional(),
      // Added by the transformation
      typedMessage: messageWithTypeSchema.optional(),
    })
    .transform((data) => {
      // If the message is a string, parse it as JSON
      const jsonResult = tryCatch(() =>
        typeof data.message === "string"
          ? JSON.parse(data.message)
          : data.message,
      );
      if (jsonResult.error) {
        console.error("Failed to parse ws_message message:", jsonResult.error);
        return data;
      }

      const incomingMessage = incomingMessageSchema.safeParse(jsonResult.data);
      if (incomingMessage.success) {
        data.incomingMessage = incomingMessage.data;
      }

      const typedMessage = messageWithTypeSchema.safeParse(jsonResult.data);
      if (typedMessage.success) {
        data.typedMessage = typedMessage.data;
      }

      return data;
    }),
});

export const wsSendEventSchema = z.object({
  type: z.literal("ws_send"),
  payload: z
    .object({
      connectionId: z.string(),
      message: z.union([
        z.string(),
        z.object({
          type: z.literal("binary"),
          size: z.number(),
        }),
      ]),
      // Added by the transformation
      outgoingMessage: outgoingMessageSchema.optional(),
      // Added by the transformation
      typedMessage: messageWithTypeSchema.optional(),
    })
    .transform((data) => {
      // If the message is a string, parse it as JSON
      const jsonResult = tryCatch(() =>
        typeof data.message === "string"
          ? JSON.parse(data.message)
          : data.message,
      );
      if (jsonResult.error) {
        console.error("Failed to parse ws_send message:", jsonResult.error);
        return data;
      }

      const outgoingMessage = outgoingMessageSchema.safeParse(jsonResult.data);
      if (outgoingMessage.success) {
        data.outgoingMessage = outgoingMessage.data;
      }

      const typedMessage = messageWithTypeSchema.safeParse(jsonResult.data);
      if (typedMessage.success) {
        data.typedMessage = typedMessage.data;
      }

      return data;
    }),
});

export const broadcastEventSchema = z.object({
  type: z.literal("broadcast"),
  payload: z
    .object({
      message: z.union([
        z.string(),
        z.object({
          type: z.literal("binary"),
          size: z.number(),
        }),
      ]),
      // Excluded connection ids
      without: z.array(z.string()).optional(),
      // Added by the transformation
      outgoingMessage: outgoingMessageSchema.optional(),
      // Added by the transformation
      typedMessage: messageWithTypeSchema.optional(),
    })
    .transform((data) => {
      // If the message is a string, parse it as JSON
      const jsonResult = tryCatch(() =>
        typeof data.message === "string"
          ? JSON.parse(data.message)
          : data.message,
      );
      if (jsonResult.error) {
        console.error("Failed to parse broadcast message:", jsonResult.error);
        return data;
      }

      const outgoingMessage = outgoingMessageSchema.safeParse(jsonResult.data);
      if (outgoingMessage.success) {
        data.outgoingMessage = outgoingMessage.data;
      }

      const typedMessage = messageWithTypeSchema.safeParse(jsonResult.data);
      if (typedMessage.success) {
        data.typedMessage = typedMessage.data;
      }

      return data;
    }),
});

export const stateChangeEventSchema = z.object({
  type: z.literal("state_change"),
  payload: z.object({
    state: z.unknown(),
    source: z.union([z.literal("server"), z.string()]),
  }),
});

export const agentEventSchema = z.discriminatedUnion("type", [
  streamOpenEventSchema,
  streamCloseEventSchema,
  streamErrorEventSchema,
  httpRequestEventSchema,
  httpResponseEventSchema,
  wsOpenEventSchema,
  wsCloseEventSchema,
  wsMessageEventSchema,
  wsSendEventSchema,
  broadcastEventSchema,
  stateChangeEventSchema,
]);
export type AgentEvent = z.infer<typeof agentEventSchema>;
export type AgentEventType = AgentEvent["type"];
export type DiscriminatedSubset<T, K extends keyof T> = T extends {
  type: infer TType;
}
  ? { type: TType } & Pick<T, Exclude<K, "type">>
  : never;

type UseChatResponseCombinedEventPayload = {
  type: z.infer<typeof agentUseChatResponseSchema>["type"];
  chunks: Array<z.infer<typeof agentUseChatResponseSchema>>;
  content: string;
  done: boolean;
  metadata: {
    messageId?: string;
    // biome-ignore lint/suspicious/noExplicitAny: the default type is any
    toolCalls: ToolCall<string, any>[];
    // biome-ignore lint/suspicious/noExplicitAny: the default type is any
    toolResults: Omit<ToolResult<string, any, any>, "toolName" | "args">[];
    status?: Record<string, unknown> | null;
  };
};

type CombinedEventPayload = UseChatResponseCombinedEventPayload;

export type CombinedEvent = {
  type: "combined_event";
  payload: CombinedEventPayload;
};

export type WithIdAndTimestamp = {
  id: string;
  timestamp: string;
};

export type UIAgentEvent = WithIdAndTimestamp & (AgentEvent | CombinedEvent);
