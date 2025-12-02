import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface HealthResponse {
  status: string;
  db: string;
  marketDataMode: 'production' | 'debug';
}

/**
 * Hook to check if the backend is running in debug mode
 * Fetches from /api/health endpoint which includes marketDataMode
 */
export function useDebugMode() {
  return useQuery({
    queryKey: ['debugMode'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<HealthResponse>('/health');
        return response.data.marketDataMode === 'debug';
      } catch (error) {
        // If health check fails, assume production mode
        console.warn('Failed to fetch debug mode status:', error);
        return false;
      }
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 1,
  });
}

