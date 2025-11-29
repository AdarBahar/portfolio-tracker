import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Position {
  id: number;
  bullPenId: number;
  userId: number;
  symbol: string;
  qty: number;
  avgCost: number;
  instrumentType: 'stock' | 'option' | 'etf';
  optionType?: 'call' | 'put';
  strikePrice?: number;
  expirationDate?: string;
}

export interface Order {
  id: number;
  bullPenId: number;
  userId: number;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  qty: number;
  filledQty: number;
  limitPrice?: number;
  avgFillPrice?: number;
  status: 'new' | 'filled' | 'rejected' | 'cancelled';
  rejectionReason?: string;
  placedAt: string;
}

export interface PlaceOrderInput {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  qty: number;
  limitPrice?: number;
}

/**
 * Fetch positions for a bull pen
 */
export function usePositions(bullPenId: number | undefined, mine = true) {
  return useQuery({
    queryKey: ['positions', bullPenId, mine],
    queryFn: async () => {
      if (!bullPenId) return [];
      const response = await apiClient.get(`/bull-pens/${bullPenId}/positions?mine=${mine.toString()}`);
      return (response.data as any).positions || [];
    },
    enabled: !!bullPenId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Fetch orders for a bull pen
 */
export function useOrders(bullPenId: number | undefined, mine = true) {
  return useQuery({
    queryKey: ['orders', bullPenId, mine],
    queryFn: async () => {
      if (!bullPenId) return [];
      const response = await apiClient.get(`/bull-pens/${bullPenId}/orders?mine=${mine.toString()}`);
      return (response.data as any).orders || [];
    },
    enabled: !!bullPenId,
    staleTime: 10000,
    refetchInterval: 30000,
  });
}

/**
 * Place order (buy/sell)
 */
export function usePlaceOrder(bullPenId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlaceOrderInput) => {
      if (!bullPenId) throw new Error('Bull pen ID is required');
      const response = await apiClient.post(`/bull-pens/${bullPenId}/orders`, input);
      return response.data;
    },
    onSuccess: () => {
      if (bullPenId) {
        queryClient.invalidateQueries({ queryKey: ['positions', bullPenId] });
        queryClient.invalidateQueries({ queryKey: ['orders', bullPenId] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard', bullPenId] });
      }
    },
  });
}

