/**
 * Utility functions for new UI components
 */

import type { TradeRoom, LeaderboardEntry } from '@/types';

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value >= 0 ? '+' : '')}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toFixed(0);
}

/**
 * Calculate time remaining for a trade room
 */
export function calculateTimeRemaining(
  startTime: string,
  durationSec: number
): {
  remaining: number;
  formatted: string;
  isEnded: boolean;
} {
  const start = new Date(startTime).getTime();
  const end = start + durationSec * 1000;
  const now = Date.now();

  const remaining = Math.max(0, end - now);
  const isEnded = remaining === 0;

  // Format as "2d 3h 45m" or "45m 30s"
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  if (hours > 0) formatted += `${hours}h `;
  if (minutes > 0) formatted += `${minutes}m `;
  if (seconds > 0 && days === 0 && hours === 0) formatted += `${seconds}s`;

  return {
    remaining,
    formatted: formatted.trim() || '0s',
    isEnded,
  };
}

/**
 * Get trade room status badge color
 */
export function getTradeRoomStatusColor(
  state: TradeRoom['state']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (state) {
    case 'active':
      return 'default';
    case 'scheduled':
      return 'secondary';
    case 'completed':
      return 'outline';
    case 'archived':
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Get leaderboard medal emoji for rank
 */
export function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

/**
 * Get reward stars for leaderboard position
 */
export function getRewardStars(rank: number, totalRewardStars: number): number {
  if (rank === 1) return Math.floor(totalRewardStars * 0.5); // 50%
  if (rank === 2) return Math.floor(totalRewardStars * 0.3); // 30%
  if (rank === 3) return Math.floor(totalRewardStars * 0.15); // 15%
  return 0;
}

/**
 * Sort leaderboard entries by rank
 */
export function sortLeaderboard(
  entries: LeaderboardEntry[]
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => a.rank - b.rank);
}

/**
 * Filter trade rooms by search query
 */
export function filterTradeRooms(
  rooms: TradeRoom[],
  query: string
): TradeRoom[] {
  if (!query.trim()) return rooms;

  const lowerQuery = query.toLowerCase();
  return rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(lowerQuery) ||
      room.description?.toLowerCase().includes(lowerQuery) ||
      room.type.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get color for percentage change
 */
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}

/**
 * Get background color for percentage change
 */
export function getChangeBgColor(change: number): string {
  if (change > 0) return 'bg-green-50 dark:bg-green-950';
  if (change < 0) return 'bg-red-50 dark:bg-red-950';
  return 'bg-gray-50 dark:bg-gray-900';
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format date to short format (e.g., "Jan 15")
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

