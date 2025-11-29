import React from 'react';
import { Loader } from 'lucide-react';
import { usePositions } from '@/hooks/useBullPenOrders';
import { useMarketData } from '@/hooks/useMarketData';
import { formatCurrency } from '@/utils/formatting';
import { calculatePositionValue, calculatePositionGainLoss } from '@/utils/tradeRoomCalculations';

interface PortfolioViewProps {
  bullPenId: number;
}

export default function PortfolioView({ bullPenId }: PortfolioViewProps) {
  const { data: positions = [], isLoading: positionsLoading } = usePositions(bullPenId, true);

  if (positionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">No positions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

