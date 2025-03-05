import type { ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { type UserProfile, api } from "../api";

export const USER_PROFILE_KEY = "user-profile";

export const userProfileQueryOptions = () => ({
  queryKey: [USER_PROFILE_KEY],
  queryFn: () => api.getUserProfile(),
  // TODO - use TraceListResponseSchema to parse response
  select: (response: ApiResponse<UserProfile>) => response.data,
});

export function useUserProfile() {
  return useQuery(userProfileQueryOptions());
}
