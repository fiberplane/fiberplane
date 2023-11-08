import { useCallback, useRef } from "react";

const noDeps: Array<void> = [];

// biome-ignore lint/complexity/noBannedTypes: must match arbitrary functions
export function useHandler<Handler extends Function>(
  handler: Handler,
): Handler {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  // @ts-ignore
  return useCallback((...args) => handlerRef.current(...args), noDeps);
}
