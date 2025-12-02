/**
 * Configuration for new UI components
 */

// ============================================================================
// QUERY CONFIGURATION
// ============================================================================

export const QUERY_CONFIG = {
  // User profile queries
  USER_PROFILE: {
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  },

  // Trade room queries
  TRADE_ROOMS: {
    staleTime: 30000,
    refetchInterval: 60000,
    cacheTime: 300000,
  },

  // Portfolio queries
  PORTFOLIO: {
    staleTime: 30000,
    refetchInterval: 60000,
    cacheTime: 300000,
  },

  // Leaderboard queries
  LEADERBOARD: {
    staleTime: 30000,
    refetchInterval: 60000,
    cacheTime: 300000,
  },

  // Market data queries
  MARKET_DATA: {
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // 2 minutes
    cacheTime: 600000, // 10 minutes
  },

  // Stock search queries
  STOCK_SEARCH: {
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
  },
} as const;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  // Pagination
  ITEMS_PER_PAGE: 10,
  LEADERBOARD_ITEMS: 6,
  GAMES_PER_PAGE: 12,

  // Timeouts
  TOAST_DURATION: 3000, // 3 seconds
  MODAL_ANIMATION_DURATION: 200, // 200ms

  // Limits
  MAX_SEARCH_RESULTS: 10,
  MAX_HOLDINGS: 50,
  MAX_ORDERS: 100,

  // Thresholds
  MIN_ORDER_QUANTITY: 1,
  MAX_ORDER_QUANTITY: 10000,
  MIN_CASH_BALANCE: 0,
} as const;

// ============================================================================
// TRADE ROOM CONFIGURATION
// ============================================================================

export const TRADE_ROOM_CONFIG = {
  // Default values
  DEFAULT_STARTING_CASH: 100000,
  DEFAULT_MAX_PLAYERS: 10,
  DEFAULT_DURATION_HOURS: 24,

  // Constraints
  MIN_STARTING_CASH: 1000,
  MAX_STARTING_CASH: 1000000,
  MIN_MAX_PLAYERS: 2,
  MAX_MAX_PLAYERS: 100,
  MIN_DURATION_MINUTES: 5,
  MAX_DURATION_DAYS: 365,

  // Reward configuration
  REWARD_DISTRIBUTION: {
    FIRST_PLACE: 0.5, // 50%
    SECOND_PLACE: 0.3, // 30%
    THIRD_PLACE: 0.15, // 15%
    PARTICIPATION: 0.05, // 5%
  },

  // Types
  TYPES: [
    'Stock Trading',
    'Cryptocurrency',
    'Day Trading',
    'Long Term',
  ] as const,

  // States
  STATES: [
    'draft',
    'scheduled',
    'active',
    'completed',
    'archived',
  ] as const,
} as const;

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

export const VALIDATION_CONFIG = {
  // Email validation
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Username validation
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,

  // Password validation
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: false,

  // Trade room name validation
  ROOM_NAME_MIN_LENGTH: 3,
  ROOM_NAME_MAX_LENGTH: 100,

  // Stock symbol validation
  SYMBOL_REGEX: /^[A-Z]{1,5}$/,
  SYMBOL_MIN_LENGTH: 1,
  SYMBOL_MAX_LENGTH: 5,
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  // User endpoints
  USER_PROFILE: '/user/profile',
  USER_BY_ID: (id: number) => `/users/${id}`,

  // Trade room endpoints
  MY_TRADE_ROOMS: '/my/bull-pens',
  ALL_TRADE_ROOMS: '/bull-pens',
  TRADE_ROOM_DETAIL: (id: number) => `/bull-pens/${id}`,
  CREATE_TRADE_ROOM: '/bull-pens',
  JOIN_TRADE_ROOM: (id: number) => `/bull-pens/${id}/join`,
  LEAVE_TRADE_ROOM: (id: number) => `/bull-pens/${id}/leave`,

  // Portfolio endpoints
  PORTFOLIO: (bullPenId: number) => `/bull-pens/${bullPenId}/portfolio`,
  HOLDINGS: (bullPenId: number) => `/bull-pens/${bullPenId}/holdings`,

  // Leaderboard endpoints
  LEADERBOARD: (bullPenId: number) => `/bull-pens/${bullPenId}/leaderboard`,

  // Trading endpoints
  PLACE_ORDER: (bullPenId: number) => `/bull-pens/${bullPenId}/orders`,
  GET_ORDERS: (bullPenId: number) => `/bull-pens/${bullPenId}/orders`,

  // Market data endpoints
  STOCK_INFO: (symbol: string) => `/market-data/${symbol}`,
  STOCK_SEARCH: '/market-data/search',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  TRADE_ROOM_CREATED: 'Trade room created successfully!',
  TRADE_ROOM_JOINED: 'You have joined the trade room!',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;

