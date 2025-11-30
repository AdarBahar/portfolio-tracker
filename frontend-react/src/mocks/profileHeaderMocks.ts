/**
 * Mock data for Profile Header development and testing
 */

import type { UserProfile, UserStats, EmptyStateData } from '@/types/profileHeader';

/**
 * Mock experienced user profile
 */
export const mockExperiencedUserProfile: UserProfile = {
  id: '1',
  name: 'Adar Bahar',
  email: 'adar@bahar.co.il',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adar',
  username: 'adarb',
  tier: 'Gold',
  lifetimeStars: 156,
  netProfit: 125430,
  isNewUser: false,
};

/**
 * Mock new user profile
 */
export const mockNewUserProfile: UserProfile = {
  id: '2',
  name: 'New Trader',
  email: 'newtrader@example.com',
  picture: undefined,
  username: 'newtrader',
  tier: 'Unranked',
  lifetimeStars: 0,
  netProfit: 0,
  isNewUser: true,
};

/**
 * Mock experienced user stats
 */
export const mockExperiencedUserStats: UserStats = {
  globalRank: 156,
  winRate: 59.8,
  totalRoomsPlayed: 87,
  totalWins: 52,
  winStreak: 5,
  activityStreak: 12,
  seasonRank: 42,
  seasonStars: 45,
  seasonScore: 2850,
};

/**
 * Mock new user stats
 */
export const mockNewUserStats: UserStats = {
  globalRank: null,
  winRate: 0,
  totalRoomsPlayed: 0,
  totalWins: 0,
  winStreak: 0,
  activityStreak: 0,
  seasonRank: null,
  seasonStars: 0,
  seasonScore: 0,
};

/**
 * Mock empty state data
 */
export const mockEmptyStateData: EmptyStateData = {
  title: 'Welcome to Fantasy Broker!',
  description: 'Your stats will appear here after your first room.',
  incentive: '⭐ Earn 10 stars when you join your first room',
  calloutMessage: 'Join your first room to start earning stars and ranking points.',
};

/**
 * Mock user with negative profit
 */
export const mockUserWithLoss: UserProfile = {
  id: '3',
  name: 'Learning Trader',
  email: 'learning@example.com',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Learning',
  username: 'learner',
  tier: 'Silver',
  lifetimeStars: 45,
  netProfit: -2130,
  isNewUser: false,
};

/**
 * Mock user with high profit
 */
export const mockHighProfitUser: UserProfile = {
  id: '4',
  name: 'Pro Trader',
  email: 'pro@example.com',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro',
  username: 'protrader',
  tier: 'Platinum',
  lifetimeStars: 500,
  netProfit: 1250000,
  isNewUser: false,
};

/**
 * Mock high-performing user stats
 */
export const mockHighPerformanceStats: UserStats = {
  globalRank: 1,
  winRate: 87.5,
  totalRoomsPlayed: 240,
  totalWins: 210,
  winStreak: 15,
  activityStreak: 45,
  seasonRank: 1,
  seasonStars: 250,
  seasonScore: 15000,
};

