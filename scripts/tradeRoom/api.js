/**
 * BullPen API Service
 * Handles all API calls for trade room functionality
 */

import { authManager } from '../auth.js';
import { fetchWithRetry } from '../apiRetry.js';
import configPromise, { validateAgainstConfig } from '../config.js';

export class BullPenAPI {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.config = null;
        this._initConfig();
    }

    /**
     * Initialize configuration
     */
    async _initConfig() {
        this.config = await configPromise;
    }

    /**
     * Get authorization headers
     * Uses whitelisted headers from authManager to prevent header injection
     */
    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            ...authManager.getAuthHeader(),
        };
        return headers;
    }

    /**
     * Handle API response
     */
    async _handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    }

    /**
     * Validate payload size and shape before sending
     * @param {Object} data - Data to validate
     * @param {string} operation - Operation name for error messages
     * @throws {Error} If validation fails
     */
    async _validatePayload(data, operation) {
        if (!this.config) {
            this.config = await configPromise;
        }

        // Validate text fields
        if (data.description) {
            const result = validateAgainstConfig(
                this.config,
                'maxTextFieldLength',
                data.description,
                'Description'
            );
            if (!result.valid) {
                throw new Error(`${operation}: ${result.error}`);
            }
        }

        if (data.rules) {
            const result = validateAgainstConfig(
                this.config,
                'maxTextFieldLength',
                data.rules,
                'Rules'
            );
            if (!result.valid) {
                throw new Error(`${operation}: ${result.error}`);
            }
        }

        if (data.notes) {
            const result = validateAgainstConfig(
                this.config,
                'maxTextFieldLength',
                data.notes,
                'Notes'
            );
            if (!result.valid) {
                throw new Error(`${operation}: ${result.error}`);
            }
        }

        // Validate numeric fields for orders
        if (data.shares !== undefined) {
            const result = validateAgainstConfig(
                this.config,
                'maxSharesPerOrder',
                data.shares,
                'Shares'
            );
            if (!result.valid) {
                throw new Error(`${operation}: ${result.error}`);
            }
        }

        if (data.price !== undefined) {
            const result = validateAgainstConfig(
                this.config,
                'maxPricePerShare',
                data.price,
                'Price'
            );
            if (!result.valid) {
                throw new Error(`${operation}: ${result.error}`);
            }
        }
    }

    /**
     * List all BullPens
     */
    async listBullPens(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${this.apiUrl}/bull-pens?${params}`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Get user's BullPens
     */
    async getMyBullPens() {
        const response = await fetch(`${this.apiUrl}/my/bull-pens`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Get BullPen details
     */
    async getBullPen(id) {
        const response = await fetch(`${this.apiUrl}/bull-pens/${id}`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Create new BullPen
     */
    async createBullPen(data) {
        // Validate payload before sending
        await this._validatePayload(data, 'Create BullPen');

        const response = await fetchWithRetry(`${this.apiUrl}/bull-pens`, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify(data),
        });
        return this._handleResponse(response);
    }

    /**
     * Update BullPen
     */
    async updateBullPen(id, data) {
        // Validate payload before sending
        await this._validatePayload(data, 'Update BullPen');

        const response = await fetchWithRetry(`${this.apiUrl}/bull-pens/${id}`, {
            method: 'PATCH',
            headers: this._getHeaders(),
            body: JSON.stringify(data),
        });
        return this._handleResponse(response);
    }

    /**
     * Join BullPen
     */
    async joinBullPen(id, inviteCode = null) {
        const response = await fetch(`${this.apiUrl}/bull-pens/${id}/join`, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify({ inviteCode }),
        });
        return this._handleResponse(response);
    }

    /**
     * Leave BullPen
     */
    async leaveBullPen(id) {
        const response = await fetch(`${this.apiUrl}/bull-pens/${id}/leave`, {
            method: 'POST',
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Get BullPen members
     */
    async getMembers(id) {
        const response = await fetch(`${this.apiUrl}/bull-pens/${id}/members`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Place order
     */
    async placeOrder(bullPenId, orderData) {
        // Validate payload before sending
        await this._validatePayload(orderData, 'Place Order');

        const response = await fetchWithRetry(`${this.apiUrl}/bull-pens/${bullPenId}/orders`, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify(orderData),
        });
        return this._handleResponse(response);
    }

    /**
     * Get orders
     */
    async getOrders(bullPenId, mine = true) {
        const params = new URLSearchParams({ mine: mine.toString() });
        const response = await fetch(`${this.apiUrl}/bull-pens/${bullPenId}/orders?${params}`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Get positions
     */
    async getPositions(bullPenId, mine = true) {
        const params = new URLSearchParams({ mine: mine.toString() });
        const response = await fetch(`${this.apiUrl}/bull-pens/${bullPenId}/positions?${params}`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Get leaderboard
     */
    async getLeaderboard(bullPenId) {
        const response = await fetch(`${this.apiUrl}/bull-pens/${bullPenId}/leaderboard`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Get market data for symbol
     */
    async getMarketData(symbol) {
        const response = await fetch(`${this.apiUrl}/market-data/${symbol}`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * Get market data for multiple symbols
     */
    async getMultipleMarketData(symbols) {
        if (!this.config) {
            this.config = await configPromise;
        }

        // Deduplicate symbols to avoid wasting backend work
        const uniqueSymbols = [...new Set(symbols)];

        // Validate symbol count
        const result = validateAgainstConfig(
            this.config,
            'maxSymbolsPerRequest',
            uniqueSymbols,
            'Symbols'
        );
        if (!result.valid) {
            throw new Error(`Get Market Data: ${result.error}`);
        }

        const params = new URLSearchParams({ symbols: uniqueSymbols.join(',') });
        const response = await fetchWithRetry(`${this.apiUrl}/market-data?${params}`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }
}


