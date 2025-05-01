import type { MCPClientManager } from "agents/mcp/client";
import { z } from "zod";

/**
 * Return type for the getDurableObjectsFromConfig function
 */
export type DurableObjectsSuccess = {
  success: true;
  durableObjects: {
    instances: {
      name: string;
    }[];
    bindings: {
      name: string;
      className: string;
      scriptName: string | null;
    }[];
    migrations: {
      tag?: string;
      newClasses: string[];
    }[];
  };
};

export type DurableObjectsError = {
  success: false;
  error: string;
};

export type DurableObjectsResult = DurableObjectsSuccess | DurableObjectsError;

// API Types
export type AgentDetails = {
  id: string;
  scriptName: string | null;
  className: string;
  instances: Array<string>;
};

export type ListAgentsResponse = Array<AgentDetails>;

export const baseEventDataSchema = z.object({
  stub: z.string().optional(),
  className: z.string(),
  instance: z.string(),
  id: z.string(),
  timestamp: z.number(),
});
export const streamOpenEventSchema = baseEventDataSchema.extend({
  type: z.literal("stream_open"),
  // payload is the stringified value of null
  payload: z.undefined(),
});

export const streamCloseEventSchema = baseEventDataSchema.extend({
  type: z.literal("stream_close"),
  // payload is the stringified value of null
  payload: z.undefined(),
});

export const streamErrorEventSchema = baseEventDataSchema.extend({
  type: z.literal("stream_error"),
  payload: z.string(),
});

const httpRequestPayloadSchema = z.object({
  method: z.string(),
  url: z.string(),
  headers: z.record(z.string()),
  body: z.string().optional(),
});

export const httpRequestEventSchema = baseEventDataSchema.extend({
  type: z.literal("request"),
  payload: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      return httpRequestPayloadSchema.parse(parsed);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON",
      });
      return z.NEVER;
    }
  }),
});

export const httpResponsePayloadSchema = httpRequestPayloadSchema.extend({
  status: z.number(),
  statusText: z.string(),
});

export const httpResponseEventSchema = baseEventDataSchema.extend({
  type: z.literal("http_response"),
  payload: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      return httpResponsePayloadSchema.parse(parsed);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON",
      });
      return z.NEVER;
    }
  }),
});

export const connectEventSchema = baseEventDataSchema.extend({
  type: z.literal("connect"),
  payload: z.object({
    connectionId: z.string(),
  }),
});

export const wsCloseEventSchema = baseEventDataSchema.extend({
  type: z.literal("ws_close"),
  // payload is the stringified value of null
  payload: z.object({
    connectionId: z.string(),
    code: z.number(),
    reason: z.string(),
    wasClean: z.boolean(),
  }),
});

export const wsMessageEventSchema = baseEventDataSchema.extend({
  type: z.literal("ws_message"),
  payload: z.object({
    connectionId: z.string(),
    message: z.union([
      z.string(),
      z.object({
        type: z.literal("binary"),
        size: z.number(),
      }),
    ]),
  }),
});

export const wsSendEventSchema = baseEventDataSchema.extend({
  type: z.literal("ws_send"),
  payload: z.object({
    connectionId: z.string(),
    message: z.union([
      z.string(),
      z.object({
        type: z.literal("binary"),
        size: z.number(),
      }),
    ]),
  }),
});

export const broadcastEventSchema = baseEventDataSchema.extend({
  type: z.literal("broadcast"),
  payload: z.object({
    message: z.union([
      z.string(),
      z.object({
        type: z.literal("binary"),
        size: z.number(),
      }),
    ]),
    // Excluded connection ids
    without: z.array(z.string()).optional(),
  }),
});

export const stateChangeEventSchema = baseEventDataSchema.extend({
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
  connectEventSchema,
  wsCloseEventSchema,
  wsMessageEventSchema,
  wsSendEventSchema,
  broadcastEventSchema,
  stateChangeEventSchema,
]);
export type AgentEvent = z.infer<typeof agentEventSchema>;

export const aiGatewayEnvSchema = z.object({
  CLOUDFLARE_API_TOKEN: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
});

// Define types for database schema
export type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";
export type TableSchema = {
  columns: Record<string, ColumnType[]>;
  data: Record<string, unknown>[];
  error?: string;
};

export type DatabaseResult = Record<string, TableSchema>;

export type MCPClientConnection = MCPClientManager["mcpConnections"][string];
