/**
 * Profile Header Types
 * Defines all TypeScript interfaces for the Profile Header component and sub-components
 */

/**
 * User profile data for the header
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  username?: string;
  tier?: string; // e.g., "Silver", "Gold", "Platinum"
  lifetimeStars: number;
  netProfit: number; // Lifetime P&L
  isNewUser: boolean; // True if user has no rooms played
}

/**
 * User statistics for the stats block
 */
export interface UserStats {
  globalRank: number | null; // null if unranked
  winRate: number; // 0-100 percentage
  totalRoomsPlayed: number;
  totalWins: number;
  winStreak: number;
  activityStreak: number;
  seasonRank?: number | null;
  seasonStars?: number;
  seasonScore?: number;
}

/**
 * Stat card data
 */
export interface StatCardData {
  icon: string; // Icon name from lucide-react
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'none';
  trendValue?: number; // e.g., "+12 this week"
  color?: 'default' | 'success' | 'danger' | 'warning';
  isLoading?: boolean;
}

/**
 * Star badge data
 */
export interface StarBadgeData {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'purple' | 'blue' | 'gold';
  animated?: boolean;
  previousValue?: number; // For animation trigger
}

/**
 * Profit indicator data
 */
export interface ProfitIndicatorData {
  amount: number;
  currency?: string; // Default: "USD"
  animated?: boolean;
  previousAmount?: number; // For animation trigger
  showSparkle?: boolean;
}

/**
 * Avatar component props
 */
export interface AvatarProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg'; // sm: 64px, md: 80px, lg: 92px
  name: string;
  editable?: boolean;
  onUpload?: (file: File) => Promise<void>;
  isLoading?: boolean;
  tier?: string;
}

/**
 * Profile header component props
 */
export interface ProfileHeaderProps {
  userProfile: UserProfile;
  userStats: UserStats;
  isLoading?: boolean;
  error?: string | null;
  onJoinRoom?: () => void;
  onCreateRoom?: () => void;
  onViewStats?: () => void;
  onAvatarUpload?: (file: File) => Promise<void>;
}

/**
 * Empty state data for new users
 */
export interface EmptyStateData {
  title: string;
  description: string;
  incentive: string;
  calloutMessage: string;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  rankMovementDuration: number; // ms, default: 250
  earningsCounterDuration: number; // ms, default: 500
  starAnimationDuration: number; // ms, default: 350
  streakGlowPulseDuration: number; // ms, default: 2000
  easing: string; // CSS easing function
}

/**
 * Image upload constraints
 */
export interface ImageUploadConstraints {
  maxSizeMB: number; // Default: 5
  allowedFormats: string[]; // Default: ['jpg', 'jpeg', 'png', 'webp']
  recommendedSize: number; // Default: 512 (512x512)
}

/**
 * Profile header state
 */
export interface ProfileHeaderState {
  userProfile: UserProfile | null;
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  isUploadingAvatar: boolean;
}

