import type { ChartCoordinates, Dimensions } from "./types";
import { MARGINS } from "./constants";

export function getCoordinatesForEvent(
  event: React.MouseEvent<SVGElement> | WheelEvent,
  { xMax, yMax }: Dimensions,
): ChartCoordinates | null {
  const svg = event.currentTarget;
  const rect = (svg as SVGElement).getBoundingClientRect();

  const x = event.clientX - rect.left - MARGINS.left;
  const y = event.clientY - rect.top - MARGINS.top;
  if (x < 0 || x > xMax || y < 0 || y > yMax) {
    return null;
  }

  return { x: x / xMax, y: 1 - y / yMax };
}
