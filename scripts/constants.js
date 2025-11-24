/**
 * Application Constants
 * Centralized configuration and magic numbers
 */

// Price simulation constants
export const PRICE_SIMULATION = {
    INITIAL_FLUCTUATION_MIN: -0.05,  // -5%
    INITIAL_FLUCTUATION_MAX: 0.15,   // +15%
    DAILY_CHANGE_MAX: 0.02,          // ±2%
    TREND_VOLATILITY_MIN: 0.02,      // 2%
    TREND_VOLATILITY_MAX: 0.05,      // 5%
    TREND_DAYS: 30,
    UPDATE_INTERVAL_MS: 5000,        // 5 seconds (for simulation mode)
    API_UPDATE_INTERVAL_MS: 60000,   // 60 seconds (1 minute for real API data)
};

// Chart configuration
export const CHART_CONFIG = {
    ANIMATION_DURATION: 1000,
    SPARKLINE_WIDTH: 100,
    SPARKLINE_HEIGHT: 35,
    SPARKLINE_PADDING: 3,
    SPARKLINE_POINT_INTERVAL: 5,
    SPARKLINE_POINT_RADIUS: 1.5,
    MOVING_AVERAGE_PERIODS: {
        SHORT: 7,
        LONG: 14,
    },
};

// Sector colors
export const SECTOR_COLORS = {
    Technology: '#4A90E2',
    Healthcare: '#E24A4A',
    Diversified: '#50C878',
    Finance: '#F5A623',
    Consumer: '#9013FE',
    Energy: '#FF6B6B',
};

// Asset class colors
export const ASSET_CLASS_COLORS = [
    '#1FB8CD',
    '#FFC185',
    '#B4413C',
    '#ECEBD5',
    '#5D878F',
];

// Recommendation types
export const RECOMMENDATIONS = {
    BUY: 'BUY',
    HOLD: 'HOLD',
    SELL: 'SELL',
};

// Transaction types
export const TRANSACTION_TYPES = {
    BUY: 'buy',
    SELL: 'sell',
    DIVIDEND: 'dividend',
};

// Sectors
export const SECTORS = [
    'Technology',
    'Healthcare',
    'Finance',
    'Consumer',
    'Energy',
    'Diversified',
];

// Asset classes
export const ASSET_CLASSES = [
    'US Stocks',
    'International Stocks',
    'ETF',
    'Bonds',
    'Crypto',
];

// Default transaction fee
export const DEFAULT_TRANSACTION_FEE = 5.00;

// Current year for dividend calculations
export const CURRENT_YEAR = new Date().getFullYear();

// Validation constants
export const VALIDATION = {
    MIN_SHARES: 0.01,
    MIN_PRICE: 0.01,
    MAX_TICKER_LENGTH: 10,
    MAX_COMPANY_NAME_LENGTH: 100,
};

// Storage keys
export const STORAGE_KEYS = {
    HOLDINGS: 'portfolio_holdings',
    DIVIDENDS: 'portfolio_dividends',
    TRANSACTIONS: 'portfolio_transactions',
    CURRENT_PRICES: 'portfolio_current_prices',
    PREVIOUS_PRICES: 'portfolio_previous_prices',
    TREND_DATA: 'portfolio_trend_data',
    THEME: 'portfolio_theme',
};

// Error messages
export const ERROR_MESSAGES = {
    INVALID_TICKER: 'Ticker symbol is required and must be alphanumeric',
    INVALID_SHARES: 'Shares must be a positive number',
    INVALID_PRICE: 'Price must be a positive number',
    INVALID_DATE: 'Please provide a valid date',
    DUPLICATE_POSITION: 'A position with this ticker already exists',
    LOAD_ERROR: 'Failed to load portfolio data',
    SAVE_ERROR: 'Failed to save portfolio data',
    CALCULATION_ERROR: 'Error calculating portfolio metrics',
};

// Chart colors for trends
export const TREND_COLORS = {
    POSITIVE: {
        LINE: 'rgba(34, 197, 94, 0.9)',
        FILL: 'rgba(34, 197, 94, 0.1)',
        CHART_LINE: '#22A35A',
        CHART_FILL: 'rgba(34, 197, 94, 0.1)',
    },
    NEGATIVE: {
        LINE: 'rgba(192, 21, 47, 0.9)',
        FILL: 'rgba(192, 21, 47, 0.1)',
        CHART_LINE: '#C0152F',
        CHART_FILL: 'rgba(192, 21, 47, 0.1)',
    },
    NEUTRAL: {
        LINE: 'rgba(119, 124, 124, 0.8)',
        FILL: 'rgba(119, 124, 124, 0.1)',
    },
};

// Beta value for portfolio (simplified calculation)
export const DEFAULT_PORTFOLIO_BETA = 1.05;

// Flat trend threshold (1% change considered flat)
export const FLAT_TREND_THRESHOLD = 0.01;

