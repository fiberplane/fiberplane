import { EMPTY_EVENTS, usePlaygroundStore } from "@/store";
import { unset } from "@/types";
import { useMemo } from "react";

export function useFilteredEvents() {
  const events = usePlaygroundStore((state) => {
    // state.events
    if (state.agent === unset || state.instance === unset) {
      return EMPTY_EVENTS;
    }

    return (
      state.agentsState[state.agent]?.instances[state.instance]?.events ??
      EMPTY_EVENTS
    );
  });

  const showAdminEvents = usePlaygroundStore((state) => state.showAdminEvents);

  return useMemo(() => {
    if (showAdminEvents) {
      return events;
    }

    return events.filter((event) => {
      return event.type !== "http_request";
    });
  }, [events, showAdminEvents]);
}
