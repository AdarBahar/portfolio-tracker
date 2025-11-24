/**
 * Main Application Entry Point
 * Initializes the app and sets up event handlers
 */

import { authManager } from './auth.js';
import { AppState } from './state.js';
import { ApiAdapter } from './dataService.js';
import configPromise from './config.js';
import { updateMetrics, updateHoldingsTable, updatePerformanceMetrics, updateCharts, updateDividendList, updateTransactions, showError, showSuccess, validatePositionForm } from './ui.js';
import { simulatePriceChange } from './calculations.js';
import { PRICE_SIMULATION, DEFAULT_TRANSACTION_FEE, ERROR_MESSAGES } from './constants.js';
import { debounce } from './utils.js';
import { setupSparklineInteractions } from './interactions.js';
import { setupModals } from './modals.js';
import { setupThemeToggle } from './theme.js';

// Global app state
let appState;
let priceUpdateInterval;

/**
 * Update entire dashboard
 */
function updateDashboard() {
    updateMetrics(appState);
    updateHoldingsTable(appState);
    updatePerformanceMetrics(appState);
    updateCharts(appState);
    updateDividendList(appState);
    updateTransactions(appState);
}

/**
 * Update prices - uses real API data if available, otherwise simulates
 */
async function updatePrices() {
    try {
        const newPrices = {};
        const newTrendData = {};

        // Check if we have API adapter with market data capability
        const adapter = appState.dataService?.adapter;
        const hasApiAdapter = adapter && typeof adapter.getMarketData === 'function';

        if (hasApiAdapter && appState.holdings.length > 0) {
            // Fetch real market data from API
            const symbols = appState.holdings.map(h => h.ticker);
            const marketData = await adapter.getMarketData(symbols);

            // Update prices from API response
            appState.holdings.forEach(holding => {
                const data = marketData[holding.ticker];

                if (data && typeof data.currentPrice === 'number') {
                    // Use real price from API
                    newPrices[holding.ticker] = data.currentPrice;
                } else {
                    // Fallback to previous price if API fails
                    newPrices[holding.ticker] = appState.currentPrices[holding.ticker];
                }

                // Update trend data - shift left and add new price
                const trendArray = [...appState.trendData[holding.ticker]];
                trendArray.shift();
                trendArray.push(newPrices[holding.ticker]);
                newTrendData[holding.ticker] = trendArray;
            });
        } else {
            // Simulation mode (demo users or no API)
            appState.holdings.forEach(holding => {
                // Update price with simulation
                newPrices[holding.ticker] = simulatePriceChange(appState.currentPrices[holding.ticker]);

                // Update trend data - shift left and add new price
                const trendArray = [...appState.trendData[holding.ticker]];
                trendArray.shift();
                trendArray.push(newPrices[holding.ticker]);
                newTrendData[holding.ticker] = trendArray;
            });
        }

        appState.updatePrices(newPrices, newTrendData);
    } catch (error) {
        console.error('Error updating prices:', error);
    }
}



/**
 * Setup table sorting
 */
function setupTableSorting() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            
            if (appState.sortColumn === column) {
                appState.setSort(column, appState.sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                appState.setSort(column, 'asc');
            }
        });
    });
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const debouncedSearch = debounce((term) => {
        appState.setSearchTerm(term);
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
}

/**
 * Setup filter buttons
 */
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            appState.setFilter(this.getAttribute('data-filter'));
        });
    });
}

/**
 * Setup add position form
 */
function setupAddPositionForm() {
    const form = document.getElementById('addPositionForm');
    const modal = document.getElementById('addPositionModal');
    
    if (!form || !modal) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const validation = validatePositionForm();
            
            if (!validation.valid) {
                showError(validation.errors.join(', '));
                return;
            }
            
            // Check for duplicate ticker
            if (appState.holdings.some(h => h.ticker === validation.data.ticker)) {
                showError(ERROR_MESSAGES.DUPLICATE_POSITION);
                return;
            }
            
            // Add holding
            await appState.addHolding(validation.data);
            
            // Add transaction
            await appState.addTransaction({
                type: 'buy',
                ticker: validation.data.ticker,
                shares: validation.data.shares,
                price: validation.data.purchase_price,
                date: validation.data.purchase_date,
                fees: DEFAULT_TRANSACTION_FEE,
            });
            
            modal.classList.remove('active');
            form.reset();
            showSuccess(`Successfully added ${validation.data.ticker} to your portfolio`);
        } catch (error) {
            console.error('Error adding position:', error);
            showError('Failed to add position. Please try again.');
        }
    });
}

