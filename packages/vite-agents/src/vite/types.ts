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
  instances: Array<string>;
};

export type ListAgentsResponse = Array<AgentDetails>;

// Event types
export const AgentEventTypeSchema = z.enum([
  "stream_open",
  "http_request",
  "ws_open",
  "ws_close",
  "ws_message",
  "state_change",
]);

export const AgentEventSchema = z.object({
  event: AgentEventTypeSchema,
  payload: z.any().optional(),
});

export type AgentEvent = z.infer<typeof AgentEventSchema>;
