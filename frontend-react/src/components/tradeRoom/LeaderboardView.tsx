import { Loader, Trophy } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { formatCurrency } from '@/utils/formatting';

interface LeaderboardViewProps {
  bullPenId: number;
}

export default function LeaderboardView({ bullPenId }: LeaderboardViewProps) {
  const { data: leaderboardData, isLoading } = useLeaderboard(bullPenId);

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
                            entry.rank === 1 ? 'text-yellow-500' :
                            entry.rank === 2 ? 'text-gray-400' :
                            'text-orange-600'
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

