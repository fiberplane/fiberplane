import { useRouteContext } from "@tanstack/react-router";
import type { RouterOptions } from "../types";

/**
 * Hook to access the router context containing server options
 */
export function useRouterContext(): RouterOptions {
  return useRouteContext({ from: "__root__" });
} 
