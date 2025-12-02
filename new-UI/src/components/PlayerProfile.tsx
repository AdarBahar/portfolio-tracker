import { Trophy, TrendingUp, Target, Award } from 'lucide-react';

export function PlayerProfile() {
  const playerData = {
    name: 'Alex Morgan',
    username: '@alexm_trader',
    level: 42,
    globalRank: 156,
    totalGames: 87,
    wins: 52,
    winRate: 59.8,
    totalEarnings: 125430,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'
  };

  const stats = [
    { label: 'Global Rank', value: `#${playerData.globalRank}`, icon: Trophy, color: 'text-warning' },
    { label: 'Win Rate', value: `${playerData.winRate}%`, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Rooms', value: playerData.totalGames, icon: Target, color: 'text-brand-blue' },
    { label: 'Total Wins', value: playerData.wins, icon: Award, color: 'text-brand-purple' }
  ];

  return (
    <div className="gradient-card backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8 border border-border shadow-lg">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={playerData.avatar}
              alt={playerData.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-brand-blue/30"
            />
            <div className="absolute -bottom-2 -right-2 gradient-primary rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg">
              <span className="text-xs sm:text-sm text-white">{playerData.level}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground mb-1 truncate">{playerData.name}</h2>
            <p className="text-muted-foreground mb-2 text-sm sm:text-base truncate">{playerData.username}</p>
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">${playerData.totalEarnings.toLocaleString()} earned</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border/50 hover:border-brand-blue/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${stat.color}`} />
                  <span className="text-muted-foreground text-xs sm:text-sm truncate">{stat.label}</span>
                </div>
                <p className={`${stat.color} text-lg sm:text-xl truncate`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}