/**
 * Setup user profile display and logout
 */
function setupUserProfile() {
    const user = authManager.getUser();
    if (!user) return;

    // Update header with user info
    const header = document.querySelector('.header');
    if (!header) return;

    // Create user profile element
    const userProfile = document.createElement('div');
    userProfile.className = 'user-profile';
    userProfile.innerHTML = `
        <div class="user-info">
            ${user.picture ? `<img src="${user.picture}" alt="${user.name}" class="user-avatar">` : ''}
            <div class="user-details">
                <span class="user-name">${user.name}</span>
                ${user.isDemo ? '<span class="demo-badge">Demo Mode</span>' : ''}
            </div>
        </div>
        <button class="btn btn-secondary logout-btn" id="logoutBtn">Logout</button>
    `;

    // Insert before header actions
    const headerActions = header.querySelector('.header-actions');
    if (headerActions) {
        headerActions.insertBefore(userProfile, headerActions.firstChild);
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                authManager.logout();
            }
        });
    }
}

/**
 * Check if backend is in debug mode and show badge
 */
async function checkDebugMode(apiUrl) {
    try {
        const healthUrl = `${apiUrl.replace('/api', '')}/api/health`;
        const response = await fetch(healthUrl);

        if (response.ok) {
            const data = await response.json();

            if (data.marketDataMode === 'debug') {
                const badge = document.getElementById('debugModeBadge');
                if (badge) {
                    badge.style.display = 'inline-block';
                    console.warn('⚠️  Backend is in DEBUG MODE - Market data API calls are throttled');
                }
            }
        }
    } catch (error) {
        console.warn('Could not check backend debug mode:', error);
    }
}

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Check authentication
        if (!authManager.initialize()) {
            // Not authenticated, redirect to login
            window.location.href = '/fantasybroker/login.html';
            return;
        }

        // Show loading state
        document.body.classList.add('loading');

        // Initialize state with user context
        const user = authManager.getUser();
        const config = await configPromise;

        // Check if backend is in debug mode
        if (config.apiUrl) {
            await checkDebugMode(config.apiUrl);
        }

        let adapter = null;
        const token = authManager.getToken();
        const isDemo = user && user.isDemo;

        if (config.apiUrl && token && !isDemo) {
            adapter = new ApiAdapter(config.apiUrl, () => authManager.getAuthHeader(), user ? user.id : null);
            console.info('Using API adapter for portfolio data');
        } else {
            console.info('Using localStorage adapter for portfolio data');
        }

        appState = new AppState(user, { adapter });
        await appState.initialize();

        // Subscribe to state changes
        appState.subscribe(updateDashboard);

        // Initial render
        updateDashboard();

        // Setup UI interactions
        setupThemeToggle();
        setupTableSorting();
        setupSearch();
        setupFilters();
        setupAddPositionForm();
        setupUserProfile();
        setupSparklineInteractions(appState);
        setupModals(appState);

        // Fetch initial real prices if using API adapter
        const dataAdapter = appState.dataService?.adapter;
        const hasApiAdapter = dataAdapter && typeof dataAdapter.getMarketData === 'function';

        if (hasApiAdapter && appState.holdings.length > 0) {
            console.info('Fetching initial real-time prices from API...');
            await updatePrices(); // Initial fetch
        }

        // Start price updates
        // Use longer interval for API mode (1 minute), shorter for simulation (5 seconds)
        const updateInterval = hasApiAdapter
            ? PRICE_SIMULATION.API_UPDATE_INTERVAL_MS
            : PRICE_SIMULATION.UPDATE_INTERVAL_MS;

        priceUpdateInterval = setInterval(updatePrices, updateInterval);
        console.info(`Price updates started (interval: ${updateInterval / 1000}s, mode: ${hasApiAdapter ? 'API' : 'simulation'})`);

        // Remove loading state
        document.body.classList.remove('loading');

    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load portfolio. Please refresh the page.');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
    }
});

