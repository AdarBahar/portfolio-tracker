import { GameCard } from './GameCard';
import { Gamepad2 } from 'lucide-react';

interface CurrentGamesProps {
  searchQuery: string;
  onSelectRoom: (room: any) => void;
  userCreatedRooms?: any[];
}

export function CurrentGames({ searchQuery, onSelectRoom, userCreatedRooms = [] }: CurrentGamesProps) {
  const currentGames = [
    {
      id: 1,
      name: 'Tech Stock Challenge',
      type: 'Stock Trading',
      players: 12,
      maxPlayers: 12,
      rewardStars: 5000,
      position: 3,
      endDate: '2025-11-30',
      status: 'ending-soon',
      portfolio: 125000
    },
    {
      id: 2,
      name: 'Crypto Masters',
      type: 'Cryptocurrency',
      players: 8,
      maxPlayers: 10,
      rewardStars: 10000,
      position: 1,
      endDate: '2025-12-05',
      status: 'active',
      portfolio: 189000
    },
    {
      id: 3,
      name: 'Quick Trader',
      type: 'Day Trading',
      players: 50,
      maxPlayers: 50,
      rewardStars: 2500,
      position: 15,
      endDate: '2025-11-26',
      status: 'active',
      portfolio: 98500
    }
  ];

  // Convert user created rooms to the format expected by GameCard
  const formattedUserRooms = userCreatedRooms.map(room => ({
    id: room.id,
    name: room.name,
    type: room.type,
    players: room.currentPlayers,
    maxPlayers: room.maxPlayers,
    rewardStars: room.rewardStars,
    position: 1, // Creator starts at position 1
    endDate: room.endDate,
    status: room.status.toLowerCase(),
    portfolio: room.startingBalance,
    timeLeft: room.timeLeft,
    isCreator: true,
    difficulty: room.difficulty,
    entryFee: room.entryFee
  }));

  // Combine user created rooms with existing games
  const allGames = [...formattedUserRooms, ...currentGames];

  const filteredGames = allGames.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple flex-shrink-0" />
        <h2 className="text-foreground text-lg sm:text-xl">Your Active Trade Rooms</h2>
        <span className="px-2 sm:px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-xs sm:text-sm">
          {filteredGames.length}
        </span>
        {userCreatedRooms.length > 0 && (
          <span className="px-2 sm:px-3 py-1 bg-success/10 text-success rounded-full text-xs sm:text-sm">
            {userCreatedRooms.length} Created by You
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} isActive={true} onSelect={onSelectRoom} />
        ))}
      </div>
    </div>
  );
}