/**
 * BullPen API Service
 * Handles all API calls for trade room functionality
 */

import { authManager } from '../auth.js';

export class BullPenAPI {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    /**
     * Get authorization headers
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
        const response = await fetch(`${this.apiUrl}/bull-pens`, {
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
        const response = await fetch(`${this.apiUrl}/bull-pens/${id}`, {
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
        const response = await fetch(`${this.apiUrl}/bull-pens/${bullPenId}/orders`, {
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
        // Deduplicate symbols to avoid wasting backend work
        const uniqueSymbols = [...new Set(symbols)];
        const params = new URLSearchParams({ symbols: uniqueSymbols.join(',') });
        const response = await fetch(`${this.apiUrl}/market-data?${params}`, {
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }
}


