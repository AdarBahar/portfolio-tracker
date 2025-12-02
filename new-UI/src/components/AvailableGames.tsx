import { GameCard } from './GameCard';
import { PlusCircle } from 'lucide-react';

interface AvailableGamesProps {
  searchQuery: string;
}

export function AvailableGames({ searchQuery }: AvailableGamesProps) {
  const availableGames = [
    {
      id: 4,
      name: 'Emerging Markets',
      type: 'Stock Trading',
      players: 5,
      maxPlayers: 20,
      rewardStars: 3000,
      entryFee: 50,
      startDate: '2025-11-29',
      difficulty: 'Intermediate'
    },
    {
      id: 5,
      name: 'DeFi Challenge',
      type: 'Cryptocurrency',
      players: 45,
      maxPlayers: 100,
      rewardStars: 50000,
      entryFee: 500,
      startDate: '2025-12-01',
      difficulty: 'Expert'
    },
    {
      id: 6,
      name: 'Penny Stocks',
      type: 'Stock Trading',
      players: 120,
      maxPlayers: 200,
      rewardStars: 1000,
      entryFee: 10,
      startDate: '2025-11-27',
      difficulty: 'Beginner'
    },
    {
      id: 7,
      name: 'Forex Trader',
      type: 'Forex Trading',
      players: 8,
      maxPlayers: 15,
      rewardStars: 7500,
      entryFee: 200,
      startDate: '2025-12-02',
      difficulty: 'Advanced'
    },
    {
      id: 8,
      name: 'Options Master',
      type: 'Options Trading',
      players: 78,
      maxPlayers: 150,
      rewardStars: 25000,
      entryFee: 250,
      startDate: '2025-12-03',
      difficulty: 'Expert'
    },
    {
      id: 9,
      name: 'Weekend Warriors',
      type: 'Multi-Asset',
      players: 32,
      maxPlayers: 50,
      rewardStars: 1500,
      entryFee: 25,
      startDate: '2025-11-28',
      difficulty: 'Beginner'
    }
  ];

  const filteredGames = availableGames.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success flex-shrink-0" />
        <h2 className="text-foreground text-lg sm:text-xl">Available Trade Rooms to Join</h2>
        <span className="px-2 sm:px-3 py-1 bg-success/10 text-success rounded-full text-xs sm:text-sm">
          {filteredGames.length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} isActive={false} />
        ))}
      </div>
    </div>
  );
}