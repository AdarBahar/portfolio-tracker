import { useMemo } from 'react';
import GameCard from './GameCard';
import type { BullPen } from '@/hooks/useBullPens';

interface CurrentGamesProps {
  searchQuery: string;
  bullPens: BullPen[];
  isLoading: boolean;
}

export default function CurrentGames({
  searchQuery,
  bullPens,
  isLoading,
}: CurrentGamesProps) {
  const filteredGames = useMemo(() => {
    if (!searchQuery) return bullPens;
    return bullPens.filter(
      (game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  }, [bullPens, searchQuery]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">My Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-muted/30 rounded-2xl border border-border animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          My Games ({filteredGames.length})
        </h2>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border">
          <p className="text-muted-foreground mb-4">
            {bullPens.length === 0
              ? "You haven't joined any games yet"
              : 'No games match your search'}
          </p>
          {bullPens.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Browse available games below to get started
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              bullPen={game}
              isJoined={true}
              onView={() => console.log('View game:', game.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

