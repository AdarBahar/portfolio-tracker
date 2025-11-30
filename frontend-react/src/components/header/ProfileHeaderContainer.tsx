import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from './ProfileHeader';

/**
 * ProfileHeaderContainer Component
 * Wrapper that fetches user data from API and passes to ProfileHeader
 * Handles loading and error states
 */
export default function ProfileHeaderContainer({
  onJoinRoom,
  onCreateRoom,
  onAvatarUpload,
}: {
  onJoinRoom?: () => void;
  onCreateRoom?: () => void;
  onAvatarUpload?: (file: File) => Promise<void>;
}) {
  const { data, isLoading, error } = useUserProfile();

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/20 rounded-lg p-6 text-center">
        <p className="text-danger font-medium">
          Failed to load profile. Please try again.
        </p>
      </div>
    );
  }

  // Show component with data
  if (!data) {
    return (
      <div className="bg-danger/10 border border-danger/20 rounded-lg p-6 text-center">
        <p className="text-danger font-medium">No profile data available</p>
      </div>
    );
  }

  return (
    <ProfileHeader
      userProfile={data.profile}
      userStats={data.stats}
      isLoading={false}
      error={null}
      onJoinRoom={onJoinRoom}
      onCreateRoom={onCreateRoom}
      onAvatarUpload={onAvatarUpload}
    />
  );
}

