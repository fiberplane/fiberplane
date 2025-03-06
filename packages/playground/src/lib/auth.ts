import { createClient } from "@openauthjs/openauth/client";
// import { createSubjects } from "@openauthjs/openauth/subject";

// const redirectUrl = "http://localhost:7676/fp";
const issuer = "https://auth.fp.dev";
const openAuthClientId = "fp-playground";

export type UserProfile = {
  id: string;
  email: string;
  role: "owner" | "admin" | "user";
};

export const isOwner = (user?: UserProfile) => user?.role === "owner";
export const isAdmin = (user?: UserProfile) => user?.role === "admin";
export const isUser = (user?: UserProfile) => user?.role === "user";

/**
 * NOTE - Not in use, use this to refactor src/routes/index.tsx
 */
export const openAuthClient = createClient({
  clientID: openAuthClientId,
  issuer,
});
