import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'none';
  trendValue?: number;
  color?: 'default' | 'success' | 'danger' | 'warning';
  isLoading?: boolean;
}

/**
 * StatCard Component
 * Displays a single metric with icon, label, and value
 * Features:
 * - Icon + label + value layout
 * - Optional trend indicator
 * - Hover elevation effect
 * - Skeleton loading state
 * - Color-coded values
 * - Light/dark mode support
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  color = 'default',
  isLoading = false,
}: StatCardProps) {
  // Color mappings
  const colorMap = {
    default: 'text-foreground',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-danger" />;
    return null;
  };

  return (
    <div
      className={`
        bg-card
        border border-border
        rounded-lg
        p-4
        transition-all duration-200
        hover:shadow-md hover:border-primary/50
        ${isLoading ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {/* Icon */}
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        {trend && getTrendIcon()}
      </div>

      {/* Label */}
      <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">
        {label}
      </p>

      {/* Value */}
      {isLoading ? (
        <div className="h-8 bg-muted rounded animate-pulse mb-2" />
      ) : (
        <p className={`text-2xl font-bold ${colorMap[color]} mb-2`}>
          {value}
        </p>
      )}

      {/* Trend Value */}
      {trendValue !== undefined && (
        <p className={`text-xs font-medium ${
          trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-muted-foreground'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
        </p>
      )}
    </div>
  );
}

