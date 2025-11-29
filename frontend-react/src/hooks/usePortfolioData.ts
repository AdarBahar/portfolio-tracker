/**
 * Custom hook for portfolio data management
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Holding, PortfolioMetrics } from '@/utils/calculations';
import { calculatePortfolioMetrics } from '@/utils/calculations';

export interface PortfolioData {
  holdings: Holding[];
  transactions: any[];
  dividends: any[];
  metrics: PortfolioMetrics;
}

export function usePortfolioData() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    holdings: [],
    transactions: [],
    dividends: [],
    metrics: {
      totalValue: 0,
      totalCostBasis: 0,
      totalGain: 0,
      totalGainPercent: 0,
      dividendIncome: 0,
      todayChange: 0,
      todayChangePercent: 0,
      portfolioBeta: 1.05,
      avgDividendYield: 0,
      bestPerformer: '',
      worstPerformer: '',
    },
  });

  const { data, isLoading, error, refetch } = useQuery<PortfolioData>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await apiClient.get<PortfolioData>('/portfolio/all');
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (data) {
      const holdings = data.holdings || [];
      const metrics = calculatePortfolioMetrics(holdings);

      // Calculate dividend income
      const dividendIncome = (data.dividends || []).reduce(
        (sum: number, d: any) => sum + (d.amount || 0),
        0
      );

      setPortfolioData({
        holdings,
        transactions: data.transactions || [],
        dividends: data.dividends || [],
        metrics: {
          ...metrics,
          dividendIncome,
        },
      });
    }
  }, [data]);

  return {
    ...portfolioData,
    isLoading,
    error,
    refetch,
  };
}

export function useHolding(ticker: string) {
  return useQuery({
    queryKey: ['holding', ticker],
    queryFn: async () => {
      const response = await apiClient.get(`/holdings/${ticker}`);
      return response.data;
    },
  });
}

export function useAddHolding() {
  return async (holdingData: Omit<Holding, 'id' | 'current_price'>) => {
    const response = await apiClient.post('/holdings', holdingData);
    return response.data;
  };
}

export function useUpdateHolding() {
  return async (id: string, holdingData: Partial<Holding>) => {
    const response = await apiClient.put(`/holdings/${id}`, holdingData);
    return response.data;
  };
}

export function useDeleteHolding() {
  return async (id: string) => {
    await apiClient.delete(`/holdings/${id}`);
  };
}

export function usePriceHistory(ticker: string) {
  return useQuery({
    queryKey: ['priceHistory', ticker],
    queryFn: async () => {
      const response = await apiClient.get(`/prices/${ticker}/history`);
      return response.data;
    },
  });
}

