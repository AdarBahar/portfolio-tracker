import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * StatCard Component
 * 
 * Reusable card for displaying individual statistics with optional icon and trend.
 * Follows the design guide with consistent styling and responsive sizing.
 * 
 * @example
 * <StatCard
 *   label="Global Rank"
 *   value="#1"
 *   icon={Trophy}
 *   iconColor="text-[#F59E0B]"
 *   trend={{ value: 5, isPositive: true }}
 * />
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-[#0BA5EC]',
  trend,
  className = '',
  size = 'medium',
}: StatCardProps) {
  const sizeClasses = {
    small: 'p-3 sm:p-4',
    medium: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8',
  };

  const valueSizeClasses = {
    small: 'text-lg sm:text-xl',
    medium: 'text-xl sm:text-2xl',
    large: 'text-2xl sm:text-3xl',
  };

  return (
    <div
      className={`bg-muted/30 rounded-xl ${sizeClasses[size]} border border-border/50 hover:border-[#0BA5EC]/50 transition-colors ${className}`}
    >
      {/* Icon and Label */}
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        {Icon && (
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${iconColor}`} />
        )}
        <span className="text-muted-foreground text-xs sm:text-sm truncate">
          {label}
        </span>
      </div>

      {/* Value and Trend */}
      <div className="flex items-end justify-between gap-2">
        <p className={`${iconColor} ${valueSizeClasses[size]} truncate font-semibold`}>
          {value}
        </p>
        {trend && (
          <div className={`flex items-center gap-1 text-xs sm:text-sm flex-shrink-0 ${
            trend.isPositive ? 'text-[#16A34A]' : 'text-[#EF4444]'
          }`}>
            <span>{trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

