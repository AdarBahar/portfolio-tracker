/**
 * Chart Data Calculations
 * Utility functions for preparing data for chart visualization
 */

export interface SectorData {
  name: string;
  value: number;
  color: string;
}

export interface AssetClassData {
  name: string;
  value: number;
  color: string;
}

export interface PerformanceData {
  ticker: string;
  percent: number;
  value: number;
  color: string;
}

export interface PortfolioTrendData {
  date: string;
  value: number;
  gain_loss: number;
}

// Sector colors
const SECTOR_COLORS: Record<string, string> = {
  'Technology': '#3B82F6',
  'Healthcare': '#10B981',
  'Financials': '#F59E0B',
  'Industrials': '#8B5CF6',
  'Consumer': '#EC4899',
  'Energy': '#EF4444',
  'Materials': '#6B7280',
  'Utilities': '#14B8A6',
  'Real Estate': '#F97316',
  'Communication': '#06B6D4',
};

// Asset class colors
const ASSET_CLASS_COLORS: Record<string, string> = {
  'Stocks': '#3B82F6',
  'Bonds': '#10B981',
  'ETFs': '#F59E0B',
  'Mutual Funds': '#8B5CF6',
  'Cash': '#6B7280',
};

/**
 * Calculate sector allocation from holdings
 */
export function calculateSectorAllocation(holdings: any[]): SectorData[] {
  const sectorMap: Record<string, number> = {};

  holdings.forEach(holding => {
    const sector = holding.sector || 'Other';
    const value = (holding.current_price || 0) * (holding.shares || 0);
    sectorMap[sector] = (sectorMap[sector] || 0) + value;
  });

  return Object.entries(sectorMap)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: SECTOR_COLORS[name] || '#9CA3AF',
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Calculate asset class allocation from holdings
 */
export function calculateAssetClassAllocation(holdings: any[]): AssetClassData[] {
  const classMap: Record<string, number> = {};

  holdings.forEach(holding => {
    const assetClass = holding.asset_class || 'Other';
    const value = (holding.current_price || 0) * (holding.shares || 0);
    classMap[assetClass] = (classMap[assetClass] || 0) + value;
  });

  return Object.entries(classMap)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: ASSET_CLASS_COLORS[name] || '#9CA3AF',
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Calculate performance by holding
 */
export function calculatePerformanceByHolding(holdings: any[]): PerformanceData[] {
  return holdings
    .map(holding => {
      const currentValue = (holding.current_price || 0) * (holding.shares || 0);
      const costBasis = (holding.purchase_price || 0) * (holding.shares || 0);
      const gainLoss = currentValue - costBasis;
      const percent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      return {
        ticker: holding.ticker,
        percent: Math.round(percent * 100) / 100,
        value: Math.round(gainLoss * 100) / 100,
        color: percent >= 0 ? '#10B981' : '#EF4444',
      };
    })
    .sort((a, b) => b.percent - a.percent);
}

/**
 * Calculate portfolio trend over time
 */
export function calculatePortfolioTrend(transactions: any[]): PortfolioTrendData[] {
  const trendMap: Record<string, { value: number; gain_loss: number }> = {};

  transactions.forEach(tx => {
    const date = tx.date || new Date().toISOString().split('T')[0];
    if (!trendMap[date]) {
      trendMap[date] = { value: 0, gain_loss: 0 };
    }
    trendMap[date].value += tx.amount || 0;
  });

  return Object.entries(trendMap)
    .map(([date, data]) => ({
      date,
      value: Math.round(data.value * 100) / 100,
      gain_loss: Math.round(data.gain_loss * 100) / 100,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

