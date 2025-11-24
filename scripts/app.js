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
import { TickerAutocomplete } from './tickerAutocomplete.js';

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
 * Check if ticker is currently held or was held in the past
 * Displays a notification in the Add Position modal with holding status
 *
 * @param {string} ticker - Stock ticker symbol to check
 */
function checkHoldingStatus(ticker) {
    const holdingStatusNotification = document.getElementById('holdingStatusNotification');
    const holdingStatusContent = document.getElementById('holdingStatusContent');

    if (!holdingStatusNotification || !holdingStatusContent || !appState) {
        return;
    }

    // Check if ticker is currently in holdings
    const currentHolding = appState.holdings.find(h => h.ticker === ticker);

    if (currentHolding) {
        // Display warning for current holding
        holdingStatusNotification.className = 'holding-status-notification warning';
        holdingStatusContent.innerHTML = `
            <strong>⚠️ Currently Holding</strong>
            <div class="detail">You already have <strong>${currentHolding.shares}</strong> shares of <strong>${ticker}</strong>.</div>
        `;
        holdingStatusNotification.style.display = 'flex';
        return;
    }

    // Check transaction history for past holdings
    const tickerTransactions = appState.transactions.filter(t => t.ticker === ticker);

    if (tickerTransactions.length > 0) {
        const pastHolding = calculatePastHolding(tickerTransactions);

        if (pastHolding) {
            const profitLossText = pastHolding.profitLoss >= 0
                ? `profit of $${pastHolding.profitLoss.toFixed(2)}`
                : `loss of $${Math.abs(pastHolding.profitLoss).toFixed(2)}`;

            // Display info for past holding
            holdingStatusNotification.className = 'holding-status-notification';
            holdingStatusContent.innerHTML = `
                <strong>📊 Past Holding</strong>
                <div class="detail">
                    You used to have <strong>${pastHolding.maxShares}</strong> shares of <strong>${ticker}</strong><br>
                    From: <strong>${pastHolding.startDate}</strong> to: <strong>${pastHolding.endDate}</strong><br>
                    You made a ${profitLossText}
                </div>
            `;
            holdingStatusNotification.style.display = 'flex';
            return;
        }
    }

    // No current or past holding - hide notification
    holdingStatusNotification.style.display = 'none';
}

/**
 * Calculate past holding details from transaction history
 * Analyzes buy/sell transactions to determine if position was fully closed
 * and calculates profit/loss
 *
 * @param {Array} transactions - Array of transaction objects for a specific ticker
 * @returns {Object|null} Past holding details or null if position not fully closed
 * @returns {number} return.maxShares - Maximum shares held at any point
 * @returns {string} return.startDate - Date of first purchase
 * @returns {string} return.endDate - Date position was fully closed
 * @returns {number} return.profitLoss - Total profit/loss (revenue - cost)
 */
function calculatePastHolding(transactions) {
    if (!transactions || transactions.length === 0) return null;

    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    let currentShares = 0;
    let totalBuyCost = 0;
    let totalSellRevenue = 0;
    let maxShares = 0;
    let startDate = null;
    let endDate = null;
    let wasClosed = false;

    // Process each transaction to track position lifecycle
    for (const tx of sorted) {
        if (tx.type === 'buy') {
            if (currentShares === 0) {
                startDate = tx.date; // First purchase date
            }
            currentShares += tx.shares;
            totalBuyCost += (tx.shares * tx.price) + (tx.fees || 0);
            maxShares = Math.max(maxShares, currentShares);
        } else if (tx.type === 'sell') {
            currentShares -= tx.shares;
            totalSellRevenue += (tx.shares * tx.price) - (tx.fees || 0);

            if (currentShares === 0) {
                endDate = tx.date; // Position fully closed
                wasClosed = true;
            }
        }
    }

    // Only return data if position was fully closed (all shares sold)
    if (!wasClosed) return null;

    return {
        maxShares,
        startDate,
        endDate,
        profitLoss: totalSellRevenue - totalBuyCost
    };
}

