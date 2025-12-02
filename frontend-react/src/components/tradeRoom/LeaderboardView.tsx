import { useState, useEffect } from 'react';
import { Loader, Trophy, RefreshCw, History } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useLeaderboardSnapshot, useCreateLeaderboardSnapshot } from '@/hooks/useLeaderboardSnapshot';
import { formatCurrency } from '@/utils/formatting';
import { websocketService } from '@/services/websocketService';

interface LeaderboardViewProps {
  bullPenId: number;
  isHost?: boolean;
}

export default function LeaderboardView({ bullPenId, isHost = false }: LeaderboardViewProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: leaderboardData, isLoading, refetch } = useLeaderboard(bullPenId);
  const { data: snapshotData } = useLeaderboardSnapshot(bullPenId);
  const { mutate: createSnapshot, isPending: isCreatingSnapshot } = useCreateLeaderboardSnapshot();

  // Subscribe to real-time leaderboard updates
  useEffect(() => {
    if (!websocketService.isConnected()) return;

    const unsubscribe = websocketService.on('leaderboard_update', (data) => {
      if (data.bullPenId === bullPenId && autoRefresh) {
        refetch();
      }
    });

    return unsubscribe;
  }, [bullPenId, autoRefresh, refetch]);

  const handleCreateSnapshot = () => {
    createSnapshot(bullPenId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">No leaderboard data available</p>
      </div>
    );
  }

  const { leaderboard } = leaderboardData;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          {isHost && (
            <button
              onClick={handleCreateSnapshot}
              disabled={isCreatingSnapshot}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 hover:bg-success/20 text-success transition-colors disabled:opacity-50"
            >
              <History className="w-4 h-4" />
              {isCreatingSnapshot ? 'Creating...' : 'Create Snapshot'}
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-muted-foreground">Auto-refresh</span>
        </label>
      </div>

      {/* Snapshot Info */}
      {snapshotData && (
        <div className="text-xs text-muted-foreground text-center">
          Last snapshot: {new Date(snapshotData.entries[0]?.snapshotAt).toLocaleTimeString()}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Player
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Portfolio Value
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Cash
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Gain/Loss
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  %
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Stars
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => {
                const gainLossClass = entry.pnlAbs >= 0 ? 'text-success' : 'text-destructive';

                return (
                  <tr key={entry.userId} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-6 py-3 text-white font-bold">
                      <div className="flex items-center gap-2">
                        {entry.rank <= 3 && (
                          <Trophy className={`w-4 h-4 ${
                            entry.rank === 1 ? 'text-warning' :
                            entry.rank === 2 ? 'text-muted-foreground' :
                            'text-warning'
                          }`} />
                        )}
                        {entry.rank}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-white">
                      <div className="font-medium">{entry.userName}</div>
                      <div className="text-xs text-muted-foreground">{entry.userEmail}</div>
                    </td>
                    <td className="px-6 py-3 text-right text-white font-medium">
                      {formatCurrency(entry.portfolioValue)}
                    </td>
                    <td className="px-6 py-3 text-right text-muted-foreground">
                      {formatCurrency(entry.cash)}
                    </td>
                    <td className={`px-6 py-3 text-right font-medium ${gainLossClass}`}>
                      {formatCurrency(entry.pnlAbs)}
                    </td>
                    <td className={`px-6 py-3 text-right font-medium ${gainLossClass}`}>
                      {entry.pnlPct.toFixed(2)}%
                    </td>
                    <td className="px-6 py-3 text-right text-white font-medium">
                      {entry.stars}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

