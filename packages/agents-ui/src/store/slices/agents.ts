import { combine } from "zustand/middleware";
import { EMPTY_COMBINED_EVENTS } from "./ui";
import { MessagePayloadSchema } from "@/types";

// Agent slice
export type InstanceDetails = {
  eventStreamStatus: SSEStatus;
  events: Array<CoreAgentEvent>;
  combinedEvents: Array<CoreAgentEvent | CombinedEvent>;
  knownBroadcastEvents: Record<string, CombinedEvent>;
};

export type AgentDetailsState = {
  instances: Record<string, InstanceDetails>;
};

export type AgentState = {
  agentsState: Record<string, AgentDetailsState>;
};

import type { CoreAgentEvent } from "@/hooks";
import { z } from "zod";

export type SSEStatus = "connecting" | "open" | "closed" | "error";

export const ChatMessageSchema = z.object({
  id: z.string(),
  type: z.literal("cf_agent_use_chat_response"),
  body: z.string(),
  done: z.boolean(),
});

export type CombinedEvent = {
  type: "combined_event";
  id: string;
  payload: {
    chunks: Array<
      CoreAgentEvent & {
        type: "broadcast";
        payload: { message: z.infer<typeof ChatMessageSchema> };
      }
    >;
    content: string; // Combined content from all chunks
    done: boolean;
  };
  timestamp: string;
};

export type AgentEvent = CoreAgentEvent | CombinedEvent;

export type AgentActions = {
  addAgentInstanceEvent: (
    agent: string,
    instance: string,
    event: CoreAgentEvent,
  ) => void;
  resetAgentInstanceEvents: (agent: string, instance: string) => void;
  setAgentInstanceStreamStatus: (
    agent: string,
    instance: string,
    status: SSEStatus,
  ) => void;
};

// Create agent slice with proper typing and fix the event update
export const agentSlice = combine<AgentState, AgentActions>(
  {
    agentsState: {},
  },
  (set) => ({
    addAgentInstanceEvent: (agent, instance, event) => {
      set((state) => {
        // Get or initialize agent details
        const agentDetails = state.agentsState[agent] ?? {
          instances: {},
        };

        // Get or initialize instance details
        const instanceDetails = agentDetails.instances[instance] ?? {
          events: [],
          combinedEvents: [],
          knownBroadcastEvents: {},
          eventStreamStatus: "closed" as const,
        };

        // Always add the raw event to events array
        const events = [...instanceDetails.events, event];

        // console.log("Adding event", event);
        if (event.type === "broadcast") {
          console.log("Broadcast event", event);
        }

        // Make a copy of existing combinedEvents and knownBroadcastEvents
        let combinedEvents = [
          ...(instanceDetails.combinedEvents || EMPTY_COMBINED_EVENTS),
        ];
        const knownBroadcastEvents = {
          ...(instanceDetails.knownBroadcastEvents || {}),
        };

        // Handle broadcast event combining
        if (event.type === "broadcast") {
          try {
            const { message: parsedMessage } = MessagePayloadSchema.parse(
              event.payload,
            );
            const parsed = ChatMessageSchema.safeParse(parsedMessage);

            if (parsed.success) {
              const { id, body, done } = parsed.data;
              const typedEvent = event as CoreAgentEvent & {
                type: "broadcast";
              };

              // Check if we already have a combined event with this ID
              if (id in knownBroadcastEvents) {
                // Update existing combined event
                const existingEvent = knownBroadcastEvents[id];

                // Add this chunk to the existing event
                existingEvent.payload.chunks.push({
                  ...typedEvent,
                  payload: {
                    message: parsed.data,
                  },
                });

                existingEvent.payload.content += body;

                // // Update the combined content
                // existingEvent.content = existingEvent.chunks
                //   .map(chunk => {
                //     try {
                //       const parsedChunk = JSON.parse(chunk.payload.message);
                //       return parsedChunk.body || "";
                //     } catch {
                //       return "";
                //     }
                //   })
                //   .join("");

                // Update done status
                existingEvent.payload.done = done;

                // Replace the existing event in the combined events array
                combinedEvents = combinedEvents.map((e) =>
                  e.type === "combined_event" && e.id === id
                    ? existingEvent
                    : e,
                );

                // Update in known events
                knownBroadcastEvents[id] = existingEvent;
              } else {
                // Create a new combined event
                const newCombinedEvent: CombinedEvent = {
                  type: "combined_event",
                  id,
                  payload: {
                    chunks: [
                      {
                        ...typedEvent,
                        payload: {
                          message: parsed.data,
                        },
                      },
                    ],
                    content: body,
                    done,
                  },
                  timestamp: event.timestamp,
                };

                // Add to combined events array
                combinedEvents.push(newCombinedEvent);

                // Add to known events
                knownBroadcastEvents[id] = newCombinedEvent;
              }
            } else {
              combinedEvents.push(event);
            }
          } catch (error) {
            console.warn("Failed to handle broadcast message", error);
            // Still add the original event to combined events for completeness
            combinedEvents.push(event);
          }
        } else {
          // For non-broadcast events, just add them to the combined events
          combinedEvents.push(event);
        }

        return {
          agentsState: {
            ...state.agentsState,
            [agent]: {
              ...agentDetails,
              instances: {
                ...agentDetails.instances,
                [instance]: {
                  ...instanceDetails,
                  events,
                  combinedEvents,
                  knownBroadcastEvents,
                },
              },
            },
          },
        };
      });
    },
    resetAgentInstanceEvents: (agent, instance) => {
      set((state) => {
        const agentDetails = state.agentsState[agent] || {
          instances: {},
        };

        const instanceDetails = agentDetails.instances[instance] || {
          events: [],
          combinedEvents: [],
          knownBroadcastEvents: {},
          eventStreamStatus: "closed" as const,
        };

        return {
          agentsState: {
            ...state.agentsState,
            [agent]: {
              ...agentDetails,
              instances: {
                ...agentDetails.instances,
                [instance]: {
                  ...instanceDetails,
                  events: [], // Reset events array
                  combinedEvents: [], // Reset combined events
                  knownBroadcastEvents: {}, // Reset known broadcast events
                },
              },
            },
          },
        };
      });
    },
    setAgentInstanceStreamStatus: (agent, instance, status) => {
      set((state) => {
        const agentDetails = state.agentsState[agent] || {
          instances: {},
        };

        const instanceDetails = agentDetails.instances[instance] || {
          events: [],
          combinedEvents: [],
          knownBroadcastEvents: {},
          eventStreamStatus: "closed" as const,
        };

        return {
          agentsState: {
            ...state.agentsState,
            [agent]: {
              ...agentDetails,
              instances: {
                ...agentDetails.instances,
                [instance]: {
                  ...instanceDetails,
                  eventStreamStatus: status,
                },
              },
            },
          },
        };
      });
    },
  }),
);
