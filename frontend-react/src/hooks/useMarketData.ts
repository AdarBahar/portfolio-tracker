import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

/**
 * Fetch market data for a symbol
 */
export function useMarketData(symbol: string | undefined) {
  return useQuery({
    queryKey: ['marketData', symbol],
    queryFn: async () => {
      if (!symbol) return null;
      const response = await apiClient.get(`/market-data/${symbol}`);
      return response.data as MarketData;
    },
    enabled: !!symbol,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

