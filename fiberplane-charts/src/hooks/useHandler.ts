import { useCallback, useRef } from "react";

const noDeps: Array<void> = [];

export function useHandler<Handler extends Function>(
  handler: Handler,
): Handler {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  // @ts-ignore
  // rome-ignore lint/nursery/useHookAtTopLevel: https://github.com/rome/tools/issues/4483
  return useCallback((...args) => handlerRef.current(...args), noDeps);
}
