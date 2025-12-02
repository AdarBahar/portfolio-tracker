import { useState } from 'react';
import { Loader, X } from 'lucide-react';
import { useUserPositions, usePositionStats, formatPosition } from '@/hooks/usePositionTracking';
import { formatCurrency } from '@/utils/formatting';

interface PositionTrackerProps {
  bullPenId: number;
  onClosePosition?: (positionId: number) => void;
}

export default function PositionTracker({ bullPenId, onClosePosition }: PositionTrackerProps) {
  const [sortBy, setSortBy] = useState<'symbol' | 'pnl' | 'value'>('pnl');
  const { data: positions = [], isLoading } = useUserPositions(bullPenId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">No open positions</p>
      </div>
    );
  }

  // Enrich positions with market data
  const enrichedPositions = positions.map((pos: any) => ({
    ...pos,
    currentPrice: pos.currentPrice || pos.avgCost,
    marketValue: pos.qty * (pos.currentPrice || pos.avgCost),
    unrealizedPnl: (pos.qty * (pos.currentPrice || pos.avgCost)) - (pos.qty * pos.avgCost),
    unrealizedPnlPct: ((pos.currentPrice || pos.avgCost) - pos.avgCost) / pos.avgCost * 100,
  }));

  // Sort positions
  const sortedPositions = [...enrichedPositions].sort((a, b) => {
    if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
    if (sortBy === 'pnl') return b.unrealizedPnl - a.unrealizedPnl;
    if (sortBy === 'value') return b.marketValue - a.marketValue;
    return 0;
  });

  const stats = usePositionStats(enrichedPositions);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Total Positions</p>
          <p className="text-lg font-semibold text-foreground">{stats.totalPositions}</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Winners</p>
          <p className="text-lg font-semibold text-success">{stats.winners}</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Losers</p>
          <p className="text-lg font-semibold text-destructive">{stats.losers}</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Market Value</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(stats.totalMarketValue)}</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2">
        {(['symbol', 'pnl', 'value'] as const).map(option => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              sortBy === option
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/10 text-muted-foreground hover:bg-white/20'
            }`}
          >
            {option === 'symbol' ? 'Symbol' : option === 'pnl' ? 'P&L' : 'Value'}
          </button>
        ))}
      </div>

      {/* Positions List */}
      <div className="space-y-2">
        {sortedPositions.map((position) => {
          const formatted = formatPosition(position);
          const isWinner = position.unrealizedPnl > 0;

          return (
            <div
              key={position.id}
              className={`card-base p-4 border-l-4 ${
                isWinner ? 'border-l-success' : position.unrealizedPnl < 0 ? 'border-l-destructive' : 'border-l-gray-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{formatted.symbol}</h4>
                    <span className="text-xs text-muted-foreground">{formatted.qty} shares</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Cost</p>
                      <p className="text-foreground">{formatted.avgCost}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-foreground">{formatted.currentPrice}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Market Value</p>
                      <p className="text-foreground">{formatted.marketValue}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">P&L</p>
                      <p className={formatted.pnlColor}>{formatted.pnl} ({formatted.pnlPct})</p>
                    </div>
                  </div>
                </div>

                {onClosePosition && (
                  <button
                    onClick={() => onClosePosition(position.id)}
                    className="ml-4 p-2 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

