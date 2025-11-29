/**
 * Portfolio calculation utilities
 */

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  purchase_price: number;
  current_price: number;
  sector: string;
  asset_class: string;
  purchase_date: string;
  recommendation?: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCostBasis: number;
  totalGain: number;
  totalGainPercent: number;
  dividendIncome: number;
  todayChange: number;
  todayChangePercent: number;
  portfolioBeta: number;
  avgDividendYield: number;
  bestPerformer: string;
  worstPerformer: string;
}

export function calculateHoldingMetrics(holding: Holding) {
  const currentValue = holding.shares * holding.current_price;
  const costBasis = holding.shares * holding.purchase_price;
  const gainLoss = currentValue - costBasis;
  const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

  return {
    currentValue,
    costBasis,
    gainLoss,
    gainLossPercent,
  };
}

export function calculatePortfolioMetrics(holdings: Holding[]): PortfolioMetrics {
  let totalValue = 0;
  let totalCostBasis = 0;
  let bestPerformer = '';
  let worstPerformer = '';
  let bestGain = -Infinity;
  let worstGain = Infinity;

  holdings.forEach((holding) => {
    const metrics = calculateHoldingMetrics(holding);
    totalValue += metrics.currentValue;
    totalCostBasis += metrics.costBasis;

    if (metrics.gainLossPercent > bestGain) {
      bestGain = metrics.gainLossPercent;
      bestPerformer = holding.ticker;
    }
    if (metrics.gainLossPercent < worstGain) {
      worstGain = metrics.gainLossPercent;
      worstPerformer = holding.ticker;
    }
  });

  const totalGain = totalValue - totalCostBasis;
  const totalGainPercent = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

  return {
    totalValue,
    totalCostBasis,
    totalGain,
    totalGainPercent,
    dividendIncome: 0, // Will be calculated from dividends
    todayChange: 0, // Will be calculated from price changes
    todayChangePercent: 0,
    portfolioBeta: 1.05, // Simplified
    avgDividendYield: 0, // Will be calculated
    bestPerformer,
    worstPerformer,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function getGainLossClass(value: number): string {
  if (value > 0) return 'text-success';
  if (value < 0) return 'text-destructive';
  return 'text-muted-foreground';
}

export function groupByProperty<T>(items: T[], property: keyof T): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = String(item[property]);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export function calculateSectorAllocation(holdings: Holding[]) {
  const bySector = groupByProperty(holdings, 'sector');
  return Object.entries(bySector).map(([sector, items]) => {
    const value = items.reduce((sum, h) => sum + h.shares * h.current_price, 0);
    return { sector, value };
  });
}

export function calculateAssetClassAllocation(holdings: Holding[]) {
  const byClass = groupByProperty(holdings, 'asset_class');
  return Object.entries(byClass).map(([assetClass, items]) => {
    const value = items.reduce((sum, h) => sum + h.shares * h.current_price, 0);
    return { assetClass, value };
  });
}

