import { useCallback, useRef } from "react";

const noDeps: Array<void> = [];

export function useHandler<Handler extends (...args: Array<any>) => any>(
  handler: Handler,
): Handler {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  // @ts-ignore
  return useCallback((...args) => handlerRef.current(...args), noDeps);
}
