import type { Axis, SeriesSource, ShapeList } from "../types";
import { normalizeAlongLinearAxis } from "./utils";

export function generateShapeListFromTargetLatency(
  yAxis: Axis,
  value: number,
): ShapeList<SeriesSource, null> {
  return {
    shapes: [
      {
        type: "line",
        strokeDasharray: [2],
        areaGradientShown: false,
        points: [
          { x: 0, y: normalizeAlongLinearAxis(value, yAxis), source: null },
          { x: 1, y: normalizeAlongLinearAxis(value, yAxis), source: null },
        ],
      },
    ],
    source: { type: "target_latency" },
  };
}
