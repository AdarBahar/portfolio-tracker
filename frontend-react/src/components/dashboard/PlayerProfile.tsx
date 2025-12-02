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
      color: 'text-[#F59E0B]',
    },
    {
      label: 'Win Rate',
      value: `${(stats.winRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-[#16A34A]',
    },
    {
      label: 'Total Rooms',
      value: stats.totalRoomsPlayed || 0,
      icon: Target,
      color: 'text-[#0BA5EC]',
    },
    {
      label: 'Total Wins',
      value: stats.totalWins || 0,
      icon: Award,
      color: 'text-[#7C3AED]',
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
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-[#0BA5EC]/30"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#0BA5EC] to-[#7C3AED] flex items-center justify-center ring-4 ring-[#0BA5EC]/30">
                <span className="text-2xl text-white font-bold">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#0BA5EC] to-[#7C3AED] rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg">
              <span className="text-xs sm:text-sm text-white font-bold">1</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-foreground mb-1 truncate font-semibold text-base">{profile.name}</h2>
            <p className="text-muted-foreground mb-2 text-sm sm:text-base truncate">
              @{profile.username || profile.name?.toLowerCase().replace(/\s+/g, '_')}
            </p>
            <div className="flex items-center gap-1 text-[#16A34A]">
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
                className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border/50 hover:border-[#0BA5EC]/50 transition-colors"
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

