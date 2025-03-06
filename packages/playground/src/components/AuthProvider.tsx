import { AuthContext } from "@/contexts/auth";
import type { UserProfile } from "@/lib/auth";
import type { PropsWithChildren } from "react";

export function AuthProvider({ children, user }: PropsWithChildren<{ user: UserProfile | null }>) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
