import { useMatches } from "@tanstack/react-router";

/**
 * Hook that reads the root route context,
 * which contains the embedded api's config options,
 * in order to determine if the Fiberplane services are enabled.
 *
 * This is a way for the frontend to know if a fiberplane api key has been set on the embedded api.
 */
export function useHasFiberplaneServices() {
  const matches = useMatches();
  const rootContext = matches[0]?.context;
  const { hasFiberplaneServicesIntegration } = rootContext;

  return hasFiberplaneServicesIntegration;
}
