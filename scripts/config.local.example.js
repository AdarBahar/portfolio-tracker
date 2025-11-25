/**
 * Local Configuration Example
 *
 * Copy this file to config.local.js and customize your values
 * config.local.js is gitignored and won't be committed
 *
 * This is the FRONTEND configuration (client-side JavaScript)
 * For BACKEND configuration, see backend/.env.example
 */

export default {
    // ============================================================================
    // GOOGLE OAUTH & API
    // ============================================================================

    // Your Google OAuth Client ID
    // Get yours at: https://console.cloud.google.com/apis/credentials
    googleClientId: '539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com',

    // Backend API URL
    // Default: 'http://localhost:4000/api'
    // apiUrl: 'http://localhost:8080/api',

    // ============================================================================
    // PRICE UPDATE NOTIFICATIONS
    // ============================================================================

    // Number of consecutive price update failures before showing a notification
    // Default: 5
    // Range: 1-20 (higher values = less sensitive to transient failures)
    // priceUpdateFailureThreshold: 5,

    // Duration (in milliseconds) to show the notification toast
    // Default: 5000 (5 seconds)
    // Range: 1000-30000
    // notificationDurationMs: 5000,

    // ============================================================================
    // API RETRY AND BACKOFF
    // ============================================================================

    // Maximum number of retry attempts for failed API requests
    // Default: 3
    // Range: 0-10 (0 = no retries)
    // apiMaxRetries: 3,

    // Initial delay (in milliseconds) before first retry
    // Default: 1000 (1 second)
    // Range: 100-5000
    // apiRetryInitialDelayMs: 1000,

    // Multiplier for exponential backoff
    // Default: 2 (each retry waits 2x longer than previous)
    // Range: 1.5-5.0
    // Example: delay sequence with multiplier=2: 1s, 2s, 4s
    // apiRetryBackoffMultiplier: 2,

    // Maximum delay (in milliseconds) between retries
    // Default: 10000 (10 seconds)
    // Range: 1000-60000
    // Prevents exponential backoff from growing too large
    // apiRetryMaxDelayMs: 10000,

    // HTTP status codes that should trigger a retry (comma-separated)
    // Default: [408, 429, 500, 502, 503, 504]
    // 408 = Request Timeout
    // 429 = Too Many Requests
    // 500 = Internal Server Error
    // 502 = Bad Gateway
    // 503 = Service Unavailable
    // 504 = Gateway Timeout
    // apiRetryableStatusCodes: [408, 429, 500, 502, 503, 504],

    // ============================================================================
    // PAYLOAD SIZE VALIDATION
    // ============================================================================

    // Maximum number of symbols in a single market data request
    // Default: 50
    // Range: 1-100
    // maxSymbolsPerRequest: 50,

    // Maximum length for text fields (description, rules, notes)
    // Default: 5000 characters
    // Range: 100-50000
    // maxTextFieldLength: 5000,

    // Maximum number of shares in a single order
    // Default: 1000000 (1 million)
    // Range: 1-10000000
    // maxSharesPerOrder: 1000000,

    // Maximum price per share
    // Default: 100000 ($100,000)
    // Range: 0.01-1000000
    // maxPricePerShare: 100000,

    // Maximum number of items in bulk operations
    // Default: 100
    // Range: 1-1000
    // maxBulkItems: 100,

    // ============================================================================
    // PERFORMANCE AND CACHING
    // ============================================================================

    // Enable DOM batching with requestAnimationFrame
    // Default: true
    // Set to false if you experience rendering issues
    // enableDomBatching: true,

    // Enable caching of derived metrics
    // Default: true
    // Set to false to always recalculate metrics
    // enableMetricsCaching: true,

    // Cache TTL (in milliseconds) for Finnhub API responses
    // Default: 60000 (1 minute)
    // Range: 0-3600000 (0 = no cache, 1 hour max)
    // finnhubCacheTtlMs: 60000,

    // ============================================================================
    // SECURITY
    // ============================================================================

    // Allowed authentication header keys
    // Default: ['Authorization', 'X-App-Version']
    // Only these headers can be set by the auth system
    // allowedAuthHeaderKeys: ['Authorization', 'X-App-Version'],

    // Enable strict header validation
    // Default: true
    // Set to false only for debugging
    // strictHeaderValidation: true,

    // ============================================================================
    // DEVELOPMENT AND DEBUGGING
    // ============================================================================

    // Enable verbose API logging to console
    // Default: false
    // Set to true to see detailed retry/request logs
    // verboseApiLogging: false,

    // Enable performance monitoring
    // Default: false
    // Set to true to log performance metrics
    // enablePerformanceMonitoring: false,
};

