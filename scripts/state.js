/**
 * Application State Management
 * Centralized state with change notifications
 */

import { DataService } from './dataService.js';
import { sampleHoldings, sampleDividends, sampleTransactions } from './sampleData.js';
import { generateTrendData, calculateInitialPrice } from './calculations.js';

/**
 * Application State Manager
 * Manages all application data with persistence
 */
export class AppState {
    constructor(user = null, options = {}) {
        // Pass user ID to DataService for user-specific storage
        const userId = user ? user.id : null;

        if (options.adapter) {
            this.dataService = new DataService(userId, options.adapter);
        } else {
            this.dataService = new DataService(userId);
        }

        this.user = user;
        this.listeners = [];

        // State
        this.holdings = [];
        this.dividends = [];
        this.transactions = [];
        this.currentPrices = {};
        this.previousPrices = {};
        this.trendData = {};

        // UI State
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.activeFilter = 'all';
        this.searchTerm = '';
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all listeners of state change
     */
    notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }

    /**
     * Initialize state from storage or sample data
     */
    async initialize() {
        try {
            const data = await this.dataService.loadAll();

            // If no data in storage, use sample data
            if (!data.holdings || data.holdings.length === 0) {
                this.holdings = [...sampleHoldings];
                this.dividends = [...sampleDividends];
                this.transactions = [...sampleTransactions];

                // Initialize prices and trends
                this.holdings.forEach(holding => {
                    this.currentPrices[holding.ticker] = calculateInitialPrice(holding.purchase_price);
                    this.previousPrices[holding.ticker] = this.currentPrices[holding.ticker];
                    this.trendData[holding.ticker] = generateTrendData(
                        holding.ticker,
                        holding.purchase_price,
                        this.currentPrices[holding.ticker]
                    );
                });

                // Save initial data
                await this.save();
            } else {
                // Load from storage
                this.holdings = data.holdings;
                this.dividends = data.dividends;
                this.transactions = data.transactions;
                this.currentPrices = data.currentPrices || {};
                this.previousPrices = data.previousPrices || {};
                this.trendData = data.trendData || {};
            }

            // Ensure prices and trend data exist for all holdings (migration-safe)
            this.holdings.forEach(holding => {
                const ticker = holding.ticker;

                // Ensure current price
                if (typeof this.currentPrices[ticker] !== 'number' || !isFinite(this.currentPrices[ticker])) {
                    this.currentPrices[ticker] = calculateInitialPrice(holding.purchase_price);
                }

                // Ensure previous price
                if (typeof this.previousPrices[ticker] !== 'number' || !isFinite(this.previousPrices[ticker])) {
                    this.previousPrices[ticker] = this.currentPrices[ticker];
                }

                // Ensure trend data is an array
                const existingTrend = this.trendData && this.trendData[ticker];
                if (!Array.isArray(existingTrend) || existingTrend.length === 0) {
                    this.trendData[ticker] = generateTrendData(
                        ticker,
                        holding.purchase_price,
                        this.currentPrices[ticker]
                    );
                }
            });

            this.notify();
        } catch (error) {
            console.error('Error initializing state:', error);
            throw error;
        }
    }

    /**
     * Save current state to storage
     */
    async save() {
        try {
            await this.dataService.saveAll({
                holdings: this.holdings,
                dividends: this.dividends,
                transactions: this.transactions,
                currentPrices: this.currentPrices,
                previousPrices: this.previousPrices,
                trendData: this.trendData,
            });
        } catch (error) {
            console.error('Error saving state:', error);
            throw error;
        }
    }

    /**
     * Add a new holding
     * @param {Object} holding - Holding object
     */
    async addHolding(holding) {
        this.holdings.push(holding);
        
        // Initialize price and trend data
        this.currentPrices[holding.ticker] = calculateInitialPrice(holding.purchase_price);
        this.previousPrices[holding.ticker] = this.currentPrices[holding.ticker];
        this.trendData[holding.ticker] = generateTrendData(
            holding.ticker,
            holding.purchase_price,
            this.currentPrices[holding.ticker]
        );
        
        await this.save();
        this.notify();
    }

    /**
     * Add a transaction
     * @param {Object} transaction - Transaction object
     */
    async addTransaction(transaction) {
        const toSave = {
            id: transaction.id ?? null,
            type: transaction.type,
            ticker: transaction.ticker,
            shares: Number(transaction.shares),
            price: Number(transaction.price),
            fees: Number(transaction.fees ?? 0),
            date: transaction.date,
            createdAt: transaction.createdAt ?? new Date().toISOString(),
        };
        this.transactions.push(toSave);
        await this.save();
        this.notify();
    }

