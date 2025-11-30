import { Trophy, Target, Award, TrendingUp } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';
import StatCard from './StatCard';
import StarBadge from './StarBadge';
import ProfitIndicator from './ProfitIndicator';
import type { ProfileHeaderProps } from '@/types/profileHeader';

/**
 * ProfileHeader Component
 * Main dashboard header showing user identity, stats, and actions
 * Features:
 * - Horizontal layout (Avatar + Info | Stats | Actions)
 * - Responsive stacking on mobile
 * - Full light/dark mode support
 * - Loading and error states
 * - Empty state for new users
 */
export default function ProfileHeader({
  userProfile,
  userStats,
  isLoading = false,
  error = null,
  onJoinRoom,
  onCreateRoom,
  onAvatarUpload,
}: ProfileHeaderProps) {
  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/20 rounded-lg p-6 text-center">
        <p className="text-danger font-medium">{error}</p>
      </div>
    );
  }

  const isNewUser = userProfile.isNewUser;

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
      {/* Main Container - Horizontal Layout */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        {/* Left: Avatar + User Info */}
        <div className="flex items-start gap-4 flex-shrink-0">
          <div className="relative">
            <ProfileAvatar
              src={userProfile.picture}
              size="lg"
              name={userProfile.name}
              editable={true}
              onUpload={onAvatarUpload}
              tier={userProfile.tier}
            />
            {/* Star Badge in corner */}
            <div className="absolute -bottom-2 -right-2">
              <StarBadge
                value={userProfile.lifetimeStars}
                size="sm"
                colorScheme="purple"
                animated={true}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-foreground">
              {userProfile.name}
            </h2>
            {userProfile.username && (
              <p className="text-sm text-muted-foreground">
                @{userProfile.username}
              </p>
            )}
            {/* Profit Indicator */}
            <div className="mt-1">
              <ProfitIndicator
                amount={userProfile.netProfit}
                currency="USD"
                animated={true}
                showSparkle={userProfile.netProfit > 0}
              />
            </div>
          </div>
        </div>

        {/* Center: Stats Block - 4 cards in a row */}
        <div className="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-center md:justify-start">
          <StatCard
            icon={Trophy}
            label="Global Rank"
            value={userStats.globalRank ? `#${userStats.globalRank}` : '—'}
            color={userStats.globalRank ? 'default' : 'default'}
            isLoading={isLoading}
          />
          <StatCard
            icon={TrendingUp}
            label="Win Rate"
            value={userStats.winRate ? `${userStats.winRate.toFixed(1)}%` : '—'}
            color={userStats.winRate > 50 ? 'success' : 'default'}
            isLoading={isLoading}
          />
          <StatCard
            icon={Target}
            label="Total Rooms"
            value={userStats.totalRoomsPlayed}
            isLoading={isLoading}
          />
          <StatCard
            icon={Award}
            label="Total Wins"
            value={userStats.totalWins}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Actions Block */}
        <div className="flex gap-3 flex-shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={onJoinRoom}
            className={`
              px-6 py-2.5
              bg-secondary
              hover:bg-secondary/80
              text-foreground
              font-semibold
              rounded-lg
              transition-all duration-200
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isLoading}
          >
            Join Room
          </button>

          <button
            onClick={onCreateRoom}
            className={`
              px-6 py-2.5
              bg-gradient-to-r from-brand-purple to-brand-blue
              hover:opacity-90
              text-white font-semibold
              rounded-lg
              transition-all duration-200
              shadow-md
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              ${isNewUser ? 'opacity-50' : ''}
            `}
            style={{
              backgroundImage: 'linear-gradient(to right, hsl(262 83% 58%), hsl(199 89% 48%))',
            }}
            disabled={isLoading || isNewUser}
            title={isNewUser ? 'Join a room first to create one' : ''}
          >
            Create Room
          </button>
        </div>
      </div>

      {/* Empty State Message */}
      {isNewUser && (
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
          <p className="text-sm text-foreground font-medium mb-2">
            Welcome! Your stats will appear here after your first room.
          </p>
          <p className="text-xs text-muted-foreground">
            ⭐ Earn 10 stars when you join your first room
          </p>
        </div>
      )}
    </div>
  );
}

