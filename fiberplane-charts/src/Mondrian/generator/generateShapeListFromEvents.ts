import type { Axis, SeriesSource, ShapeList } from "../types";
import type { ProviderEvent } from "../../providerTypes";
import { getTimeFromTimestamp } from "./utils";

export function generateShapeListFromEvents(
  { minValue, maxValue }: Axis,
  events: Array<ProviderEvent>,
): ShapeList<SeriesSource, ProviderEvent> {
  return {
    shapes: events.map((event) => {
      const x =
        (getTimeFromTimestamp(event.time) - minValue) / (maxValue - minValue);
      return {
        type: "area",
        points: [{ x, yMin: 0, yMax: 1, source: event }],
      };
    }),
    source: { type: "events" },
  };
}