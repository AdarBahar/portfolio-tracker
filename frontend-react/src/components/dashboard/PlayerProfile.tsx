import { Trophy, TrendingUp, Target, Award } from 'lucide-react';
import type { UserProfile, UserStats } from '@/types/profileHeader';

interface PlayerProfileProps {
  profile: UserProfile;
  stats: UserStats;
}

export default function PlayerProfile({ profile, stats }: PlayerProfileProps) {
  const statItems = [
    {
      label: 'Global Rank',
      value: `#${stats.globalRank || 'N/A'}`,
      icon: Trophy,
      color: 'text-yellow-500',
    },
    {
      label: 'Win Rate',
      value: `${(stats.winRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: 'Total Rooms',
      value: stats.totalRoomsPlayed || 0,
      icon: Target,
      color: 'text-blue-500',
    },
    {
      label: 'Total Wins',
      value: stats.totalWins || 0,
      icon: Award,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="gradient-card backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8 border border-border shadow-lg">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            {profile.picture ? (
              <img
                src={profile.picture}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-blue-500/30"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center ring-4 ring-blue-500/30">
                <span className="text-2xl text-white font-bold">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 gradient-primary rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg">
              <span className="text-xs sm:text-sm text-white font-bold">1</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-foreground mb-1 truncate font-semibold">{profile.name}</h2>
            <p className="text-muted-foreground mb-2 text-sm sm:text-base truncate">
              @{profile.username || profile.name?.toLowerCase().replace(/\s+/g, '_')}
            </p>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">
                ${(stats.totalRoomsPlayed * 1000).toLocaleString()} earned
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border/50 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${stat.color}`} />
                  <span className="text-muted-foreground text-xs sm:text-sm truncate">
                    {stat.label}
                  </span>
                </div>
                <p className={`${stat.color} text-lg sm:text-xl truncate font-semibold`}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

