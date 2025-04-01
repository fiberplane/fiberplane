import type { CoreAgentEvent } from "@/hooks";
import type { AgentEvent, CombinedEvent } from "./agents";
import { combine } from "zustand/middleware";

const streamEvents: Array<AgentEvent["type"]> = [
  "stream_open",
  "stream_close",
  "stream_error",
];
const httpEvents: Array<AgentEvent["type"]> = ["http_request"];
const webSocketEvents: Array<AgentEvent["type"]> = [
  "ws_open",
  "ws_close",
  "ws_message",
  "ws_send",
];
const broadcastEvents: Array<AgentEvent["type"]> = [
  "broadcast",
  "combined_event",
];
const stateChangeEvents: Array<AgentEvent["type"]> = ["state_change"];
export const eventCategories = {
  Streaming: streamEvents,
  HTTP: httpEvents,
  "Web Sockets": webSocketEvents,
  Broadcasts: broadcastEvents,
  "State events": stateChangeEvents,
};

type EventCategory = keyof typeof eventCategories;

export const AllEventCategories = Object.keys(
  eventCategories,
) as Array<EventCategory>;

const DEFAULT_EVENT_CATEGORIES: Array<EventCategory> = [
  "Streaming",
  "HTTP",
  "Web Sockets",
  "Broadcasts",
  "State events",
];

export const EMPTY_EVENTS: Array<CoreAgentEvent> = [];
export const EMPTY_COMBINED_EVENTS: Array<CoreAgentEvent | CombinedEvent> = [];

// UI State
export type UIState = {
  combineEvents: boolean;
  visibleEventCategories: Array<EventCategory>;
};

export type UIActions = {
  toggleCombineEvents: () => void;
  toggleEventCategory: (category: EventCategory) => void;
  resetEventCategories: () => void;
  unselectAllEventCategories: () => void;
};

// UI slice
export const uiSlice = combine<UIState, UIActions>(
  {
    combineEvents: true,
    visibleEventCategories: DEFAULT_EVENT_CATEGORIES,
  },
  (set) => ({
    toggleCombineEvents: () =>
      set((state) => ({ combineEvents: !state.combineEvents })),
    resetEventCategories: () =>
      set((state) => ({
        ...state,
        visibleEventCategories: DEFAULT_EVENT_CATEGORIES,
      })),
    unselectAllEventCategories: () => {
      set((state) => ({
        ...state,
        visibleEventCategories: [],
      }));
    },
    toggleEventCategory: (category: EventCategory) =>
      set((state) => {
        const isVisible = state.visibleEventCategories.includes(category);
        const newVisibleEventCategories = isVisible
          ? state.visibleEventCategories.filter((c) => c !== category)
          : [...state.visibleEventCategories, category];

        return {
          ...state,
          visibleEventCategories: newVisibleEventCategories,
        };
      }),
  }),
);
