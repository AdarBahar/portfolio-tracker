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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
          <div className="w-6 h-6 bg-[#7C3AED] rounded-lg"></div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">My Games</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-muted/30 rounded-xl border border-border animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <svg className="w-5 h-5 sm:w-6 h-6 text-[#7C3AED]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          My Games
        </h2>
        <span className="px-2 sm:px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full text-xs sm:text-sm font-medium">
          {filteredGames.length}
        </span>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

