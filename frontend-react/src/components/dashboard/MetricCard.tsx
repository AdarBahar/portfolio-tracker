import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  trend?: number;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  subtext,
  icon,
  trend,
  className = '',
}: MetricCardProps) {
  const getTrendColor = (trendValue?: number) => {
    if (trendValue === undefined) return 'text-muted-foreground';
    if (trendValue > 0) return 'text-green-500';
    if (trendValue < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getTrendIcon = (trendValue?: number) => {
    if (trendValue === undefined) return null;
    if (trendValue > 0) return <TrendingUp className="w-4 h-4" />;
    if (trendValue < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6 hover:border-white/20 transition">
      <div className="flex items-start justify-between mb-4">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        {icon && <div className="text-primary">{icon}</div>}
      </div>

      <div className="space-y-2">
        <p className={`text-2xl font-bold text-white ${className}`}>{value}</p>

        {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}

        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)}
            <span>{Math.abs(trend).toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

