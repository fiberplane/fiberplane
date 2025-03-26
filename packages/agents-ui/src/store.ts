import { create } from "zustand";
import { combine } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import type { AgentEvent } from "./hooks/useSSE";
import { unset } from "./types";

// Route slice
type RouteState = {
  agent: typeof unset | string;
  instance: typeof unset | string;
};

type RouteActions = {
  selectAgent: (agent: string) => void;
  selectAgentInstance: (agent: string, instance: string) => void;
  reset: () => void;
};

export type SSEStatus = "connecting" | "open" | "closed" | "error";

// Agent slice
type InstanceDetails = {
  eventStreamStatus: SSEStatus;
  events: Array<AgentEvent>;
};

type AgentDetailsState = {
  instances: Record<string, InstanceDetails>;
};

type AgentState = {
  agentsState: Record<string, AgentDetailsState>;
};

type AgentActions = {
  addAgentInstanceEvent: (
    agent: string,
    instance: string,
    event: AgentEvent,
  ) => void;
  resetAgentInstanceEvents: (agent: string, instance: string) => void;
  setAgentInstanceStreamStatus: (
    agent: string,
    instance: string,
    status: SSEStatus,
  ) => void;
};

// Combined store type
type StoreState = RouteState &
  RouteActions &
  AgentState &
  AgentActions &
  UIState &
  UIActions;

// Create route slice with proper typing
const routeSlice = combine<RouteState, RouteActions>(
  {
    agent: unset,
    instance: unset,
  },
  (set) => ({
    selectAgent: (agent: string) => set({ agent, instance: unset }),
    selectAgentInstance: (agent: string, instance: string) =>
      set({ agent, instance }),
    reset: () => set({ agent: unset, instance: unset }),
  }),
);

// UI State
type UIState = {
  showAdminEvents: boolean;
};

type UIActions = {
  toggleAdminEvents: () => void;
};

// UI slice
const uiSlice = combine<UIState, UIActions>(
  {
    showAdminEvents: false,
  },
  (set) => ({
    toggleAdminEvents: () =>
      set((state) => ({ showAdminEvents: !state.showAdminEvents })),
  }),
);

export const EMPTY_EVENTS: Array<AgentEvent> = [];

// Create agent slice with proper typing and fix the event update
const agentSlice = combine<AgentState, AgentActions>(
  {
    agentsState: {},
  },
  (set) => ({
    addAgentInstanceEvent: (agent, instance, event) => {
      set((state) => {
        const agentDetails = state.agentsState[agent] ?? {
          instances: {},
        };

        const instanceDetails = agentDetails.instances[instance] ?? {
          events: [],
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
                  events: [...instanceDetails.events, event], // Fixed: properly append to events array
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

// Create the store with properly typed devtools
export const usePlaygroundStore = create<StoreState>()(
  devtools(
    (...args) => ({
      ...uiSlice(...args),
      ...routeSlice(...args),
      ...agentSlice(...args),
    }),
    {
      name: "PlaygroundStore",
    },
  ),
);
