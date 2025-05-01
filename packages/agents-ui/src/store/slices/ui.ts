import type { UIAgentEvent } from "@/types";
import { combine } from "zustand/middleware";

const streamEvents: Array<UIAgentEvent["type"]> = [
  "stream_open",
  "stream_close",
  "stream_error",
];
const httpEvents: Array<UIAgentEvent["type"]> = ["request", "http_response"];

const webSocketEvents: Array<UIAgentEvent["type"]> = [
  // "ws_open",
  // "ws_close",
  "ws_message",
  "ws_send",
];

const webSocketConnectionEvents: Array<UIAgentEvent["type"]> = [
  "connect",
  "ws_close",
];

const broadcastEvents: Array<UIAgentEvent["type"]> = [
  "broadcast",
  "combined_event",
];

const stateChangeEvents: Array<UIAgentEvent["type"]> = ["state_change"];
export const eventCategories = {
  Streaming: streamEvents,
  HTTP: httpEvents,
  "Web Socket Messages": webSocketEvents,
  "Web Socket Connection": webSocketConnectionEvents,
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
  "Web Socket Messages",
  // "Web Socket Connection",
  "Broadcasts",
  "State events",
];

export const EMPTY_EVENTS: Array<UIAgentEvent> = [];
export const EMPTY_COMBINED_EVENTS: Array<UIAgentEvent> = [];

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
