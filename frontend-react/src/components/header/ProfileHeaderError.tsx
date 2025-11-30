import { AlertCircle, RotateCcw } from 'lucide-react';

interface ProfileHeaderErrorProps {
  error?: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * ProfileHeaderError Component
 * Displays error state with retry option
 */
export default function ProfileHeaderError({
  error,
  onRetry,
  isRetrying = false,
}: ProfileHeaderErrorProps) {
  const errorMessage =
    error?.message || 'Failed to load your profile. Please try again.';

  return (
    <div className="bg-card border border-danger/20 rounded-lg p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Error Icon */}
        <div className="flex-shrink-0 mt-1">
          <AlertCircle className="w-6 h-6 text-danger" />
        </div>

        {/* Error Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to Load Profile
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>

          {/* Troubleshooting Tips */}
          <div className="bg-muted/50 rounded p-3 mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Try these steps:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
              <li>Try again in a few moments</li>
            </ul>
          </div>

          {/* Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

