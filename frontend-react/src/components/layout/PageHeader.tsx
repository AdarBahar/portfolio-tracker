import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * PageHeader Component
 * 
 * Reusable header component for page titles with optional description, icon, and action button.
 * Follows the design guide with gradient card styling.
 * 
 * @example
 * <PageHeader
 *   title="Fantasy Broker"
 *   description="Manage your portfolio"
 *   icon={TrendingUp}
 *   iconColor="text-[#0BA5EC]"
 *   action={<button>Add Position</button>}
 * />
 */
export default function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'text-[#0BA5EC]',
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`gradient-card backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8 border border-border shadow-lg ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title and Description */}
        <div className="flex items-start gap-3 sm:gap-4 flex-1">
          {Icon && (
            <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-foreground mb-1 text-2xl sm:text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {action && (
          <div className="flex-shrink-0 w-full sm:w-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

