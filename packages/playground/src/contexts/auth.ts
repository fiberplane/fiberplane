import { createContext, useContext } from "react";
import type { UserProfile } from "../lib/auth";

export const AuthContext = createContext<UserProfile | null>(null);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
