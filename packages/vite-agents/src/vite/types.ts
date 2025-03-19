import { z } from "zod";

/**
 * Return type for the getDurableObjectsFromConfig function
 */
export type DurableObjectsSuccess = {
  success: true;
  durableObjects: {
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
  instances: Array<string>;
};

export type ListAgentsResponse = Array<AgentDetails>;

// WebSocket Types
export const SubscribeSchema = z.object({
  type: z.literal("subscribe"),
  payload: z.object({
    agent: z.string(),
  }),
});

export const UnsubscribeSchema = z.object({
  type: z.literal("unsubscribe"),
  payload: z.object({
    agent: z.string(),
  }),
});

export const UpdateSchema = z.object({
  type: z.literal("update"),
  payload: z.object({
    agent: z.string(),
  }),
});

export const WebSocketMessageSchema = z.discriminatedUnion("type", [
  SubscribeSchema,
  UnsubscribeSchema,
  UpdateSchema,
]);

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
