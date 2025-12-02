import type { ReactNode } from 'react';

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'bordered';
  spacing?: 'compact' | 'normal' | 'spacious';
}

/**
 * PageSection Component
 * 
 * Reusable section component for organizing page content with consistent styling.
 * Provides different variants for visual hierarchy and spacing options.
 * 
 * @example
 * <PageSection title="Holdings" variant="default" spacing="normal">
 *   <HoldingsTable holdings={holdings} />
 * </PageSection>
 */
export default function PageSection({
  title,
  description,
  children,
  className = '',
  variant = 'default',
  spacing = 'normal',
}: PageSectionProps) {
  const variantClasses = {
    default: 'gradient-card backdrop-blur-sm border border-border shadow-lg',
    muted: 'bg-muted/20 border border-border/30',
    bordered: 'border-2 border-border/50',
  };

  const spacingClasses = {
    compact: 'p-3 sm:p-4',
    normal: 'p-4 sm:p-6',
    spacious: 'p-6 sm:p-8',
  };

  return (
    <section className={`rounded-2xl ${variantClasses[variant]} ${spacingClasses[spacing]} mb-6 ${className}`}>
      {(title || description) && (
        <div className="mb-4 sm:mb-6">
          {title && (
            <h2 className="text-foreground text-lg sm:text-xl font-semibold mb-1">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-sm sm:text-base">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

