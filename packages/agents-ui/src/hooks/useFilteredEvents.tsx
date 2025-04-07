import {
  EMPTY_COMBINED_EVENTS,
  EMPTY_EVENTS,
  usePlaygroundStore,
} from "@/store";
import type { AgentInstanceParameters } from "@/types";

export function useFilteredEvents(parameters: AgentInstanceParameters) {
  const { namespace, instance } = parameters;
  return usePlaygroundStore((state) => {
    const instanceDetails = state.agentsState[namespace]?.instances[instance];

    if (state.combineEvents) {
      return instanceDetails?.combinedEvents ?? EMPTY_COMBINED_EVENTS;
    }

    return instanceDetails?.events ?? EMPTY_EVENTS;
  });
}
