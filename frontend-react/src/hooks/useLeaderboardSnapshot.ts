import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface LeaderboardEntry {
  userId: number;
  rank: number;
  portfolioValue: number;
  cash: number;
  pnlAbs: number;
  pnlPct: number;
  snapshotAt: string;
}

export interface LeaderboardSnapshot {
  bullPenId: number;
  snapshotCount: number;
  entries: LeaderboardEntry[];
}

/**
 * Fetch latest leaderboard snapshot for a room
 */
export function useLeaderboardSnapshot(bullPenId: number | undefined) {
  return useQuery({
    queryKey: ['leaderboardSnapshot', bullPenId],
    queryFn: async () => {
      if (!bullPenId) return null;
      const response = await apiClient.get(`/bull-pens/${bullPenId}/leaderboard/snapshot`);
      return response.data as LeaderboardSnapshot;
    },
    enabled: !!bullPenId,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

/**
 * Fetch leaderboard snapshot history
 */
export function useLeaderboardSnapshotHistory(bullPenId: number | undefined, limit = 10) {
  return useQuery({
    queryKey: ['leaderboardSnapshotHistory', bullPenId, limit],
    queryFn: async () => {
      if (!bullPenId) return [];
      const response = await apiClient.get(`/bull-pens/${bullPenId}/leaderboard/history`, {
        params: { limit },
      });
      return (response.data as any).snapshots || [];
    },
    enabled: !!bullPenId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Create a new leaderboard snapshot (admin/host only)
 */
export function useCreateLeaderboardSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bullPenId: number) => {
      const response = await apiClient.post(`/bull-pens/${bullPenId}/leaderboard/snapshot`);
      return response.data;
    },
    onSuccess: (data, bullPenId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['leaderboardSnapshot', bullPenId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboardSnapshotHistory', bullPenId] });
    },
  });
}

/**
 * Calculate payout distribution
 */
export function usePayoutCalculation(
  leaderboard: LeaderboardEntry[],
  totalPool: number,
  model: 'winner-take-all' | 'proportional' | 'tiered' = 'winner-take-all'
) {
  return {
    payouts: calculatePayouts(leaderboard, totalPool, model),
    summary: getPayoutSummary(calculatePayouts(leaderboard, totalPool, model)),
  };
}

/**
 * Calculate payouts based on leaderboard and model
 */
function calculatePayouts(
  leaderboard: LeaderboardEntry[],
  totalPool: number,
  model: string
): Array<{ userId: number; rank: number; payout: number }> {
  if (model === 'winner-take-all') {
    return leaderboard.map((entry, idx) => ({
      userId: entry.userId,
      rank: entry.rank,
      payout: idx === 0 ? totalPool : 0,
    }));
  }

  if (model === 'proportional') {
    const totalPositivePnL = leaderboard.reduce((sum, e) => sum + Math.max(0, e.pnlAbs), 0);
    return leaderboard.map(entry => ({
      userId: entry.userId,
      rank: entry.rank,
      payout: totalPositivePnL > 0 ? (Math.max(0, entry.pnlAbs) / totalPositivePnL) * totalPool : 0,
    }));
  }

  if (model === 'tiered') {
    const tierPercentages: { [key: number]: number } = { 1: 0.5, 2: 0.3, 3: 0.2 };
    const tierPool = totalPool * 0.9;
    const refundPool = totalPool * 0.1;
    const remainingPlayers = Math.max(1, leaderboard.length - 3);

    return leaderboard.map(entry => ({
      userId: entry.userId,
      rank: entry.rank,
      payout: entry.rank <= 3 && tierPercentages[entry.rank]
        ? tierPool * tierPercentages[entry.rank]
        : refundPool / remainingPlayers,
    }));
  }

  return [];
}

/**
 * Get payout summary statistics
 */
function getPayoutSummary(payouts: Array<{ payout: number }>) {
  const totalPayout = payouts.reduce((sum, p) => sum + p.payout, 0);
  const maxPayout = Math.max(...payouts.map(p => p.payout));
  const minPayout = Math.min(...payouts.map(p => p.payout));
  const avgPayout = totalPayout / payouts.length;

  return {
    totalPayout: Math.round(totalPayout * 100) / 100,
    maxPayout: Math.round(maxPayout * 100) / 100,
    minPayout: Math.round(minPayout * 100) / 100,
    avgPayout: Math.round(avgPayout * 100) / 100,
  };
}

