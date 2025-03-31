import { EMPTY_EVENTS, usePlaygroundStore } from "@/store";
import { useMemo } from "react";

export function useFilteredEvents(params: {
  namespace: string;
  instance: string;
}) {
  const { namespace, instance } = params;
  const events = usePlaygroundStore((state) => {
    return (
      state.agentsState[namespace]?.instances[instance]?.events ?? EMPTY_EVENTS
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
