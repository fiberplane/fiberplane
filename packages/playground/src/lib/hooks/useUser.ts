import type { ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { UserProfile } from "../auth";

export const USER_PROFILE_KEY = "user-profile";

export const userProfileQueryOptions = () => ({
  queryKey: [USER_PROFILE_KEY],
  queryFn: () => api.getUserProfile(),
  select: (response: ApiResponse<UserProfile | null>) => response?.data ?? null,
});

export function useUserProfile() {
  return useQuery(userProfileQueryOptions());
}
