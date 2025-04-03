import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  type AgentActions,
  type AgentState,
  type UIActions,
  type UIState,
  agentSlice,
  uiSlice,
} from "./slices";

export {
  AllEventCategories,
  EMPTY_COMBINED_EVENTS,
  EMPTY_EVENTS,
  eventCategories,
} from "./slices";
export type {
  AgentEvent,
  SSEStatus,
  CombinedEvent,
} from "./slices";

// Combined store type
export type StoreState = AgentState & AgentActions & UIState & UIActions;

// Create the store with properly typed devtools
export const usePlaygroundStore = create<StoreState>()(
  devtools(
    (...args) => ({
      ...uiSlice(...args),
      ...agentSlice(...args),
    }),
    {
      name: "PlaygroundStore",
    },
  ),
);
