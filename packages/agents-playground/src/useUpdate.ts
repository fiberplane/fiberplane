import { useCallback, useReducer } from "react";

/**
 * A hook that returns a function which forces a component to re-render
 * when called, without needing to update any state values.
 *
 * @returns A function that triggers a re-render when called
 */
export function useUpdate(): () => void {
  // Using a reducer with a simple increment pattern ensures
  // that React will always see a new reference and re-render
  const [, forceUpdate] = useReducer((count) => count + 1, 0);

  // Memoize the function to maintain a stable reference
  // between renders when dependencies haven't changed
  return useCallback(() => {
    forceUpdate();
  }, []);
}
