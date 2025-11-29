import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface BullPen {
  id: number;
  name: string;
  description?: string;
  state: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
  startTime: string;
  durationSec: number;
  maxPlayers: number;
  startingCash: number;
  allowFractional: boolean;
  approvalRequired: boolean;
  inviteCode?: string;
  hostUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBullPenInput {
  name: string;
  description?: string;
  startTime: string;
  durationSec: number;
  maxPlayers: number;
  startingCash: number;
  allowFractional?: boolean;
  approvalRequired?: boolean;
}

/**
 * Fetch user's bull pens
 */
export function useMyBullPens() {
  return useQuery({
    queryKey: ['myBullPens'],
    queryFn: async () => {
      const response = await apiClient.get('/my/bull-pens');
      return (response.data as any).bullPens || [];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });
}

/**
 * Fetch all available bull pens
 */
export function useAllBullPens() {
  return useQuery({
    queryKey: ['allBullPens'],
    queryFn: async () => {
      const response = await apiClient.get('/bull-pens');
      return (response.data as any).bullPens || [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Fetch single bull pen details
 */
export function useBullPen(bullPenId: number | undefined) {
  return useQuery({
    queryKey: ['bullPen', bullPenId],
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
 * Create new bull pen
 */
export function useCreateBullPen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBullPenInput) => {
      const response = await apiClient.post('/bull-pens', input);
      return (response.data as any).bullPen;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBullPens'] });
      queryClient.invalidateQueries({ queryKey: ['allBullPens'] });
    },
  });
}

/**
 * Join bull pen
 */
export function useJoinBullPen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bullPenId: number) => {
      const response = await apiClient.post(`/bull-pens/${bullPenId}/join`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBullPens'] });
      queryClient.invalidateQueries({ queryKey: ['allBullPens'] });
    },
  });
}

/**
 * Leave bull pen
 */
export function useLeaveBullPen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bullPenId: number) => {
      const response = await apiClient.post(`/bull-pens/${bullPenId}/leave`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBullPens'] });
    },
  });
}

