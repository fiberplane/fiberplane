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

// Event types
export const AgentEventTypeSchema = z.enum([
  "stream_open",
  "stream_error",
  "stream_close",
  "http_request",
  "ws_open",
  "ws_close",
  "ws_message",
  "ws_send",
  "broadcast",
  "state_change",
]);

export const AgentEventSchema = z.object({
  event: AgentEventTypeSchema,
  payload: z.any().optional(),
});

export type AgentEvent = z.infer<typeof AgentEventSchema>;
