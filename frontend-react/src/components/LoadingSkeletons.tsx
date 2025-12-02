/**
 * Loading skeleton components for new UI
 */

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        <div className="h-3 bg-muted rounded w-24 animate-pulse" />
      </div>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="p-4 bg-card rounded-lg border border-border space-y-3">
      <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
        <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
      </div>
      <div className="h-8 bg-muted rounded w-full animate-pulse" />
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-card rounded-lg border border-border">
            <div className="h-4 bg-muted rounded w-20 mb-2 animate-pulse" />
            <div className="h-6 bg-muted rounded w-24 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 bg-muted rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
        >
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-3 bg-muted rounded w-16 animate-pulse" />
          </div>
          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function HoldingsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border"
        >
          <div className="w-10 h-10 bg-muted rounded animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded w-16 animate-pulse" />
            <div className="h-3 bg-muted rounded w-12 animate-pulse" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-4 bg-muted rounded w-20 animate-pulse" />
            <div className="h-3 bg-muted rounded w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TradeRoomDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PortfolioSkeleton />
        </div>
        <div>
          <LeaderboardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-10 bg-muted rounded animate-pulse"
        />
      ))}
    </div>
  );
}

