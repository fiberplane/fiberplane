import { getFpApiBasePath } from "@/lib/api/fetch";

export function useMountedPath() {
  return getFpApiBasePath();
}
