import type { ChartCoordinates, Dimensions } from "./types";
import { MARGINS } from "./constants";

export function getCoordinatesForEvent(
  event: React.MouseEvent<SVGElement> | WheelEvent,
  { xMax, yMax }: Dimensions,
): ChartCoordinates | null {
  const svgElement = event.currentTarget;
  const hasBoundingClientRect =
    svgElement && "getBoundingClientRect" in svgElement;

  if (!hasBoundingClientRect) {
    console.log(
      "getCoordinatesForEvent has an event target without .getBoundingClientRect",
      { event }
    );
    return null;
  }
  const rect = (svgElement as SVGElement).getBoundingClientRect();

  const x = event.clientX - rect.left - MARGINS.left;
  const y = event.clientY - rect.top - MARGINS.top;
  if (x < 0 || x > xMax || y < 0 || y > yMax) {
    return null;
  }

  return { x: x / xMax, y: 1 - y / yMax };
}