/**
 * Setup add position form
 */
function setupAddPositionForm(config) {
    const form = document.getElementById('addPositionForm');
    const modal = document.getElementById('addPositionModal');
    const tickerInput = document.getElementById('ticker');
    const autocompleteDropdown = document.getElementById('tickerAutocomplete');
    const companyNameInput = document.getElementById('companyName');
    const sectorSelect = document.getElementById('sector');
    const assetClassSelect = document.getElementById('assetClass');
    const currentPriceGroup = document.getElementById('currentPriceGroup');
    const currentPriceDisplay = document.getElementById('currentPriceDisplay');
    const holdingStatusNotification = document.getElementById('holdingStatusNotification');
    const holdingStatusContent = document.getElementById('holdingStatusContent');

    if (!form || !modal || !tickerInput || !autocompleteDropdown) return;

    // Initialize autocomplete with API URL from config
    const autocomplete = new TickerAutocomplete(
        tickerInput,
        autocompleteDropdown,
        async (selectedItem) => {
            // When a ticker is selected, populate the form
            companyNameInput.value = selectedItem.description;

            // Check for current or past holdings
            checkHoldingStatus(selectedItem.symbol);

            // Fetch additional data (current price and company profile)
            try {
                const adapter = appState.dataService?.adapter;
                if (adapter && typeof adapter.getMarketData === 'function') {
                    const marketData = await adapter.getMarketData([selectedItem.symbol]);
                    const data = marketData[selectedItem.symbol];

                    if (data) {
                        // Display current price
                        const priceValue = currentPriceDisplay.querySelector('.price-value');
                        const priceChange = currentPriceDisplay.querySelector('.price-change');

                        priceValue.textContent = `$${data.currentPrice.toFixed(2)}`;

                        if (data.change !== undefined && data.changePercent !== undefined) {
                            const changeText = `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)} (${data.changePercent.toFixed(2)}%)`;
                            priceChange.textContent = changeText;
                            priceChange.className = `price-change ${data.change >= 0 ? 'positive' : 'negative'}`;
                        }

                        currentPriceGroup.style.display = 'block';

                        // Auto-populate sector if available
                        if (data.sector) {
                            const sectorValue = mapSectorToOption(data.sector);
                            if (sectorValue) {
                                sectorSelect.value = sectorValue;
                            }
                        }

                        // Auto-populate asset class based on type
                        if (selectedItem.type === 'ETF') {
                            assetClassSelect.value = 'ETF';
                        } else {
                            assetClassSelect.value = 'US Stocks';
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching market data:', error);
            }
        },
        config.apiUrl
    );

    // Reset autocomplete when modal closes
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'closeModal') {
            autocomplete.reset();
            currentPriceGroup.style.display = 'none';
            holdingStatusNotification.style.display = 'none';
        }
    });

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
            autocomplete.reset();
            currentPriceGroup.style.display = 'none';
            holdingStatusNotification.style.display = 'none';
            showSuccess(`Successfully added ${validation.data.ticker} to your portfolio`);
        } catch (error) {
            console.error('Error adding position:', error);
            showError('Failed to add position. Please try again.');
        }
    });
}

/**
 * Map Finnhub sector to our sector options
 */
function mapSectorToOption(sector) {
    const sectorMap = {
        'Technology': 'Technology',
        'Healthcare': 'Healthcare',
        'Financial Services': 'Finance',
        'Finance': 'Finance',
        'Consumer Cyclical': 'Consumer',
        'Consumer Defensive': 'Consumer',
        'Energy': 'Energy',
        'Industrials': 'Diversified',
        'Basic Materials': 'Diversified',
        'Real Estate': 'Diversified',
        'Utilities': 'Diversified',
        'Communication Services': 'Technology',
    };

    return sectorMap[sector] || null;
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
        setupAddPositionForm(config);
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

