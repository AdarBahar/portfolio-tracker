import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from './ProfileHeader';
import ProfileHeaderSkeleton from './ProfileHeaderSkeleton';
import ProfileHeaderError from './ProfileHeaderError';

/**
 * ProfileHeaderContainer Component
 * Wrapper that fetches user data from API and passes to ProfileHeader
 * Handles loading, error, and retry states
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
  const { data, isLoading, error, refetch } = useUserProfile();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } finally {
      setIsRetrying(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return <ProfileHeaderSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <ProfileHeaderError
        error={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  // Show component with data
  if (!data) {
    return (
      <ProfileHeaderError
        error={new Error('No profile data available')}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
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

