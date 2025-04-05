import { useMatches } from "@tanstack/react-router";

/**
 * Hook that reads the root route context,
 * which contains the embedded api's config options,
 * in order to determine if traces should be authenticated.
 *
 * This supports the local setup for traces without needing to log in.
 */
export function useShouldAuthTraces() {
  const matches = useMatches();
  const rootContext = matches[0]?.context;
  const { authTraces } = rootContext;

  return authTraces;
}
