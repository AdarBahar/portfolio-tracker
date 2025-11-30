import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { UserProfile, UserStats } from '@/types/profileHeader';

export interface UserProfileResponse {
  profile: UserProfile;
  stats: UserStats;
}

/**
 * Hook to fetch authenticated user's profile and stats
 * Uses React Query for caching and automatic refetching
 */
export function useUserProfile() {
  return useQuery<UserProfileResponse>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await apiClient.get<UserProfileResponse>('/users/profile');
      return response.data;
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch only user profile data
 */
export function useUserProfileData() {
  const { data, isLoading, error } = useUserProfile();
  return {
    profile: data?.profile,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch only user stats
 */
export function useUserStats() {
  const { data, isLoading, error } = useUserProfile();
  return {
    stats: data?.stats,
    isLoading,
    error,
  };
}

