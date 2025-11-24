/**
 * BullPen Detail View
 * Orchestrates the trading interface for a specific BullPen
 */

import { formatCurrency, formatPercent, formatTimeRemaining, calculateEndTime, getStatusClass, showError, showSuccess } from './utils.js';
import { TradingPanel } from './tradingPanel.js';
import { Portfolio } from './portfolio.js';
import { Leaderboard } from './leaderboard.js';
import { authManager } from '../auth.js';

export class BullPenDetail {
    constructor(api, bullPenId, onNavigate) {
        this.api = api;
        this.bullPenId = bullPenId;
        this.onNavigate = onNavigate;
        this.bullPen = null;
        this.membership = null;
        this.tradingPanel = null;
        this.portfolio = null;
        this.leaderboard = null;
    }

    /**
     * Initialize BullPen detail view
     */
    async init() {
        try {
            // Load BullPen data
            await this.loadBullPen();
            
            // Initialize components
            this.tradingPanel = new TradingPanel(this.api, this.bullPenId);
            this.portfolio = new Portfolio(this.api, this.bullPenId);
            this.leaderboard = new Leaderboard(this.api, this.bullPenId);
            
            // Render components
            this.tradingPanel.render();
            await this.portfolio.init();
            await this.leaderboard.init();
            
            // Attach event listeners
            this.attachEventListeners();
            
            // Start auto-refresh
            this.startAutoRefresh();
            
        } catch (error) {
            console.error('Failed to initialize BullPen detail:', error);
            showError('Failed to load BullPen: ' + error.message);
            this.onNavigate('dashboard');
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.leaderboard) {
            this.leaderboard.destroy();
        }
    }

    /**
     * Load BullPen data
     */
    async loadBullPen() {
        const data = await this.api.getBullPen(this.bullPenId);
        this.bullPen = data.bullPen;
        this.renderHeader();
        await this.loadPortfolioSummary();
    }

    /**
     * Render BullPen header
     */
    renderHeader() {
        const nameEl = document.getElementById('bullpenName');
        const statusEl = document.getElementById('bullpenStatus');
        const timeEl = document.getElementById('bullpenTime');
        const participantsEl = document.getElementById('bullpenParticipants');
        const inviteCodeBtn = document.getElementById('inviteCodeBtn');
        const inviteCodeText = document.getElementById('inviteCodeText');
        
        if (nameEl) nameEl.textContent = this.bullPen.name;
        
        if (statusEl) {
            statusEl.textContent = this.bullPen.state;
            statusEl.className = `status-badge ${getStatusClass(this.bullPen.state)}`;
        }
        
        if (timeEl) {
            const endTime = calculateEndTime(this.bullPen.startTime, this.bullPen.durationSec);
            const timeRemaining = this.bullPen.state === 'active' ? formatTimeRemaining(endTime) : '--';
            timeEl.textContent = `Time remaining: ${timeRemaining}`;
        }
        
        if (participantsEl) {
            participantsEl.textContent = `${this.bullPen.maxPlayers} max participants`;
        }
        
        // Show invite code if user is host
        const currentUser = authManager.getUser();
        if (inviteCodeBtn && inviteCodeText && this.bullPen.hostUserId === currentUser?.id && this.bullPen.inviteCode) {
            inviteCodeText.textContent = `Invite Code: ${this.bullPen.inviteCode}`;
            inviteCodeBtn.style.display = 'block';
            inviteCodeBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(this.bullPen.inviteCode);
                showSuccess('Invite code copied to clipboard!');
            });
        }
    }

    /**
     * Load portfolio summary
     */
    async loadPortfolioSummary() {
        try {
            const leaderboardData = await this.api.getLeaderboard(this.bullPenId);
            const currentUser = authManager.getUser();
            const userEntry = leaderboardData.leaderboard.find(entry => entry.userId === currentUser?.id);
            
            if (userEntry) {
                this.updatePortfolioSummary(userEntry, leaderboardData.startingCash);
            }
        } catch (error) {
            console.error('Failed to load portfolio summary:', error);
        }
    }

    /**
     * Update portfolio summary display
     */
    updatePortfolioSummary(userEntry, startingCash) {
        const cashEl = document.getElementById('cashBalance');
        const portfolioEl = document.getElementById('portfolioValue');
        const returnEl = document.getElementById('totalReturn');
        const returnPctEl = document.getElementById('totalReturnPercent');
        const rankEl = document.getElementById('userRank');
        
        if (cashEl) cashEl.textContent = formatCurrency(userEntry.cash);
        if (portfolioEl) portfolioEl.textContent = formatCurrency(userEntry.portfolioValue);
        if (returnEl) returnEl.textContent = formatCurrency(userEntry.pnlAbs);
        
        if (returnPctEl) {
            const pnlClass = userEntry.pnlAbs >= 0 ? 'positive' : 'negative';
            returnPctEl.textContent = formatPercent(userEntry.pnlPct);
            returnPctEl.className = `summary-change ${pnlClass}`;
        }
        
        if (rankEl) rankEl.textContent = `#${userEntry.rank}`;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const backBtn = document.getElementById('backToDashboardBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.destroy();
                this.onNavigate('dashboard');
            });
        }

        // Listen for trade executions to refresh summary
        window.addEventListener('trade-executed', () => {
            this.loadPortfolioSummary();
        });
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        // Refresh portfolio summary every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadPortfolioSummary();
        }, 30000);
    }

    /**
     * Refresh all data
     */
    async refresh() {
        await this.loadBullPen();
        if (this.portfolio) await this.portfolio.refresh();
        if (this.leaderboard) await this.leaderboard.refresh();
    }
}


