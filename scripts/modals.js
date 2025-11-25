/**
 * Modals Module
 * Handles all modal dialogs with proper accessibility
 */

import { formatCurrency, formatPercent, sanitizeHTML } from './utils.js';
import { calculatePortfolioMetrics } from './calculations.js';
import { getInsights } from './sampleData.js';
import { closeDetailChartModal } from './interactions.js';

/**
 * Setup all modal interactions
 * @param {Object} state - Application state
 */
export function setupModals(state) {
    setupAddPositionModal();
    setupExportModal(state);
    setupInsightsModal(state);
    setupDetailChartModal();
}

/**
 * Setup add position modal
 */
function setupAddPositionModal() {
    const modal = document.getElementById('addPositionModal');
    const openBtn = document.getElementById('addPositionBtn');
    const closeBtn = document.getElementById('closeModal');
    
    if (!modal || !openBtn || !closeBtn) return;
    
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus first input
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    });
    
    closeBtn.addEventListener('click', () => {
        closeModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

/**
 * Setup export modal
 * @param {Object} state - Application state
 */
function setupExportModal(state) {
    const modal = document.getElementById('exportModal');
    const openBtn = document.getElementById('exportBtn');
    const closeBtn = document.getElementById('closeExportModal');
    
    if (!modal || !openBtn || !closeBtn) return;
    
    openBtn.addEventListener('click', () => {
        generateExportSummary(state);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    });
    
    closeBtn.addEventListener('click', () => {
        closeModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

/**
 * Setup insights modal
 * @param {Object} state - Application state
 */
function setupInsightsModal(state) {
    const modal = document.getElementById('insightsModal');
    const closeBtn = document.getElementById('closeInsightsModal');
    
    if (!modal || !closeBtn) return;
    
    // Info button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('info-btn')) {
            const ticker = e.target.getAttribute('data-ticker');
            showInsights(ticker, state);
        }
    });
    
    closeBtn.addEventListener('click', () => {
        closeModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

/**
 * Setup detail chart modal
 */
function setupDetailChartModal() {
    const modal = document.getElementById('detailChartModal');
    const closeBtn = document.getElementById('closeDetailChart');
    
    if (!modal || !closeBtn) return;
    
    closeBtn.addEventListener('click', () => {
        closeDetailChartModal();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'detailChartModal') {
            closeDetailChartModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeDetailChartModal();
        }
    });
}

/**
 * Close a modal
 * @param {HTMLElement} modal - Modal element
 */
function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

/**
 * Generate export summary
 * @param {Object} state - Application state
 */
function generateExportSummary(state) {
    const metrics = calculatePortfolioMetrics(
        state.holdings,
        state.currentPrices,
        state.previousPrices,
        state.dividends
    );
    
    const exportText = `
PORTFOLIO SUMMARY
${'='.repeat(50)}

Generated: ${new Date().toLocaleString()}

OVERVIEW
${'-'.repeat(50)}
Total Portfolio Value: ${formatCurrency(metrics.totalValue)}
Total Cost Basis: ${formatCurrency(metrics.totalCostBasis)}
Total Gain/Loss: ${formatCurrency(metrics.totalGain)} (${formatPercent(metrics.totalGainPercent)})
Today's Change: ${formatCurrency(metrics.todayChange)} (${formatPercent(metrics.todayChangePercent)})
Dividend Income YTD: ${formatCurrency(metrics.dividendIncome)}
Estimated Annual: ${formatCurrency(metrics.estimatedAnnual)}

HOLDINGS
${'-'.repeat(50)}
${state.holdings.map(h => {
const currentPrice = state.currentPrices[h.ticker] || 0;
const currentValue = h.shares * currentPrice;
const costBasis = h.shares * h.purchase_price;
const gain = currentValue - costBasis;
const gainPercent = (gain / costBasis) * 100;
return `${h.ticker} - ${h.name}
Shares: ${h.shares}
Purchase Price: ${formatCurrency(h.purchase_price)}
Current Price: ${formatCurrency(currentPrice)}
Current Value: ${formatCurrency(currentValue)}
Gain/Loss: ${formatCurrency(gain)} (${formatPercent(gainPercent)})`;
}).join('\n\n')}

This summary was generated by your Portfolio Dashboard.
    `;
    
    const contentEl = document.getElementById('exportContent');
    if (contentEl) {
        contentEl.textContent = exportText;
    }
}

/**
 * Show insights modal
 * @param {string} ticker - Stock ticker
 * @param {Object} state - Application state
 */
function showInsights(ticker, state) {
    const insights = getInsights(ticker);
    if (!insights) return;

    const holding = state.holdings.find(h => h.ticker === ticker);
    if (!holding) return;
    
    const currentPrice = state.currentPrices[ticker] || 0;
    const gainPercent = ((currentPrice - holding.purchase_price) / holding.purchase_price) * 100;

    const titleEl = document.getElementById('insightsTitle');
    if (titleEl) {
        titleEl.textContent = `${sanitizeHTML(ticker)} - ${sanitizeHTML(holding.name)}`;
    }

    const insightsHtml = `
        <div class="insights-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-16);">
                <div>
                    <strong>Current Performance:</strong> ${formatPercent(gainPercent)}
                    <span class="rating-badge">${sanitizeHTML(insights.analyst_rating)}</span>
                </div>
                <div>
                    <strong>Price Target:</strong> ${formatCurrency(insights.price_target)}
                </div>
            </div>
        </div>

        <div class="insights-section">
            <h4 class="insights-title">Analysis</h4>
            <p class="insights-text">${sanitizeHTML(insights.analysis)}</p>
        </div>

        <div class="insights-section">
            <h4 class="insights-title">Learning Points</h4>
            <ul class="insights-list">
                ${insights.learning_points.map(point => `<li>${sanitizeHTML(point)}</li>`).join('')}
            </ul>
        </div>

        <div class="insights-section">
            <h4 class="insights-title">Key Factors</h4>
            <ul class="insights-list">
                ${insights.key_factors.map(factor => `<li>${sanitizeHTML(factor)}</li>`).join('')}
            </ul>
        </div>

        <div class="insights-section">
            <h4 class="insights-title">Risks</h4>
            <ul class="insights-list">
                ${insights.risks.map(risk => `<li>${sanitizeHTML(risk)}</li>`).join('')}
            </ul>
        </div>
    `;

    const contentEl = document.getElementById('insightsContent');
    if (contentEl) {
        contentEl.innerHTML = insightsHtml;
    }

    const modal = document.getElementById('insightsModal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
}

