import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * StagingBadge Component
 * 
 * Displays a prominent "STAGING" badge in the top toolbar when running in staging environment.
 * This helps developers and testers distinguish between staging and production environments.
 * 
 * The badge is only shown when:
 * - VITE_STAGING_MODE environment variable is set to 'true'
 * - VITE_ENVIRONMENT environment variable is set to 'staging'
 */
export const StagingBadge: React.FC = () => {
  const isStaging = import.meta.env.VITE_STAGING_MODE === 'true' || 
                    import.meta.env.VITE_ENVIRONMENT === 'staging';

  if (!isStaging) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md">
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
        Staging
      </span>
    </div>
  );
};

export default StagingBadge;

