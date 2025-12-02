import { useState } from 'react';
import { Loader, TrendingUp, TrendingDown } from 'lucide-react';
import { useLeaderboardSnapshotHistory } from '@/hooks/useLeaderboardSnapshot';

interface SnapshotHistoryProps {
  bullPenId: number;
  limit?: number;
}

export default function SnapshotHistory({ bullPenId, limit = 10 }: SnapshotHistoryProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const { data: snapshots = [], isLoading } = useLeaderboardSnapshotHistory(bullPenId, limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">No snapshot history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="card-base p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Snapshot History</h3>
        
        <div className="space-y-2">
          {snapshots.map((snapshot: any, idx: number) => {
            const snapshotTime = new Date(snapshot);
            const isSelected = selectedSnapshot === snapshot;
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedSnapshot(isSelected ? null : snapshot)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-primary/20 border border-primary'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {snapshotTime.toLocaleTimeString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {snapshotTime.toLocaleDateString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Snapshot Details */}
      {selectedSnapshot && (
        <div className="card-base p-6">
          <h4 className="text-base font-semibold text-foreground mb-4">
            Snapshot at {new Date(selectedSnapshot).toLocaleTimeString()}
          </h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Total Players</p>
                <p className="text-lg font-semibold text-foreground">-</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Avg Portfolio Value</p>
                <p className="text-lg font-semibold text-foreground">-</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Highest P&L</p>
                <p className="text-lg font-semibold text-success">-</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Lowest P&L</p>
                <p className="text-lg font-semibold text-destructive">-</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trend Indicators */}
      <div className="card-base p-6">
        <h4 className="text-base font-semibold text-foreground mb-4">Trends</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-foreground">Portfolio Values</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-foreground">P&L Distribution</span>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
        </div>
      </div>
    </div>
  );
}

