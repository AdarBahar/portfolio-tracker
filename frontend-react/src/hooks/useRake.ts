import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface RakeConfig {
  id: number;
  percentage: number;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RakeStats {
  total_collected: number;
  total_rooms: number;
  average_rake: number;
  last_collection: string;
}

export interface RakeHistory {
  id: number;
  bull_pen_id: number;
  amount: number;
  collected_at: string;
}

export interface CreateRakeConfigInput {
  percentage: number;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
}

export function useRakeConfig() {
  return useQuery({
    queryKey: ['rakeConfig'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/rake/config');
      return (response.data as any).config as RakeConfig;
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });
}

export function useRakeStats() {
  return useQuery({
    queryKey: ['rakeStats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/rake/stats');
      return (response.data as any).stats as RakeStats;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useRakeHistory(limit = 100) {
  return useQuery({
    queryKey: ['rakeHistory', limit],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/rake/history?limit=${limit}`);
      return (response.data as any).history as RakeHistory[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useUpdateRakeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRakeConfigInput) => {
      const response = await apiClient.post('/admin/rake/config', input);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rakeConfig'] });
      queryClient.invalidateQueries({ queryKey: ['rakeStats'] });
    },
  });
}

