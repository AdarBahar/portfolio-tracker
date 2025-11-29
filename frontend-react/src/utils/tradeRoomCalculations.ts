import type { Position } from '@/hooks/useBullPenOrders';

/**
 * Calculate position value
 */
export function calculatePositionValue(position: Position, currentPrice: number): number {
  return Number(position.qty) * currentPrice;
}

/**
 * Calculate position gain/loss
 */
export function calculatePositionGainLoss(
  position: Position,
  currentPrice: number
): { absolute: number; percentage: number } {
  const currentValue = calculatePositionValue(position, currentPrice);
  const costBasis = Number(position.qty) * Number(position.avgCost);
  const absolute = currentValue - costBasis;
  const percentage = costBasis > 0 ? (absolute / costBasis) * 100 : 0;

  return { absolute, percentage };
}

/**
 * Calculate total portfolio value
 */
export function calculatePortfolioValue(
  positions: Position[],
  priceMap: Record<string, number>,
  cash: number
): number {
  let positionsValue = 0;

  for (const position of positions) {
    const price = priceMap[position.symbol] || Number(position.avgCost);
    positionsValue += calculatePositionValue(position, price);
  }

  return positionsValue + cash;
}

/**
 * Calculate portfolio gain/loss
 */
export function calculatePortfolioGainLoss(
  positions: Position[],
  priceMap: Record<string, number>,
  cash: number,
  startingCash: number
): { absolute: number; percentage: number } {
  const currentValue = calculatePortfolioValue(positions, priceMap, cash);
  const absolute = currentValue - startingCash;
  const percentage = startingCash > 0 ? (absolute / startingCash) * 100 : 0;

  return { absolute, percentage };
}

/**
 * Format time remaining for bull pen
 */
export function formatTimeRemaining(startTime: string, durationSec: number): string {
  const start = new Date(startTime).getTime();
  const end = start + durationSec * 1000;
  const now = Date.now();

  if (now < start) {
    const diff = start - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    return `Starts in ${hours}h`;
  }

  if (now > end) {
    return 'Completed';
  }

  const remaining = end - now;
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(state: string): string {
  switch (state) {
    case 'active':
      return 'bg-success/20 text-success';
    case 'scheduled':
      return 'bg-warning/20 text-warning';
    case 'completed':
      return 'bg-info/20 text-info';
    case 'archived':
      return 'bg-muted/20 text-muted-foreground';
    case 'draft':
      return 'bg-secondary/20 text-secondary-foreground';
    default:
      return 'bg-muted/20 text-muted-foreground';
  }
}

