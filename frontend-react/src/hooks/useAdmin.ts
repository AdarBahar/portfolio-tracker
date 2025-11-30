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

export interface UserDetailResponse {
  user: User;
  budget: {
    id: number;
    user_id: number;
    available_balance: number;
    locked_balance: number;
    currency: string;
    status: string;
    created_at: string;
    updated_at: string;
  } | null;
  budget_logs: Array<{
    id: number;
    user_id: number;
    direction: string;
    operation_type: string;
    amount: number;
    currency: string;
    balance_before: number;
    balance_after: number;
    bull_pen_id: number | null;
    season_id: number | null;
    correlation_id: string | null;
    created_at: string;
  }>;
  trading_rooms: Array<{
    id: number;
    name: string;
    state: string;
    starting_cash: number;
    host_user_id: number;
    start_time: string;
    duration_sec: number;
    role: string;
    status: string;
    cash: number;
    joined_at: string;
  }>;
  standings: Array<{
    bull_pen_id: number;
    bull_pen_name: string;
    rank: number;
    portfolio_value: number;
    pnl_abs: number;
    pnl_pct: number;
  }>;
}

export interface UserDetail extends User {
  budget: UserDetailResponse['budget'];
  budget_logs: UserDetailResponse['budget_logs'];
  trading_rooms: UserDetailResponse['trading_rooms'];
  standings: UserDetailResponse['standings'];
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

export interface AuditLog {
  id: number;
  user_id: number;
  event_type: string;
  event_category: string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  previous_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
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
      return response.data as UserDetailResponse;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function useUserLogs(userId: number | undefined) {
  return useQuery({
    queryKey: ['userLogs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiClient.get(`/admin/users/${userId}/logs`);
      return (response.data as any).logs as AuditLog[];
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function useUpdateUserAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const response = await apiClient.patch(`/admin/users/${userId}/admin`, { is_admin: isAdmin });
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
    mutationFn: async ({ userId, stars, reason }: { userId: number; stars: number; reason: string }) => {
      const response = await apiClient.post(`/admin/users/${userId}/grant-stars`, { stars, reason });
      return response.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userDetail', userId] });
      queryClient.invalidateQueries({ queryKey: ['userLogs', userId] });
    },
  });
}

export function useRemoveStars() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, stars, reason }: { userId: number; stars: number; reason: string }) => {
      const response = await apiClient.post(`/admin/users/${userId}/remove-stars`, { stars, reason });
      return response.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userDetail', userId] });
      queryClient.invalidateQueries({ queryKey: ['userLogs', userId] });
    },
  });
}

export function useAdjustBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, amount, direction, reason }: { userId: number; amount: number; direction: 'IN' | 'OUT'; reason: string }) => {
      const response = await apiClient.post(`/admin/users/${userId}/adjust-budget`, { amount, direction, reason });
      return response.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userDetail', userId] });
      queryClient.invalidateQueries({ queryKey: ['userLogs', userId] });
    },
  });
}

