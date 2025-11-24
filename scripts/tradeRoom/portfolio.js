/**
 * Portfolio Component
 * Displays user's positions in the BullPen
 */

import { formatCurrency, formatPercent, showError } from './utils.js';

export class Portfolio {
    constructor(api, bullPenId) {
        this.api = api;
        this.bullPenId = bullPenId;
        this.positions = [];
    }

    /**
     * Initialize portfolio
     */
    async init() {
        await this.loadPositions();
        
        // Listen for trade executions
        window.addEventListener('trade-executed', () => {
            this.loadPositions();
        });
    }

    /**
     * Load positions from API
     */
    async loadPositions() {
        try {
            const data = await this.api.getPositions(this.bullPenId, true);
            this.positions = data.positions || [];
            this.render();
        } catch (error) {
            console.error('Failed to load positions:', error);
            showError('Failed to load positions: ' + error.message);
        }
    }

    /**
     * Render portfolio
     */
    render() {
        const container = document.getElementById('portfolioPanel');
        if (!container) return;

        if (this.positions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No positions yet.</p>
                    <p>Place your first trade to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="position-list">
                ${this.positions.map(pos => this.renderPosition(pos)).join('')}
            </div>
        `;
    }

    /**
     * Render single position
     */
    renderPosition(position) {
        const qty = Number(position.qty);
        const avgCost = Number(position.avgCost);
        const currentPrice = Number(position.currentPrice || avgCost); // Fallback to avg cost if no current price
        
        const positionValue = qty * currentPrice;
        const costBasis = qty * avgCost;
        const pnl = positionValue - costBasis;
        const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
        
        const pnlClass = pnl >= 0 ? 'positive' : 'negative';

        return `
            <div class="position-card">
                <div class="position-header">
                    <div class="position-symbol">${position.symbol}</div>
                    <div class="position-pnl ${pnlClass}">
                        ${formatCurrency(pnl)} (${formatPercent(pnlPercent)})
                    </div>
                </div>
                <div class="position-details">
                    <div class="position-detail-item">
                        <div class="position-detail-label">Quantity</div>
                        <div class="position-detail-value">${qty.toLocaleString()}</div>
                    </div>
                    <div class="position-detail-item">
                        <div class="position-detail-label">Avg Cost</div>
                        <div class="position-detail-value">${formatCurrency(avgCost)}</div>
                    </div>
                    <div class="position-detail-item">
                        <div class="position-detail-label">Current Price</div>
                        <div class="position-detail-value">${formatCurrency(currentPrice)}</div>
                    </div>
                    <div class="position-detail-item">
                        <div class="position-detail-label">Cost Basis</div>
                        <div class="position-detail-value">${formatCurrency(costBasis)}</div>
                    </div>
                    <div class="position-detail-item">
                        <div class="position-detail-label">Market Value</div>
                        <div class="position-detail-value">${formatCurrency(positionValue)}</div>
                    </div>
                    ${position.instrumentType === 'option' ? `
                        <div class="position-detail-item">
                            <div class="position-detail-label">Type</div>
                            <div class="position-detail-value">${position.optionType} @ ${formatCurrency(position.strikePrice)}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Refresh positions
     */
    async refresh() {
        await this.loadPositions();
    }
}

