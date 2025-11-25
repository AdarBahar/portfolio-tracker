/**
 * Application Configuration
 *
 * For production: Use environment variables with a build tool (Vite, Webpack)
 * For development: Use config.local.js (not committed to git)
 */

// Default configuration
const defaultConfig = {
    // Google OAuth Client ID
    // This is PUBLIC and safe to expose in frontend code
    // Get yours at: https://console.cloud.google.com/apis/credentials
    googleClientId: '539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com',

    // API endpoint for backend integration
    // Default: local backend on port 4000
    apiUrl: 'http://localhost:4000/api',

    // App settings
    appName: 'Portfolio Tracker',
    version: '1.0.0',

    // Price update notifications
    priceUpdateFailureThreshold: 5,
    notificationDurationMs: 5000,

    // API retry and backoff
    apiMaxRetries: 3,
    apiRetryInitialDelayMs: 1000,
    apiRetryBackoffMultiplier: 2,
    apiRetryMaxDelayMs: 10000,
    apiRetryableStatusCodes: [408, 429, 500, 502, 503, 504],

    // Payload size validation
    maxSymbolsPerRequest: 50,
    maxTextFieldLength: 5000,
    maxSharesPerOrder: 1000000,
    maxPricePerShare: 100000,
    maxBulkItems: 100,

    // Performance and caching
    enableDomBatching: true,
    enableMetricsCaching: true,
    finnhubCacheTtlMs: 60000,

    // Security
    allowedAuthHeaderKeys: ['Authorization', 'X-App-Version'],
    strictHeaderValidation: true,

    // Development and debugging
    verboseApiLogging: false,
    enablePerformanceMonitoring: false,
};

// Load configuration asynchronously
async function loadConfig() {
    let localConfig = {};

    // Only try to load config.local.js in development
    const isDevelopment = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '';

    if (isDevelopment) {
        try {
            // Try to import local config
            const module = await import('./config.local.js');
            localConfig = module.default || {};
            console.info('✅ Loaded configuration from config.local.js');
        } catch (error) {
            // config.local.js doesn't exist, use defaults
            console.info('ℹ️ Using default configuration. Create config.local.js to override.');
        }
    }

    // Merge configurations (local overrides default)
    const config = {
        ...defaultConfig,
        ...localConfig,
    };

    // If apiUrl wasn't overridden in localConfig, adjust based on current host
    if (!localConfig.apiUrl && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'www.bahar.co.il' || hostname === 'bahar.co.il') {
            config.apiUrl = 'https://www.bahar.co.il/fantasybroker-api/api';
        }
    }

    // Validate configuration
    if (!config.googleClientId || config.googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
        console.warn('⚠️ Google Client ID not configured!');
        console.info('📝 Create scripts/config.local.js to set your Client ID');
        console.info('📖 See GOOGLE_OAUTH_SETUP.md for instructions');
    }

    return config;
}

// Export the async loader
export default loadConfig();

/**
 * Validate a value against config constraints
 * @param {Object} config - Configuration object
 * @param {string} configKey - Config key to use for validation
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateAgainstConfig(config, configKey, value, fieldName = 'Value') {
    const limit = config[configKey];

    if (limit === undefined) {
        return { valid: true, error: null };
    }

    // String length validation
    if (configKey === 'maxTextFieldLength') {
        if (typeof value !== 'string') {
            return { valid: false, error: `${fieldName} must be a string` };
        }
        if (value.length > limit) {
            return { valid: false, error: `${fieldName} exceeds maximum length of ${limit} characters` };
        }
    }

    // Numeric validation
    if (configKey === 'maxSharesPerOrder' || configKey === 'maxPricePerShare') {
        if (typeof value !== 'number' || isNaN(value)) {
            return { valid: false, error: `${fieldName} must be a number` };
        }
        if (value > limit) {
            return { valid: false, error: `${fieldName} exceeds maximum of ${limit}` };
        }
        if (value <= 0) {
            return { valid: false, error: `${fieldName} must be greater than 0` };
        }
    }

    // Array length validation
    if (configKey === 'maxSymbolsPerRequest' || configKey === 'maxBulkItems') {
        if (!Array.isArray(value)) {
            return { valid: false, error: `${fieldName} must be an array` };
        }
        if (value.length > limit) {
            return { valid: false, error: `${fieldName} exceeds maximum of ${limit} items` };
        }
    }

    return { valid: true, error: null };
}

