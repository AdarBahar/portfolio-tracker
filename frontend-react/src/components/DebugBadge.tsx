import { useDebugMode } from '@/hooks/useDebugMode';
import { AlertCircle } from 'lucide-react';

/**
 * Debug Badge Component
 * Displays a badge when the backend is running in debug mode (MARKET_DATA_MODE=debug)
 * This indicates that Finnhub API requests are throttled (only first call per symbol)
 */
export default function DebugBadge() {
  const { data: isDebugMode, isLoading } = useDebugMode();

  // Don't render anything if not in debug mode or still loading
  if (isLoading || !isDebugMode) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
      <AlertCircle className="w-4 h-4 text-yellow-500" />
      <span className="text-xs font-semibold text-yellow-500">DEBUG MODE</span>
    </div>
  );
}

