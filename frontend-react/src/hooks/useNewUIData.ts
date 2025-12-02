/**
 * Custom hooks for new UI components
 * All data is fetched from API endpoints - NO MOCK DATA
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  User,
  UserProfile,
  Portfolio,
  CreateOrderInput,
  StockInfo,
  CreateTradeRoomInput,
} from '@/types';

// ============================================================================
// USER PROFILE HOOKS
// ============================================================================

/**
 * Fetch current user profile with portfolio data
 */
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/user/profile');
      return response.data as UserProfile;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });
}

/**
 * Fetch user by ID
 */
export function useUserProfile(userId: number | undefined) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiClient.get(`/users/${userId}`);
      return response.data as User;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

// ============================================================================
// TRADE ROOM HOOKS
// ============================================================================

/**
 * Fetch user's current/active trade rooms
 */
export function useCurrentTradeRooms() {
  return useQuery({
    queryKey: ['currentTradeRooms'],
    queryFn: async () => {
      const response = await apiClient.get('/my/bull-pens');
      return (response.data as any).bullPens || [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Fetch all available trade rooms to join
 */
export function useAvailableTradeRooms() {
  return useQuery({
    queryKey: ['availableTradeRooms'],
    queryFn: async () => {
      const response = await apiClient.get('/bull-pens');
      return (response.data as any).bullPens || [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Fetch single trade room details
 */
export function useTradeRoomDetail(bullPenId: number | undefined) {
  return useQuery({
    queryKey: ['tradeRoomDetail', bullPenId],
    queryFn: async () => {
      if (!bullPenId) return null;
      const response = await apiClient.get(`/bull-pens/${bullPenId}`);
      return (response.data as any).bullPen;
    },
    enabled: !!bullPenId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Create new trade room
 */
export function useCreateTradeRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTradeRoomInput) => {
      const response = await apiClient.post('/bull-pens', input);
      return (response.data as any).bullPen;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentTradeRooms'] });
      queryClient.invalidateQueries({ queryKey: ['availableTradeRooms'] });
    },
  });
}

/**
 * Join trade room
 */
export function useJoinTradeRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bullPenId: number) => {
      const response = await apiClient.post(`/bull-pens/${bullPenId}/join`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentTradeRooms'] });
      queryClient.invalidateQueries({ queryKey: ['availableTradeRooms'] });
    },
  });
}

// ============================================================================
// PORTFOLIO HOOKS
// ============================================================================

/**
 * Fetch portfolio for a specific trade room
 */
export function usePortfolio(bullPenId: number | undefined) {
  return useQuery({
    queryKey: ['portfolio', bullPenId],
    queryFn: async () => {
      if (!bullPenId) return null;
      const response = await apiClient.get(`/bull-pens/${bullPenId}/portfolio`);
      return response.data as Portfolio;
    },
    enabled: !!bullPenId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Fetch holdings for a specific trade room
 */
export function useHoldings(bullPenId: number | undefined) {
  return useQuery({
    queryKey: ['holdings', bullPenId],
    queryFn: async () => {
      if (!bullPenId) return [];
      const response = await apiClient.get(`/bull-pens/${bullPenId}/holdings`);
      return (response.data as any).holdings || [];
    },
    enabled: !!bullPenId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// ============================================================================
// LEADERBOARD HOOKS
// ============================================================================

/**
 * Fetch leaderboard for a specific trade room
 */
export function useLeaderboard(bullPenId: number | undefined) {
  return useQuery({
    queryKey: ['leaderboard', bullPenId],
    queryFn: async () => {
      if (!bullPenId) return [];
      const response = await apiClient.get(`/bull-pens/${bullPenId}/leaderboard`);
      return (response.data as any).leaderboard || [];
    },
    enabled: !!bullPenId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// ============================================================================
// TRADING HOOKS
// ============================================================================

/**
 * Place buy/sell order
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bullPenId,
      order,
    }: {
      bullPenId: number;
      order: CreateOrderInput;
    }) => {
      const response = await apiClient.post(
        `/bull-pens/${bullPenId}/orders`,
        order
      );
      return response.data;
    },
    onSuccess: (_, { bullPenId }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', bullPenId] });
      queryClient.invalidateQueries({ queryKey: ['holdings', bullPenId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', bullPenId] });
    },
  });
}

// ============================================================================
// MARKET DATA HOOKS
// ============================================================================

/**
 * Fetch stock information
 */
export function useStockInfo(symbol: string | undefined) {
  return useQuery({
    queryKey: ['stockInfo', symbol],
    queryFn: async () => {
      if (!symbol) return null;
      const response = await apiClient.get(`/market-data/${symbol}`);
      return response.data as StockInfo;
    },
    enabled: !!symbol,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Search stocks by symbol or name
 */
export function useStockSearch(query: string | undefined) {
  return useQuery({
    queryKey: ['stockSearch', query],
    queryFn: async () => {
      if (!query || query.length < 1) return [];
      const response = await apiClient.get(`/market-data/search?q=${query}`);
      return (response.data as any).results || [];
    },
    enabled: !!query && query.length > 0,
    staleTime: 60000,
  });
}

