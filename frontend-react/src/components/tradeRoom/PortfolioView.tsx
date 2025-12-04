import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { usePositions } from '@/hooks/useBullPenOrders';
import { useMarketData } from '@/hooks/useMarketData';
import { formatCurrency } from '@/utils/formatting';
import { calculatePositionValue, calculatePositionGainLoss } from '@/utils/tradeRoomCalculations';
import { hybridConnectionManager } from '@/services/hybridConnectionManager';

interface PortfolioViewProps {
  bullPenId: number;
  cash?: number;
}

export default function PortfolioView({ bullPenId, cash = 0 }: PortfolioViewProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: positions = [], isLoading: positionsLoading, refetch } = usePositions(bullPenId, true);

  // Subscribe to position updates
  useEffect(() => {
    if (!hybridConnectionManager.isConnected()) return;

    const unsubscribe = hybridConnectionManager.on('position_update', (data) => {
      if (data.bullPenId === bullPenId && autoRefresh) {
        refetch();
      }
    });

    return unsubscribe;
  }, [bullPenId, autoRefresh, refetch]);

  if (positionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Calculate portfolio stats
  const positionsWithValues = positions.map((pos: any) => ({
    ...pos,
    marketValue: calculatePositionValue(pos, pos.currentPrice || pos.avgCost),
  }));

  const totalPositionsValue = positionsWithValues.reduce((sum: number, pos: any) => sum + pos.marketValue, 0);
  const portfolioValue = cash + totalPositionsValue;
  const totalCost = positionsWithValues.reduce((sum: number, pos: any) => sum + (pos.qty * pos.avgCost), 0);
  const totalPnL = portfolioValue - (cash + totalCost);
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  if (positions.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">No positions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground mb-1">Cash</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(cash)}</p>
        </div>

        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground mb-1">Positions Value</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(totalPositionsValue)}</p>
        </div>

        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(portfolioValue)}</p>
        </div>

        <div className={`card-base p-4 ${totalPnL >= 0 ? 'border-success/30' : 'border-destructive/30'}`}>
          <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
          <p className={`text-lg font-semibold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(totalPnL)} ({totalPnLPct.toFixed(2)}%)
          </p>
        </div>
      </div>
      {/* Controls */}
      <div className="flex justify-end">
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

      {/* Positions Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Symbol
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Current Value
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Gain/Loss
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position: any) => (
                <PositionRow key={position.id} position={position} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PositionRow({ position }: { position: any }): React.ReactElement {
  const { data: marketData } = useMarketData(position.symbol);
  const currentPrice = marketData?.price || Number(position.avgCost);
  const currentValue = calculatePositionValue(position, currentPrice);
  const { absolute, percentage } = calculatePositionGainLoss(position as any, currentPrice);

  const gainLossClass = absolute >= 0 ? 'text-success' : 'text-destructive';

  return (
    <tr className="border-b border-white/10 hover:bg-white/5">
      <td className="px-6 py-3 text-white font-medium">{position.symbol}</td>
      <td className="px-6 py-3 text-right text-white">
        {Number(position.qty).toFixed(2)}
      </td>
      <td className="px-6 py-3 text-right text-muted-foreground">
        {formatCurrency(Number(position.avgCost))}
      </td>
      <td className="px-6 py-3 text-right text-white">
        {formatCurrency(currentValue)}
      </td>
      <td className={`px-6 py-3 text-right font-medium ${gainLossClass}`}>
        {formatCurrency(absolute)}
      </td>
      <td className={`px-6 py-3 text-right font-medium ${gainLossClass}`}>
        {percentage.toFixed(2)}%
      </td>
    </tr>
  );
}

