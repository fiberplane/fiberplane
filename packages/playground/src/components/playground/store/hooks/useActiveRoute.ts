import { memoize } from "proxy-memoize";
import { useShallow } from "zustand/react/shallow";
import { useStudioStoreRaw } from "..";
import { rawGetActiveRoute } from "../utils";

const getActiveRoute = memoize(rawGetActiveRoute);

export function useActiveRoute() {
  return useStudioStoreRaw(useShallow(getActiveRoute));
}
