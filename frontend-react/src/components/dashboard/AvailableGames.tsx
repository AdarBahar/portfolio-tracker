import { useMemo } from 'react';
import GameCard from './GameCard';
import { useJoinBullPen } from '@/hooks/useBullPens';
import type { BullPen } from '@/hooks/useBullPens';

interface AvailableGamesProps {
  searchQuery: string;
  bullPens: BullPen[];
  isLoading: boolean;
}

export default function AvailableGames({
  searchQuery,
  bullPens,
  isLoading,
}: AvailableGamesProps) {
  const joinMutation = useJoinBullPen();

  const filteredGames = useMemo(() => {
    if (!searchQuery) return bullPens;
    return bullPens.filter(
      (game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  }, [bullPens, searchQuery]);

  const handleJoin = async (bullPenId: number) => {
    try {
      await joinMutation.mutateAsync(bullPenId);
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
          Available Games ({filteredGames.length})
        </h2>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border">
          <p className="text-muted-foreground mb-4">
            {bullPens.length === 0
              ? 'No games available right now'
              : 'No games match your search'}
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later for new trading opportunities
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              bullPen={game}
              isJoined={false}
              onJoin={() => handleJoin(game.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

