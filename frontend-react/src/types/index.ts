/**
 * Core type definitions for Portfolio Tracker
 * Used across all components and API integrations
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  stars: number;
  totalEarnings: number;
  globalRank?: number;
  winRate?: number;
  totalRooms?: number;
  totalWins?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  portfolio: {
    totalValue: number;
    invested: number;
    cash: number;
    dayPnL: number;
    dayPnLPercent: number;
  };
}

// ============================================================================
// TRADE ROOM TYPES
// ============================================================================

export interface TradeRoom {
  id: number;
  name: string;
  description?: string;
  type: 'Stock Trading' | 'Cryptocurrency' | 'Day Trading' | 'Long Term';
  state: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
  status: 'active' | 'waiting' | 'ended';
  startTime: string;
  durationSec: number;
  maxPlayers: number;
  startingCash: number;
  allowFractional: boolean;
  approvalRequired: boolean;
  inviteCode?: string;
  hostUserId: number;
  currentPlayers?: number;
  rewardStars?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTradeRoomInput {
  name: string;
  description?: string;
  type: string;
  startTime: string;
  durationSec: number;
  maxPlayers: number;
  startingCash: number;
  allowFractional?: boolean;
  approvalRequired?: boolean;
  rewardStars?: number;
}

// ============================================================================
// PORTFOLIO & HOLDINGS TYPES
// ============================================================================

export interface Holding {
  id: number;
  symbol: string;
  name: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  change: number;
  changePercent: number;
  sector?: string;
  assetClass?: string;
}

export interface Portfolio {
  id: number;
  userId: number;
  bullPenId: number;
  totalValue: number;
  invested: number;
  cash: number;
  dayPnL: number;
  dayPnLPercent: number;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  avatar?: string;
  portfolioValue: number;
  change: number;
  changePercent: number;
  stars?: number;
  isCurrentUser?: boolean;
}

export interface Leaderboard {
  bullPenId: number;
  entries: LeaderboardEntry[];
  updatedAt: string;
}

// ============================================================================
// ORDER & TRADING TYPES
// ============================================================================

export interface Order {
  id: number;
  bullPenId: number;
  userId: number;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalValue: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price?: number;
}

// ============================================================================
// MARKET DATA TYPES
// ============================================================================

export interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: string;
  pe?: number;
  dividend?: number;
  description?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

