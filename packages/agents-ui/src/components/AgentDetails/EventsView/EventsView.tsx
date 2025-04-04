import { useFilteredEvents } from "@/hooks";
import { type AgentEvent, eventCategories, usePlaygroundStore } from "@/store";
import type { AgentInstanceParameters } from "@/types";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Checkbox } from "../../ui/Checkbox";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { EventItem } from "./EventItem";
import { EventCategoriesFilter } from "./EventsCategoriesFilter";
import { StreamConnectionStatus } from "./StreamConnectionStatus";

export function EventsView(props: AgentInstanceParameters) {
  const resetAgentInstanceEvents = usePlaygroundStore(
    (state) => state.resetAgentInstanceEvents,
  );

  const clearEvents = () =>
    resetAgentInstanceEvents(props.namespace, props.instance);

  const events = useFilteredEvents(props);
  const combineEvents = usePlaygroundStore((state) => state.combineEvents);
  const toggleCombineEvents = usePlaygroundStore(
    (state) => state.toggleCombineEvents,
  );

  const selectedCategories = usePlaygroundStore(
    (state) => state.visibleEventCategories,
  );

  const visibleEventTypes = useMemo(() => {
    const visibleTypes: Array<AgentEvent["type"]> = [];
    for (const category of selectedCategories) {
      const types = eventCategories[category];
      if (types) {
        visibleTypes.push(...types);
      }
    }
    return visibleTypes;
  }, [selectedCategories]);

  const sortedEvents = useMemo(() => {
    return [...events]
      .filter((event) => visibleEventTypes.includes(event.type))
      .sort((a, b) => {
        // Handle case where timestamps might be invalid
        try {
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        } catch (e) {
          return 0;
        }
      });
  }, [events, visibleEventTypes]);

  return (
    <div>
      <div className="grid items-center grid-cols-[1fr_auto] gap-2 border-b border-border px-5 py-2.5">
        <StreamConnectionStatus
          instance={props.instance}
          namespace={props.namespace}
        />
        <div className="flex items-center gap-2">
          <EventCategoriesFilter
            namespace={props.namespace}
            instance={props.instance}
          />
          <div>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox is the related input element */}
            <label className="text-muted-foreground text-sm flex items-center gap-1 cursor-pointer hover:text-foreground">
              <Checkbox
                checked={combineEvents}
                onCheckedChange={toggleCombineEvents}
              />
              Merge events
            </label>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <Button
            size="icon-xs"
            variant="outline"
            onClick={clearEvents}
            className="w-auto h-auto p-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-2">
        {sortedEvents.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            {events.length === 0
              ? "No events captured yet."
              : "Filtered selection has no events."}
          </div>
        ) : (
          <div className="space-y-1">
            {sortedEvents.map((event, idx) => (
              <EventItem key={`${event.id}`} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
