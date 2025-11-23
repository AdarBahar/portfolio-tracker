/**
 * Data Service Layer
 * Abstraction for data persistence - easily swappable between localStorage and API
 *
 * When migrating to a database:
 * 1. Replace LocalStorageAdapter with ApiAdapter
 * 2. Update methods to use async/await with fetch calls
 * 3. Add authentication headers
 * 4. No changes needed in business logic or UI
 */

import { STORAGE_KEYS, ERROR_MESSAGES } from './constants.js';

/**
 * Base interface for data adapters
 * Implement this interface for different storage backends (localStorage, API, etc.)
 */
class DataAdapter {
    async getHoldings() { throw new Error('Not implemented'); }
    async saveHoldings(holdings) { throw new Error('Not implemented'); }
    async getDividends() { throw new Error('Not implemented'); }
    async saveDividends(dividends) { throw new Error('Not implemented'); }
    async getTransactions() { throw new Error('Not implemented'); }
    async saveTransactions(transactions) { throw new Error('Not implemented'); }
    async getCurrentPrices() { throw new Error('Not implemented'); }
    async saveCurrentPrices(prices) { throw new Error('Not implemented'); }
    async getPreviousPrices() { throw new Error('Not implemented'); }
    async savePreviousPrices(prices) { throw new Error('Not implemented'); }
    async getTrendData() { throw new Error('Not implemented'); }
    async saveTrendData(trendData) { throw new Error('Not implemented'); }
}

/**
 * LocalStorage implementation
 * Current implementation - will be replaced with API calls
 */
class LocalStorageAdapter extends DataAdapter {
    constructor(userId = null) {
        super();
        this.userId = userId;
    }

    _getKey(baseKey) {
        // Add user ID to key for multi-user support
        return this.userId ? `${baseKey}_${this.userId}` : baseKey;
    }

