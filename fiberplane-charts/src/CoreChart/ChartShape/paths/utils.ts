import type { CoordinateFactory } from "./types";

export function toFactory<P>(
  coordinate: number | CoordinateFactory<P>,
): CoordinateFactory<P> {
  return typeof coordinate === "function"
    ? coordinate
    : constantFactory(coordinate);
}

function constantFactory(value: number): () => number {
  return () => value;
}
