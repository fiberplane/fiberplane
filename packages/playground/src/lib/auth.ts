export const redirectUrl = "http://localhost:7676/fp";

export type UserProfile = {
  id: string;
  email: string;
  role: "owner" | "admin" | "user";
};

export const isOwner = (user?: UserProfile) => user?.role === "owner";
export const isAdmin = (user?: UserProfile) => user?.role === "admin";
export const isUser = (user?: UserProfile) => user?.role === "user";
