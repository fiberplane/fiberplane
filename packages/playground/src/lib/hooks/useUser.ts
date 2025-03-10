import type { ApiResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

export const USER_LOGOUT_KEY = "user-logout";

export const userLogoutQueryOptions = () => ({
  queryKey: [USER_LOGOUT_KEY],
  mutationFn: () => api.logout(),
});

export function useLogout() {
  const queryClient = useQueryClient();
  const { mutate: logout, isSuccess } = useMutation(userLogoutQueryOptions());

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
    }
  }, [isSuccess, queryClient]);

  return { logout };
}
