/**
 * ProfileHeaderSkeleton Component
 * Displays a skeleton loader while profile data is being fetched
 */
export default function ProfileHeaderSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
      {/* Avatar and User Info Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
        {/* Avatar Skeleton */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 bg-muted rounded-full animate-pulse" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-muted rounded-full animate-pulse" />
        </div>

        {/* User Info Skeleton */}
        <div className="flex-1 space-y-3 w-full md:w-auto">
          <div className="h-7 bg-muted rounded w-48 animate-pulse" />
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          <div className="h-5 bg-muted rounded w-40 animate-pulse" />
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="h-10 bg-muted rounded px-4 flex-1 md:flex-none animate-pulse" />
          <div className="h-10 bg-muted rounded px-4 flex-1 md:flex-none animate-pulse" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-muted/50 border border-border rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-20 mb-2" />
            <div className="h-6 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

