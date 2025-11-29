import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface LeaderboardEntry {
  userId: number;
  userName: string;
  userEmail: string;
  rank: number;
  portfolioValue: number;
  cash: number;
  positionsValue: number;
  pnlAbs: number;
  pnlPct: number;
  stars: number;
  score: number;
  lastTradeAt?: string;
}

export interface LeaderboardData {
  bullPenId: number;
  bullPenName: string;
  startingCash: number;
  leaderboard: LeaderboardEntry[];
}

/**
 * Fetch leaderboard for a bull pen
 */
export function useLeaderboard(bullPenId: number | undefined) {
  return useQuery({
    queryKey: ['leaderboard', bullPenId],
    queryFn: async () => {
      if (!bullPenId) return null;
      const response = await apiClient.get(`/bull-pens/${bullPenId}/leaderboard`);
      return response.data as LeaderboardData;
    },
    enabled: !!bullPenId,
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

