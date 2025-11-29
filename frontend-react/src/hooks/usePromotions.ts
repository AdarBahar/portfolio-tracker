import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

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
  updated_at: string;
}

export interface CreatePromotionInput {
  code: string;
  name: string;
  description?: string;
  bonus_type: 'fixed' | 'percentage';
  bonus_amount: number;
  max_uses?: number;
  min_account_age_days?: number;
  start_date: string;
  end_date: string;
}

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/promotions');
      return (response.data as any) as Promotion[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePromotionInput) => {
      const response = await apiClient.post('/admin/promotions', input);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

