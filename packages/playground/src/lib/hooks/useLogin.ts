import { useHandler } from "@fiberplane/hooks";
import { getFpApiBasePath } from "../api/fetch";

export function useLoginHandler() {
  const login = useHandler(async () => {
    const base = getFpApiBasePath();
    document.location = `${base}/api/auth/authorize`;
  });

  return login;
}
