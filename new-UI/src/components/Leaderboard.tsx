import { Trophy, TrendingUp, Medal, Star } from 'lucide-react';

interface LeaderboardProps {
  tradeRoom: any;
}

export function Leaderboard({ tradeRoom }: LeaderboardProps) {
  const players = [
    {
      rank: 1,
      name: 'Sarah Chen',
      username: '@sarahc_trades',
      portfolio: 28450,
      change: 14.2,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    {
      rank: 2,
      name: 'Mike Johnson',
      username: '@mikej_trader',
      portfolio: 26890,
      change: 12.4,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      rank: 3,
      name: 'Alex Morgan',
      username: '@alexm_trader',
      portfolio: 24780,
      change: 10.8,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      isCurrentUser: true
    },
    {
      rank: 4,
      name: 'Emma Wilson',
      username: '@emmaw_invest',
      portfolio: 23120,
      change: 8.5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    {
      rank: 5,
      name: 'David Lee',
      username: '@davidl_stocks',
      portfolio: 21670,
      change: 6.7,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    {
      rank: 6,
      name: 'Lisa Anderson',
      username: '@lisaa_trade',
      portfolio: 20340,
      change: 4.2,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    }
  ];

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-warning';
    if (rank === 2) return 'text-muted-foreground';
    if (rank === 3) return 'text-warning';
    return 'text-muted-foreground';
  };

  const rewards = [
    { place: '1st', stars: 500, color: 'text-warning', bgColor: 'bg-warning/20' },
    { place: '2nd', stars: 300, color: 'text-muted-foreground', bgColor: 'bg-muted/40' },
    { place: '3rd', stars: 150, color: 'text-warning/70', bgColor: 'bg-warning/10' }
  ];

  return (
    <div className="gradient-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-warning/20 rounded-lg">
          <Trophy className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h2 className="text-foreground mb-1">Leaderboard</h2>
          <p className="text-muted-foreground text-sm">Top performers in this room</p>
        </div>
      </div>

      {/* Rewards Display */}
      <div className="mb-6 p-4 bg-muted/20 rounded-lg border border-border/30">
        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-3">Finish Rewards</p>
        <div className="flex justify-between gap-2">
          {rewards.map((reward, index) => (
            <div 
              key={index}
              className={`flex-1 ${reward.bgColor} rounded-lg p-3 text-center border border-border/30`}
            >
              <Medal className={`w-4 h-4 ${reward.color} mx-auto mb-1`} />
              <p className="text-foreground text-xs mb-1">{reward.place}</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-foreground text-sm">{reward.stars}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {players.map((player, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              player.isCurrentUser 
                ? 'gradient-primary bg-opacity-10 border-2 border-brand-blue shadow-lg' 
                : 'bg-muted/20 hover:bg-muted/40 border border-border/30'
            }`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8">
              {player.rank <= 3 ? (
                <Medal className={`w-5 h-5 ${getMedalColor(player.rank)}`} />
              ) : (
                <span className="text-muted-foreground text-sm">#{player.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <img 
              src={player.avatar} 
              alt={player.name}
              className={`w-10 h-10 rounded-full object-cover ${player.isCurrentUser ? 'ring-2 ring-brand-blue' : ''}`}
            />

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <p className={`truncate ${player.isCurrentUser ? 'text-foreground' : 'text-foreground'}`}>
                {player.name}
                {player.isCurrentUser && <span className="text-brand-blue ml-2 text-xs">(You)</span>}
              </p>
              <p className="text-muted-foreground text-xs truncate">{player.username}</p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-foreground text-sm">${player.portfolio.toLocaleString()}</p>
              <div className="flex items-center justify-end gap-1 text-success text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>+{player.change}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Full Leaderboard Button */}
      <button className="w-full mt-4 py-2 bg-muted hover:bg-border text-foreground rounded-lg transition-colors text-sm">
        View Full Leaderboard
      </button>
    </div>
  );
}