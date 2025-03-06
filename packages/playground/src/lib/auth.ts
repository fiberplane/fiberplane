export type UserProfile = {
  id: string;
  email: string;
  role: "owner" | "admin" | "user";
};

export const isOwner = (user: UserProfile | null) => user?.role === "owner";
export const isAdmin = (user: UserProfile | null) => user?.role === "admin";
export const isUser = (user: UserProfile | null) => user?.role === "user";