    async updateHolding(updated) {
        if (!updated || updated.id == null) return;
        const index = this.holdings.findIndex((h) => h.id === updated.id);
        if (index === -1) return;

        const existing = this.holdings[index];
        const oldTicker = existing.ticker;
        const newTicker = updated.ticker ?? existing.ticker;

        this.holdings[index] = {
            ...existing,
            ...updated,
            shares: Number(updated.shares ?? existing.shares),
            purchase_price: Number(updated.purchase_price ?? existing.purchase_price),
        };

        if (newTicker !== oldTicker) {
            // Move price/trend data under new ticker
            if (this.currentPrices[oldTicker] != null && this.currentPrices[newTicker] == null) {
                this.currentPrices[newTicker] = this.currentPrices[oldTicker];
            }
            if (this.previousPrices[oldTicker] != null && this.previousPrices[newTicker] == null) {
                this.previousPrices[newTicker] = this.previousPrices[oldTicker];
            }
            if (this.trendData[oldTicker] != null && this.trendData[newTicker] == null) {
                this.trendData[newTicker] = this.trendData[oldTicker];
            }
            delete this.currentPrices[oldTicker];
            delete this.previousPrices[oldTicker];
            delete this.trendData[oldTicker];
        }

        await this.save();
        this.notify();
    }

    async deleteHolding(id) {
        const index = this.holdings.findIndex((h) => h.id === id);
        if (index === -1) return;
        const [removed] = this.holdings.splice(index, 1);
        const ticker = removed?.ticker;
        if (ticker) {
            delete this.currentPrices[ticker];
            delete this.previousPrices[ticker];
            delete this.trendData[ticker];
        }
        await this.save();
        this.notify();
    }

    async updateTransaction(updated) {
        if (!updated || updated.id == null) return;
        const index = this.transactions.findIndex((t) => t.id === updated.id);
        if (index === -1) return;

        const existing = this.transactions[index];
        this.transactions[index] = {
            ...existing,
            ...updated,
            shares: Number(updated.shares ?? existing.shares),
            price: Number(updated.price ?? existing.price),
            fees: Number(updated.fees ?? existing.fees ?? 0),
        };

        await this.save();
        this.notify();
    }

    async deleteTransaction(id) {
        const index = this.transactions.findIndex((t) => t.id === id);
        if (index === -1) return;
        this.transactions.splice(index, 1);
        await this.save();
        this.notify();
    }

    /**
     * Update prices (for simulation)
     * @param {Object} newPrices - New prices by ticker
     * @param {Object} newTrendData - New trend data by ticker
     */
    async updatePrices(newPrices, newTrendData) {
        this.previousPrices = { ...this.currentPrices };
        this.currentPrices = newPrices;
        this.trendData = newTrendData;
        
        await this.save();
        this.notify();
    }

    /**
     * Set sort configuration
     * @param {string} column - Column to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     */
    setSort(column, direction) {
        this.sortColumn = column;
        this.sortDirection = direction;
        this.notify();
    }

    /**
     * Set active filter
     * @param {string} filter - Filter value
     */
    setFilter(filter) {
        this.activeFilter = filter;
        this.notify();
    }

    /**
     * Set search term
     * @param {string} term - Search term
     */
    setSearchTerm(term) {
        this.searchTerm = term;
        this.notify();
    }

    /**
     * Get filtered and sorted holdings
     * @returns {Array} Filtered holdings
     */
    getFilteredHoldings() {
        let filtered = this.holdings.filter(holding => {
            const matchesSearch = holding.ticker.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                                holding.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesFilter = this.activeFilter === 'all' || holding.sector === this.activeFilter;
            return matchesSearch && matchesFilter;
        });

        if (this.sortColumn) {
            filtered = this.sortHoldings(filtered);
        }

        return filtered;
    }

    /**
     * Sort holdings by current sort configuration
     * @param {Array} holdings - Holdings to sort
     * @returns {Array} Sorted holdings
     */
    sortHoldings(holdings) {
        return [...holdings].sort((a, b) => {
            let aVal, bVal;
            
            if (this.sortColumn === 'current_price') {
                aVal = this.currentPrices[a.ticker] || 0;
                bVal = this.currentPrices[b.ticker] || 0;
            } else if (this.sortColumn === 'current_value') {
                aVal = a.shares * (this.currentPrices[a.ticker] || 0);
                bVal = b.shares * (this.currentPrices[b.ticker] || 0);
            } else if (this.sortColumn === 'gain_loss') {
                aVal = ((this.currentPrices[a.ticker] || 0) - a.purchase_price) * a.shares;
                bVal = ((this.currentPrices[b.ticker] || 0) - b.purchase_price) * b.shares;
            } else if (this.sortColumn === 'gain_loss_percent') {
                aVal = (((this.currentPrices[a.ticker] || 0) - a.purchase_price) / a.purchase_price) * 100;
                bVal = (((this.currentPrices[b.ticker] || 0) - b.purchase_price) / b.purchase_price) * 100;
            } else {
                aVal = a[this.sortColumn];
                bVal = b[this.sortColumn];
            }

            if (typeof aVal === 'string') {
                return this.sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }
}

