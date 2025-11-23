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
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID',

    // API endpoint for backend integration
    // Default: local backend on port 4000
    apiUrl: 'http://localhost:4000/api',

    // App settings
    appName: 'Portfolio Tracker',
    version: '1.0.0',
};

// Load configuration asynchronously
async function loadConfig() {
    let localConfig = {};

    try {
        // Try to import local config
        const module = await import('./config.local.js');
        localConfig = module.default || {};
        console.info('✅ Loaded configuration from config.local.js');
    } catch (error) {
        // config.local.js doesn't exist, use defaults
        console.info('ℹ️ Using default configuration. Create config.local.js to override.');
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
    if (config.googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
        console.warn('⚠️ Google Client ID not configured!');
        console.info('📝 Create scripts/config.local.js to set your Client ID');
        console.info('📖 See GOOGLE_OAUTH_SETUP.md for instructions');
    }

    return config;
}

// Export the async loader
export default loadConfig();