    _get(key, defaultValue = null) {
        try {
            const storageKey = this._getKey(key);
            const item = localStorage.getItem(storageKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    }

    _set(key, value) {
        try {
            const storageKey = this._getKey(key);
            localStorage.setItem(storageKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
            throw new Error(ERROR_MESSAGES.SAVE_ERROR);
        }
    }

    async getHoldings() {
        return this._get(STORAGE_KEYS.HOLDINGS, []);
    }

    async saveHoldings(holdings) {
        return this._set(STORAGE_KEYS.HOLDINGS, holdings);
    }

    async getDividends() {
        return this._get(STORAGE_KEYS.DIVIDENDS, []);
    }

    async saveDividends(dividends) {
        return this._set(STORAGE_KEYS.DIVIDENDS, dividends);
    }

    async getTransactions() {
        return this._get(STORAGE_KEYS.TRANSACTIONS, []);
    }

    async saveTransactions(transactions) {
        return this._set(STORAGE_KEYS.TRANSACTIONS, transactions);
    }

    async getCurrentPrices() {
        return this._get(STORAGE_KEYS.CURRENT_PRICES, {});
    }

    async saveCurrentPrices(prices) {
        return this._set(STORAGE_KEYS.CURRENT_PRICES, prices);
    }

    async getPreviousPrices() {
        return this._get(STORAGE_KEYS.PREVIOUS_PRICES, {});
    }

    async savePreviousPrices(prices) {
        return this._set(STORAGE_KEYS.PREVIOUS_PRICES, prices);
    }

    async getTrendData() {
        return this._get(STORAGE_KEYS.TREND_DATA, {});
    }

    async saveTrendData(trendData) {
        return this._set(STORAGE_KEYS.TREND_DATA, trendData);
    }
}

/**
 * API Adapter
 * Uses backend API for core portfolio data (holdings) and delegates
 * other fields (prices, trend data, etc.) to a LocalStorageAdapter.
 */
class ApiAdapter extends DataAdapter {
    constructor(baseUrl, getAuthHeader, userId = null) {
        super();
        // Trim trailing slashes to avoid double-slash URLs
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.getAuthHeader = typeof getAuthHeader === 'function' ? getAuthHeader : () => ({});
        this.localAdapter = new LocalStorageAdapter(userId);
        this.knownTickers = new Set();
    }

    async _fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            let message = `API Error ${response.status}`;
            try {
                const data = await response.json();
                if (data && data.error) {
                    message = data.error;
                }
            } catch (e) {
                // ignore JSON parse errors
            }
            throw new Error(message);
        }

        // For 204/empty responses, just return null
        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    _mapHoldingFromApi(apiHolding) {
        if (!apiHolding) return apiHolding;
        return {
            id: apiHolding.id,
            ticker: apiHolding.ticker,
            name: apiHolding.name,
            shares: Number(apiHolding.shares),
            purchase_price: Number(apiHolding.purchasePrice ?? apiHolding.purchase_price),
            purchase_date: apiHolding.purchaseDate ?? apiHolding.purchase_date,
            sector: apiHolding.sector,
            asset_class: apiHolding.assetClass ?? apiHolding.asset_class ?? null,
        };
    }

    async getHoldings() {
        const data = await this._fetch('/holdings');
        const holdings = Array.isArray(data?.holdings) ? data.holdings.map(h => this._mapHoldingFromApi(h)) : [];
        this.knownTickers = new Set(holdings.map(h => h.ticker));
        // Mirror to local storage for faster subsequent loads/offline support
        await this.localAdapter.saveHoldings(holdings);
        return holdings;
    }

    async saveHoldings(holdings) {
        if (!Array.isArray(holdings)) {
            return false;
        }

        const seen = this.knownTickers || new Set();
        const newHoldings = holdings.filter((h) => h && h.ticker && !seen.has(h.ticker));

        for (const holding of newHoldings) {
            const payload = {
                ticker: holding.ticker,
                name: holding.name,
                shares: holding.shares,
                purchasePrice: holding.purchase_price,
                purchaseDate: holding.purchase_date,
                sector: holding.sector,
                assetClass: holding.asset_class,
            };
            try {
                const created = await this._fetch('/holdings', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                const createdHolding = created?.holding || created?.data?.holding;
                const createdTicker = createdHolding?.ticker || holding.ticker;
                seen.add(createdTicker);

                // If API returned an id, propagate it back into the in-memory holding
                if (createdHolding?.id && !holding.id) {
                    holding.id = createdHolding.id;
                }
            } catch (error) {
                console.error('Failed to sync holding to API:', error);
            }
        }

        this.knownTickers = seen;
        // Always keep a local copy in sync
        await this.localAdapter.saveHoldings(holdings);
        return true;
    }

    /**
     * Update an existing holding (API mode only)
     * @param {Object} holding - Holding object with id
     */
    async updateHolding(holding) {
        if (!holding || !holding.id) {
            throw new Error('updateHolding requires a holding with an id');
        }

        const payload = {
            ticker: holding.ticker,
            name: holding.name,
            shares: holding.shares,
            purchasePrice: holding.purchase_price,
            purchaseDate: holding.purchase_date,
            sector: holding.sector,
            assetClass: holding.asset_class,
        };

        const updated = await this._fetch(`/holdings/${encodeURIComponent(holding.id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        const mapped = this._mapHoldingFromApi(updated?.holding || updated?.data?.holding);
        if (mapped) {
            Object.assign(holding, mapped);
            if (mapped.ticker) {
                this.knownTickers.add(mapped.ticker);
            }
        }

        // Local mirror will be updated on the next saveAll() call
        return holding;
    }

    /**
     * Delete an existing holding (API mode only)
     * @param {number|string} id - Holding id
     * @param {string} [ticker] - Optional ticker for cache cleanup
     */
    async deleteHolding(id, ticker = null) {
        if (!id && id !== 0) {
            throw new Error('deleteHolding requires an id');
        }

        await this._fetch(`/holdings/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });

        if (ticker && this.knownTickers) {
            this.knownTickers.delete(ticker);
        }

        // Local mirror cleanup is handled by callers updating holdings array and saveAll()
        return true;
    }

    // Core portfolio data (holdings, dividends, transactions) via API
    // Price/trend data stays local for now

    async getPortfolioAll() {
        try {
            const data = await this._fetch('/portfolio/all');
            const holdings = Array.isArray(data?.holdings)
                ? data.holdings.map((h) => this._mapHoldingFromApi(h))
                : [];
            const dividends = Array.isArray(data?.dividends)
                ? data.dividends.map((d) => ({
                      id: d.id,
                      ticker: d.ticker,
                      amount: Number(d.amount),
                      shares: Number(d.shares),
                      date: d.date,
                      createdAt: d.createdAt,
                  }))
                : [];
            const transactions = Array.isArray(data?.transactions)
                ? data.transactions.map((t) => ({
                      id: t.id,
                      type: t.type,
                      ticker: t.ticker,
                      shares: Number(t.shares),
                      price: Number(t.price),
                      fees: Number(t.fees ?? 0),
                      date: t.date,
                      createdAt: t.createdAt,
                  }))
                : [];

            this.knownTickers = new Set(holdings.map((h) => h.ticker));

            await Promise.all([
                this.localAdapter.saveHoldings(holdings),
                this.localAdapter.saveDividends(dividends),
                this.localAdapter.saveTransactions(transactions),
            ]);

            return { holdings, dividends, transactions };
        } catch (error) {
            console.error('Failed to load portfolio from /portfolio/all, falling back:', error);
            const [holdings, dividends, transactions] = await Promise.all([
                this.getHoldings(),
                this.getDividends(),
                this.getTransactions(),
            ]);
            return { holdings, dividends, transactions };
        }
    }

    async getDividends() {
        const data = await this._fetch('/dividends');
        const dividends = Array.isArray(data?.dividends) ? data.dividends.map((d) => ({
            id: d.id,
            ticker: d.ticker,
            amount: Number(d.amount),
            shares: Number(d.shares),
            date: d.date,
            createdAt: d.createdAt,
        })) : [];
        await this.localAdapter.saveDividends(dividends);
        return dividends;
    }

    async saveDividends(dividends) {
        if (!Array.isArray(dividends)) {
            return false;
        }

        // For now, send only dividends that have not been persisted yet (no id)
        const newDividends = dividends.filter((d) => !d.id);

        for (const dividend of newDividends) {
            const payload = {
                ticker: dividend.ticker,
                amount: dividend.amount,
                shares: dividend.shares,
                date: dividend.date,
            };
            try {
                const created = await this._fetch('/dividends', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                const apiDividend = created?.dividend || created?.data?.dividend;
                if (apiDividend && !dividend.id) {
                    dividend.id = apiDividend.id;
                }
            } catch (error) {
                console.error('Failed to sync dividend to API:', error);
            }
        }

        await this.localAdapter.saveDividends(dividends);
        return true;
    }

    /**
     * Update an existing dividend (API mode only)
     * @param {Object} dividend - Dividend object with id
     */
    async updateDividend(dividend) {
        if (!dividend || !dividend.id) {
            throw new Error('updateDividend requires a dividend with an id');
        }

        const payload = {
            ticker: dividend.ticker,
            amount: dividend.amount,
            date: dividend.date,
            shares: dividend.shares,
        };

        const updated = await this._fetch(`/dividends/${encodeURIComponent(dividend.id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        Object.assign(dividend, updated?.dividend || updated?.data?.dividend || payload);
        // Local mirror will be updated on the next saveAll() call
        return dividend;
    }

    /**
     * Delete an existing dividend (API mode only)
     * @param {number|string} id - Dividend id
     */
    async deleteDividend(id) {
        if (!id && id !== 0) {
            throw new Error('deleteDividend requires an id');
        }

        await this._fetch(`/dividends/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });

        // Local mirror cleanup is handled by callers updating dividends array and saveAll()
        return true;
    }

    async getTransactions() {
        const data = await this._fetch('/transactions');
        const transactions = Array.isArray(data?.transactions) ? data.transactions.map((t) => ({
            id: t.id,
            type: t.type,
            ticker: t.ticker,
            shares: Number(t.shares),
            price: Number(t.price),
            fees: Number(t.fees ?? 0),
            date: t.date,
            createdAt: t.createdAt,
        })) : [];
        await this.localAdapter.saveTransactions(transactions);
        return transactions;
    }

    async saveTransactions(transactions) {
        if (!Array.isArray(transactions)) {
            return false;
        }

        const newTransactions = transactions.filter((t) => !t.id);

        for (const tx of newTransactions) {
            const payload = {
                type: tx.type,
                ticker: tx.ticker,
                shares: tx.shares,
                price: tx.price,
                fees: tx.fees ?? 0,
                date: tx.date,
            };
            try {
                const created = await this._fetch('/transactions', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                const apiTx = created?.transaction || created?.data?.transaction;
                if (apiTx && !tx.id) {
                    tx.id = apiTx.id;
                }
            } catch (error) {
                console.error('Failed to sync transaction to API:', error);
            }
        }

        await this.localAdapter.saveTransactions(transactions);
        return true;
    }

    /**
     * Update an existing transaction (API mode only)
     * @param {Object} transaction - Transaction object with id
     */
    async updateTransaction(transaction) {
        if (!transaction || !transaction.id) {
            throw new Error('updateTransaction requires a transaction with an id');
        }

        const payload = {
            type: transaction.type,
            ticker: transaction.ticker,
            shares: transaction.shares,
            price: transaction.price,
            fees: transaction.fees ?? 0,
            date: transaction.date,
        };

        const updated = await this._fetch(`/transactions/${encodeURIComponent(transaction.id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        Object.assign(transaction, updated?.transaction || updated?.data?.transaction || payload);
        // Local mirror will be updated on the next saveAll() call
        return transaction;
    }

    /**
     * Delete an existing transaction (API mode only)
     * @param {number|string} id - Transaction id
     */
    async deleteTransaction(id) {
        if (!id && id !== 0) {
            throw new Error('deleteTransaction requires an id');
        }

        await this._fetch(`/transactions/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });

        // Local mirror cleanup is handled by callers updating transactions array and saveAll()
        return true;
    }

    async getCurrentPrices() { return this.localAdapter.getCurrentPrices(); }
    async saveCurrentPrices(prices) { return this.localAdapter.saveCurrentPrices(prices); }
    async getPreviousPrices() { return this.localAdapter.getPreviousPrices(); }
    async savePreviousPrices(prices) { return this.localAdapter.savePreviousPrices(prices); }
    async getTrendData() { return this.localAdapter.getTrendData(); }
    async saveTrendData(trendData) { return this.localAdapter.saveTrendData(trendData); }
}

/**
 * Data Service
 * Main interface for data operations
 */
export class DataService {
    constructor(userId = null, adapter = null) {
        // If adapter is provided, use it; otherwise create LocalStorageAdapter with userId
        this.adapter = adapter || new LocalStorageAdapter(userId);
    }

    // To switch to API: new DataService(userId, new ApiAdapter('https://api.example.com', token))

    async loadAll() {
        try {
            let holdings;
            let dividends;
            let transactions;

            if (typeof this.adapter.getPortfolioAll === 'function') {
                const portfolio = await this.adapter.getPortfolioAll();
                holdings = portfolio?.holdings || [];
                dividends = portfolio?.dividends || [];
                transactions = portfolio?.transactions || [];
            } else {
                [holdings, dividends, transactions] = await Promise.all([
                    this.adapter.getHoldings(),
                    this.adapter.getDividends(),
                    this.adapter.getTransactions(),
                ]);
            }

            const [currentPrices, previousPrices, trendData] = await Promise.all([
                this.adapter.getCurrentPrices(),
                this.adapter.getPreviousPrices(),
                this.adapter.getTrendData(),
            ]);

            return { holdings, dividends, transactions, currentPrices, previousPrices, trendData };
        } catch (error) {
            console.error('Error loading data:', error);
            throw new Error(ERROR_MESSAGES.LOAD_ERROR);
        }
    }

    async saveAll(data) {
        try {
            await Promise.all([
                this.adapter.saveHoldings(data.holdings),
                this.adapter.saveDividends(data.dividends),
                this.adapter.saveTransactions(data.transactions),
                this.adapter.saveCurrentPrices(data.currentPrices),
                this.adapter.savePreviousPrices(data.previousPrices),
                this.adapter.saveTrendData(data.trendData),
            ]);
        } catch (error) {
            console.error('Error saving data:', error);
            throw new Error(ERROR_MESSAGES.SAVE_ERROR);
        }
    }

    async getHoldings() { return this.adapter.getHoldings(); }
    async saveHoldings(holdings) { return this.adapter.saveHoldings(holdings); }
    async getDividends() { return this.adapter.getDividends(); }
    async saveDividends(dividends) { return this.adapter.saveDividends(dividends); }
    async getTransactions() { return this.adapter.getTransactions(); }
    async saveTransactions(transactions) { return this.adapter.saveTransactions(transactions); }
    async getCurrentPrices() { return this.adapter.getCurrentPrices(); }
    async saveCurrentPrices(prices) { return this.adapter.saveCurrentPrices(prices); }
    async getPreviousPrices() { return this.adapter.getPreviousPrices(); }
    async savePreviousPrices(prices) { return this.adapter.savePreviousPrices(prices); }
    async getTrendData() { return this.adapter.getTrendData(); }
    async saveTrendData(trendData) { return this.adapter.saveTrendData(trendData); }
}


export { LocalStorageAdapter, ApiAdapter };
