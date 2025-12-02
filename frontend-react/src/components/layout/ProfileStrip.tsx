import type { ReactNode } from 'react';

interface ProfileStripProps {
  avatar?: string;
  avatarFallback?: string;
  name: string;
  username?: string;
  subtitle?: string;
  badge?: ReactNode;
  stats?: ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * ProfileStrip Component
 * 
 * Reusable profile display component showing avatar, name, username, and optional stats.
 * Follows the design guide with responsive layout and consistent styling.
 * 
 * @example
 * <ProfileStrip
 *   avatar={profilePicture}
 *   avatarFallback="JD"
 *   name="John Doe"
 *   username="johndoe"
 *   subtitle="$1,000 earned"
 *   stats={<div>Stats here</div>}
 * />
 */
export default function ProfileStrip({
  avatar,
  avatarFallback = '?',
  name,
  username,
  subtitle,
  badge,
  stats,
  className = '',
  size = 'medium',
}: ProfileStripProps) {
  const avatarSizeClasses = {
    small: 'w-12 h-12 sm:w-14 sm:h-14',
    medium: 'w-16 h-16 sm:w-20 sm:h-20',
    large: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const textSizeClasses = {
    small: { name: 'text-sm', username: 'text-xs', subtitle: 'text-xs' },
    medium: { name: 'text-base', username: 'text-sm', subtitle: 'text-sm' },
    large: { name: 'text-lg', username: 'text-base', subtitle: 'text-base' },
  };

  return (
    <div className={`flex flex-col md:flex-row gap-4 md:gap-6 ${className}`}>
      {/* Avatar and Basic Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className={`${avatarSizeClasses[size]} rounded-full object-cover ring-4 ring-[#0BA5EC]/30`}
            />
          ) : (
            <div className={`${avatarSizeClasses[size]} rounded-full bg-gradient-to-br from-[#0BA5EC] to-[#7C3AED] flex items-center justify-center ring-4 ring-[#0BA5EC]/30`}>
              <span className="text-lg sm:text-xl font-bold text-white">
                {avatarFallback}
              </span>
            </div>
          )}
          {badge && (
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#0BA5EC] to-[#7C3AED] rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg">
              {badge}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className={`text-foreground mb-1 truncate font-semibold ${textSizeClasses[size].name}`}>
            {name}
          </h2>
          {username && (
            <p className={`text-muted-foreground mb-1 truncate ${textSizeClasses[size].username}`}>
              @{username}
            </p>
          )}
          {subtitle && (
            <p className={`text-[#16A34A] truncate ${textSizeClasses[size].subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="flex-1">
          {stats}
        </div>
      )}
    </div>
  );
}

