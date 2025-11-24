/**
 * Leaderboard Component
 * Displays tournament rankings
 */

import { formatCurrency, formatPercent, formatDateTime, getRankClass, showError } from './utils.js';
import { authManager } from '../auth.js';

export class Leaderboard {
    constructor(api, bullPenId) {
        this.api = api;
        this.bullPenId = bullPenId;
        this.leaderboard = [];
    }

    /**
     * Initialize leaderboard
     */
    async init() {
        await this.loadLeaderboard();
        
        // Listen for trade executions
        window.addEventListener('trade-executed', () => {
            this.loadLeaderboard();
        });
        
        // Auto-refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadLeaderboard();
        }, 30000);
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    /**
     * Load leaderboard from API
     */
    async loadLeaderboard() {
        try {
            const data = await this.api.getLeaderboard(this.bullPenId);
            this.leaderboard = data.leaderboard || [];
            this.render();
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            showError('Failed to load leaderboard: ' + error.message);
        }
    }

    /**
     * Render leaderboard
     */
    render() {
        const container = document.getElementById('leaderboardPanel');
        if (!container) return;

        if (this.leaderboard.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No rankings yet.</p>
                    <p>Start trading to appear on the leaderboard!</p>
                </div>
            `;
            return;
        }

        const currentUser = authManager.getUser();
        const currentUserId = currentUser?.id;

        container.innerHTML = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Portfolio Value</th>
                        <th>Return</th>
                        <th>P&L</th>
                        <th>Last Trade</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.leaderboard.map(entry => this.renderLeaderboardRow(entry, currentUserId)).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Render single leaderboard row
     */
    renderLeaderboardRow(entry, currentUserId) {
        const isCurrentUser = entry.userId === currentUserId;
        const rowClass = isCurrentUser ? 'current-user' : '';
        const rankClass = getRankClass(entry.rank);
        
        const pnlClass = entry.pnlAbs >= 0 ? 'positive' : 'negative';
        const lastTrade = entry.lastTradeAt ? formatDateTime(entry.lastTradeAt) : 'No trades';

        return `
            <tr class="${rowClass}">
                <td>
                    <span class="rank-badge ${rankClass}">${entry.rank}</span>
                </td>
                <td>
                    ${entry.userName}${isCurrentUser ? ' (You)' : ''}
                </td>
                <td>${formatCurrency(entry.portfolioValue)}</td>
                <td class="${pnlClass}">${formatPercent(entry.pnlPct)}</td>
                <td class="${pnlClass}">${formatCurrency(entry.pnlAbs)}</td>
                <td>${lastTrade}</td>
            </tr>
        `;
    }

    /**
     * Refresh leaderboard
     */
    async refresh() {
        await this.loadLeaderboard();
    }
}

