import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Position {
  id: number;
  bullPenId: number;
  userId: number;
  symbol: string;
  qty: number;
  avgCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface PositionWithMarketValue extends Position {
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
}

/**
 * Fetch user's positions in a room
 */
export function useUserPositions(bullPenId: number | undefined) {
  return useQuery({
    queryKey: ['userPositions', bullPenId],
    queryFn: async () => {
      if (!bullPenId) return [];
      const response = await apiClient.get(`/bull-pens/${bullPenId}/positions`);
      return (response.data as any).positions || [];
    },
    enabled: !!bullPenId,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

/**
 * Calculate portfolio value from positions and cash
 */
export function usePortfolioValue(
  positions: PositionWithMarketValue[],
  cash: number
): number {
  const positionsValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
  return cash + positionsValue;
}

/**
 * Calculate total P&L from positions
 */
export function useTotalPnL(positions: PositionWithMarketValue[]): {
  totalPnlAbs: number;
  totalPnlPct: number;
} {
  const totalPnlAbs = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  
  // Calculate weighted average P&L percentage
  const totalCost = positions.reduce((sum, pos) => sum + pos.qty * pos.avgCost, 0);
  const totalPnlPct = totalCost > 0 ? (totalPnlAbs / totalCost) * 100 : 0;

  return {
    totalPnlAbs: Math.round(totalPnlAbs * 100) / 100,
    totalPnlPct: Math.round(totalPnlPct * 100) / 100,
  };
}

/**
 * Get position statistics
 */
export function usePositionStats(positions: PositionWithMarketValue[]) {
  const winners = positions.filter(p => p.unrealizedPnl > 0);
  const losers = positions.filter(p => p.unrealizedPnl < 0);
  const breakeven = positions.filter(p => p.unrealizedPnl === 0);

  const totalMarketValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.qty * p.avgCost, 0);

  return {
    totalPositions: positions.length,
    winners: winners.length,
    losers: losers.length,
    breakeven: breakeven.length,
    totalMarketValue: Math.round(totalMarketValue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    largestWinner: winners.length > 0 
      ? Math.max(...winners.map(p => p.unrealizedPnl))
      : 0,
    largestLoser: losers.length > 0
      ? Math.min(...losers.map(p => p.unrealizedPnl))
      : 0,
  };
}

/**
 * Format position for display
 */
export function formatPosition(position: PositionWithMarketValue): {
  symbol: string;
  qty: string;
  avgCost: string;
  currentPrice: string;
  marketValue: string;
  pnl: string;
  pnlPct: string;
  pnlColor: string;
} {
  const pnlColor = position.unrealizedPnl > 0 ? 'text-green-500' : position.unrealizedPnl < 0 ? 'text-red-500' : 'text-gray-500';

  return {
    symbol: position.symbol,
    qty: position.qty.toFixed(2),
    avgCost: `$${position.avgCost.toFixed(2)}`,
    currentPrice: `$${position.currentPrice.toFixed(2)}`,
    marketValue: `$${position.marketValue.toFixed(2)}`,
    pnl: `$${position.unrealizedPnl.toFixed(2)}`,
    pnlPct: `${position.unrealizedPnlPct.toFixed(2)}%`,
    pnlColor,
  };
}

