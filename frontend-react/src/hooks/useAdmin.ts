import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  auth_provider: string;
  is_demo: boolean;
  is_admin: boolean;
  status: string;
  created_at: string;
  last_login: string | null;
}

export interface UserDetail extends User {
  budget: {
    total_balance: number;
    locked_balance: number;
    available_balance: number;
  };
  transactions: Array<{
    id: number;
    type: string;
    amount: number;
    created_at: string;
  }>;
  rooms: Array<{
    id: number;
    name: string;
    state: string;
    portfolio_value: number;
    gain_loss: number;
  }>;
  standings: Array<{
    room_id: number;
    rank: number;
    portfolio_value: number;
    gain_loss: number;
  }>;
}

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

export interface Promotion {
  id: number;
  code: string;
  name: string;
  description: string;
  bonus_type: string;
  bonus_amount: number;
  max_uses: number | null;
  min_account_age_days: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

// Hooks
export function useUsers() {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users');
      return (response.data as any).users || [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useUserDetail(userId: number | undefined) {
  return useQuery({
    queryKey: ['userDetail', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiClient.get(`/admin/users/${userId}/detail`);
      return (response.data as any).user as UserDetail;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function useUpdateUserAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const response = await apiClient.put(`/admin/users/${userId}/admin`, { is_admin: isAdmin });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useGrantStars() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, stars }: { userId: number; stars: number }) => {
      const response = await apiClient.post(`/admin/users/${userId}/grant-stars`, { stars });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

