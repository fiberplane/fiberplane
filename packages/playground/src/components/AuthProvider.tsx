import { AuthContext } from "@/contexts/auth";
import { type PropsWithChildren, useState } from "react";

export function AuthProvider({ children }: PropsWithChildren) {
  const state = useState<{}>();
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
