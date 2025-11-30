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
 * - Three-column layout (Identity | Stats | Actions)
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
  onViewStats,
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
      {/* Main Container - Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Identity Block */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <ProfileAvatar
            src={userProfile.picture}
            size="lg"
            name={userProfile.name}
            editable={true}
            onUpload={onAvatarUpload}
            tier={userProfile.tier}
          />

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">
              {userProfile.name}
            </h2>
            {userProfile.username && (
              <p className="text-sm text-muted-foreground">
                @{userProfile.username}
              </p>
            )}
          </div>

          {/* Stars and Profit */}
          <div className="flex items-center gap-4 w-full justify-center md:justify-start">
            <StarBadge
              value={userProfile.lifetimeStars}
              size="md"
              colorScheme="purple"
              animated={true}
            />
            <ProfitIndicator
              amount={userProfile.netProfit}
              currency="USD"
              animated={true}
              showSparkle={userProfile.netProfit > 0}
            />
          </div>
        </div>

        {/* Center: Stats Block */}
        <div className="grid grid-cols-2 gap-4">
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
        <div className="flex flex-col gap-3 justify-center">
          <button
            onClick={onJoinRoom}
            className={`
              px-6 py-3
              bg-gradient-to-r from-brand-purple to-brand-blue
              hover:opacity-90
              text-white font-semibold
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
              px-6 py-3
              border border-border
              text-foreground
              hover:bg-secondary
              font-semibold
              rounded-lg
              transition-all duration-200
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              ${isNewUser ? 'opacity-50' : ''}
            `}
            disabled={isLoading || isNewUser}
            title={isNewUser ? 'Join a room first to create one' : ''}
          >
            Create Room
          </button>

          <button
            onClick={onViewStats}
            className={`
              px-6 py-2
              text-foreground
              hover:text-primary
              font-medium
              text-sm
              transition-colors duration-200
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isLoading}
          >
            View Full Stats →
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

