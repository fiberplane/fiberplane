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

export const httpResponseEventSchema = z.object({
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

export const wsSendEventSchema = z.object({
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

export const broadcastEventSchema = z.object({
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
