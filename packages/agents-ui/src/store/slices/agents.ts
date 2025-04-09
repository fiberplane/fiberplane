import type {
  UIAgentEvent,
} from "@/types";
import { combine } from "zustand/middleware";
import { EMPTY_COMBINED_EVENTS } from "./ui";
import { updateCombinedEvent } from "./utils";

export type InstanceDetails = {
  eventStreamStatus: SSEStatus;
  events: Array<UIAgentEvent>;
  combinedEvents: Array<UIAgentEvent>;
  knownBroadcastEvents: Record<
    string,
    UIAgentEvent & { type: "combined_event" }
  >;
};

export type AgentDetailsState = {
  instances: Record<string, InstanceDetails>;
};

export type AgentState = {
  agentsState: Record<string, AgentDetailsState>;
};

export type SSEStatus = "connecting" | "open" | "closed" | "error";

export type AgentActions = {
  addAgentInstanceEvent: (
    agent: string,
    instance: string,
    event: UIAgentEvent,
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

        // Make a copy of existing combinedEvents and knownBroadcastEvents
        let combinedEvents = [
          ...(instanceDetails.combinedEvents || EMPTY_COMBINED_EVENTS),
        ];
        const knownBroadcastEvents = {
          ...(instanceDetails.knownBroadcastEvents || {}),
        };

        // Handle broadcast event combining
        if (event.type === "broadcast") {
          const outgoingMessage = event.payload.outgoingMessage;

          if (outgoingMessage?.type === "cf_agent_use_chat_response") {
            const { id, done } = outgoingMessage;
            if (id in knownBroadcastEvents) {
              // Update existing combined event
              const existingEvent = knownBroadcastEvents[id];

              if (existingEvent.payload.type === outgoingMessage.type) {
                const newEvent = { ...existingEvent };
                updateCombinedEvent(newEvent, outgoingMessage);

                // Replace the existing event in the combined events array
                combinedEvents = combinedEvents.map((e) =>
                  e.type === "combined_event" && e.id === id ? newEvent : e,
                );

                // Update in known events
                knownBroadcastEvents[id] = newEvent;
              } else {
                console.warn(
                  `Event type mismatch for ID ${id}: ${existingEvent.payload.type}`,
                );
              }
            } else {
              // Create a new combined event
              const newCombinedEvent: UIAgentEvent = {
                type: "combined_event",
                id,
                payload: {
                  type: outgoingMessage.type,
                  chunks: [outgoingMessage],
                  content: "",
                  done,
                  metadata: {
                    messageId: "",
                    toolCalls: [],
                    toolResults: [],
                    status: null,
                  },
                },
                timestamp: event.timestamp,
              };

              updateCombinedEvent(newCombinedEvent, outgoingMessage);

              // Add to combined events array
              combinedEvents.push(newCombinedEvent);

              // Add to known events
              knownBroadcastEvents[id] = newCombinedEvent;
            }
          } else {
            // Still the original event to combined events for completeness
            combinedEvents.push(event);
          }
        } else {
          // Still add the original event to combined events for completeness
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
