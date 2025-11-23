/**
 * UI Module
 * Handles all DOM manipulation and user interactions
 */

import { formatCurrency, formatPercent, sanitizeHTML, validateTicker, validateShares, validatePrice, validateDate } from './utils.js';
import { calculatePortfolioMetrics, calculatePerformanceMetrics, calculateAverageDividendYield, calculatePortfolioBeta } from './calculations.js';
import { renderSectorChart, renderAssetClassChart, renderPerformanceChart, renderDividendChart } from './charts.js';
import { renderAllSparklines } from './sparklines.js';
import { getRecommendation, getInsights } from './sampleData.js';
import { DEFAULT_TRANSACTION_FEE, ERROR_MESSAGES } from './constants.js';

/**
 * Update metrics display
 * @param {Object} state - Application state
 */
export function updateMetrics(state) {
    try {
        const metrics = calculatePortfolioMetrics(
            state.holdings,
            state.currentPrices,
            state.previousPrices,
            state.dividends
        );

        const totalValueEl = document.getElementById('totalValue');
        if (totalValueEl) totalValueEl.textContent = formatCurrency(metrics.totalValue);
        
        const gainElement = document.getElementById('totalGain');
        if (gainElement) {
            gainElement.textContent = formatCurrency(metrics.totalGain);
            gainElement.className = 'metric-value ' + (metrics.totalGain >= 0 ? 'positive' : 'negative');
        }

        const gainPercentElement = document.getElementById('totalGainPercent');
        if (gainPercentElement) {
            gainPercentElement.textContent = formatPercent(metrics.totalGainPercent);
            gainPercentElement.className = 'metric-change ' + (metrics.totalGain >= 0 ? 'positive' : 'negative');
        }

        const dividendIncomeEl = document.getElementById('dividendIncome');
        if (dividendIncomeEl) dividendIncomeEl.textContent = formatCurrency(metrics.dividendIncome);
        
        const estimatedAnnualEl = document.getElementById('estimatedAnnual');
        if (estimatedAnnualEl) estimatedAnnualEl.textContent = 'Est. Annual: ' + formatCurrency(metrics.estimatedAnnual);

        const todayElement = document.getElementById('todayChange');
        if (todayElement) {
            todayElement.textContent = formatCurrency(metrics.todayChange);
            todayElement.className = 'metric-value ' + (metrics.todayChange >= 0 ? 'positive' : 'negative');
        }

        const todayPercentElement = document.getElementById('todayChangePercent');
        if (todayPercentElement) {
            todayPercentElement.textContent = formatPercent(metrics.todayChangePercent);
            todayPercentElement.className = 'metric-change ' + (metrics.todayChange >= 0 ? 'positive' : 'negative');
        }

        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (lastUpdatedEl) lastUpdatedEl.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
    } catch (error) {
        console.error('Error updating metrics:', error);
        showError('Failed to update portfolio metrics');
    }
}

/**
 * Update holdings table
 * @param {Object} state - Application state
 */
export function updateHoldingsTable(state) {
    try {
        const tbody = document.getElementById('holdingsBody');
        if (!tbody) return;
        
        const filteredHoldings = state.getFilteredHoldings();
        
        tbody.innerHTML = filteredHoldings.map(holding => {
            const currentPrice = state.currentPrices[holding.ticker] || 0;
            const currentValue = holding.shares * currentPrice;
            const costBasis = holding.shares * holding.purchase_price;
            const gainLoss = currentValue - costBasis;
            const gainLossPercent = (gainLoss / costBasis) * 100;

            const sparklineId = `sparkline-${holding.ticker}`;
            
            // Sanitize user-provided data
            const safeTicker = sanitizeHTML(holding.ticker);
            const safeName = sanitizeHTML(holding.name);
            const safeSector = sanitizeHTML(holding.sector);
            
            return `
                <tr>
                    <td><strong style="color: var(--color-primary);">${safeTicker}</strong></td>
                    <td>${safeName}</td>
                    <td>${holding.shares}</td>
                    <td>${formatCurrency(holding.purchase_price)}</td>
                    <td>${formatCurrency(currentPrice)}</td>
                    <td>
                        <canvas id="${sparklineId}" 
                                class="sparkline" 
                                width="100" 
                                height="35"
                                data-ticker="${safeTicker}"
                                style="cursor: pointer;"
                                role="img"
                                aria-label="30-day price trend for ${safeTicker}"></canvas>
                    </td>
                    <td><strong>${formatCurrency(currentValue)}</strong></td>
                    <td class="${gainLoss >= 0 ? 'positive' : 'negative'}">
                        <strong>${formatCurrency(gainLoss)}</strong>
                    </td>
                    <td class="${gainLoss >= 0 ? 'positive' : 'negative'}">
                        <strong>${formatPercent(gainLossPercent)}</strong>
                    </td>
                    <td><span class="recommendation-badge recommendation-${getRecommendation(holding.ticker).toLowerCase()}">${getRecommendation(holding.ticker)}</span></td>
                    <td><button class="info-btn" data-ticker="${safeTicker}" title="View insights" aria-label="View insights for ${safeTicker}">💡</button></td>
                    <td>${safeSector}</td>
                </tr>
            `;
        }).join('');
        
        // Render sparklines after table update
        setTimeout(() => renderAllSparklines(filteredHoldings, state.trendData, false), 0);
    } catch (error) {
        console.error('Error updating holdings table:', error);
        showError('Failed to update holdings table');
    }
}

/**
 * Update performance metrics
 * @param {Object} state - Application state
 */
export function updatePerformanceMetrics(state) {
    try {
        const metrics = calculatePortfolioMetrics(
            state.holdings,
            state.currentPrices,
            state.previousPrices,
            state.dividends
        );
        
        const beta = calculatePortfolioBeta(state.holdings);
        const betaEl = document.getElementById('portfolioBeta');
        if (betaEl) betaEl.textContent = beta.toFixed(2);

        const avgYield = calculateAverageDividendYield(state.dividends, metrics.totalValue);
        const avgYieldEl = document.getElementById('avgDivYield');
        if (avgYieldEl) avgYieldEl.textContent = avgYield.toFixed(2) + '%';

        const { bestPerformer, worstPerformer, bestGain, worstGain } = 
            calculatePerformanceMetrics(state.holdings, state.currentPrices);

        const bestEl = document.getElementById('bestPerformer');
        if (bestEl && bestPerformer) {
            bestEl.textContent = `${bestPerformer.ticker} (${formatPercent(bestGain)})`;
        }

        const worstEl = document.getElementById('worstPerformer');
        if (worstEl && worstPerformer) {
            worstEl.textContent = `${worstPerformer.ticker} (${formatPercent(worstGain)})`;
        }

        const costBasisEl = document.getElementById('totalCostBasis');
        if (costBasisEl) costBasisEl.textContent = formatCurrency(metrics.totalCostBasis);
    } catch (error) {
        console.error('Error updating performance metrics:', error);
    }
}

/**
 * Update all charts
 * @param {Object} state - Application state
 */
export function updateCharts(state) {
    try {
        renderSectorChart(state.holdings, state.currentPrices);
        renderAssetClassChart(state.holdings, state.currentPrices);
        renderPerformanceChart(state.holdings, state.currentPrices);
        renderDividendChart(state.dividends);
    } catch (error) {
        console.error('Error updating charts:', error);
        showError('Failed to update charts');
    }
}

/**
 * Update dividend list
 * @param {Object} state - Application state
 */
export function updateDividendList(state) {
    try {
        const sortedDividends = [...state.dividends].sort((a, b) => new Date(b.date) - new Date(a.date));
        const dividendList = document.getElementById('dividendList');
        if (!dividendList) return;

        dividendList.innerHTML = sortedDividends.slice(0, 10).map(div => {
            const total = div.amount * div.shares;
            const safeTicker = sanitizeHTML(div.ticker);
            return `
                <div class="dividend-item">
                    <div class="dividend-info">
                        <span class="dividend-ticker">${safeTicker}</span>
                        <span class="dividend-date">${new Date(div.date).toLocaleDateString()}</span>
                        <span>$${div.amount.toFixed(2)} × ${div.shares} shares</span>
                    </div>
                    <div class="dividend-amount">${formatCurrency(total)}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error updating dividend list:', error);
    }
}

/**
 * Update transactions table
 * @param {Object} state - Application state
 */
export function updateTransactions(state) {
    try {
        const tbody = document.getElementById('transactionsBody');
        if (!tbody) return;

        const sortedTransactions = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedTransactions.map(tx => {
            const total = tx.shares * tx.price + tx.fees;
            const safeTicker = sanitizeHTML(tx.ticker);
            const safeType = sanitizeHTML(tx.type);
            return `
                <tr>
                    <td>${new Date(tx.date).toLocaleDateString()}</td>
                    <td><span style="text-transform: uppercase; font-weight: 500;">${safeType}</span></td>
                    <td><strong style="color: var(--color-primary);">${safeTicker}</strong></td>
                    <td>${tx.shares}</td>
                    <td>${formatCurrency(tx.price)}</td>
                    <td>${formatCurrency(tx.fees)}</td>
                    <td><strong>${formatCurrency(total)}</strong></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error updating transactions:', error);
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message
 */
export function showError(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

/**
 * Show success message to user
 * @param {string} message - Success message
 */
export function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Validate and get form data for new position
 * @returns {{valid: boolean, data: Object|null, errors: Array}}
 */
export function validatePositionForm() {
    const errors = [];

    const ticker = document.getElementById('ticker')?.value.trim().toUpperCase();
    const companyName = document.getElementById('companyName')?.value.trim();
    const shares = document.getElementById('shares')?.value;
    const purchasePrice = document.getElementById('purchasePrice')?.value;
    const purchaseDate = document.getElementById('purchaseDate')?.value;
    const sector = document.getElementById('sector')?.value;
    const assetClass = document.getElementById('assetClass')?.value;

    // Validate ticker
    const tickerValidation = validateTicker(ticker);
    if (!tickerValidation.valid) {
        errors.push(tickerValidation.error);
    }

    // Validate company name
    if (!companyName || companyName.length === 0) {
        errors.push('Company name is required');
    }

    // Validate shares
    const sharesValidation = validateShares(shares);
    if (!sharesValidation.valid) {
        errors.push(sharesValidation.error);
    }

    // Validate price
    const priceValidation = validatePrice(purchasePrice);
    if (!priceValidation.valid) {
        errors.push(priceValidation.error);
    }

    // Validate date
    const dateValidation = validateDate(purchaseDate);
    if (!dateValidation.valid) {
        errors.push(dateValidation.error);
    }

    if (errors.length > 0) {
        return { valid: false, data: null, errors };
    }

    return {
        valid: true,
        errors: [],
        data: {
            ticker,
            name: companyName,
            shares: parseFloat(shares),
            purchase_price: parseFloat(purchasePrice),
            purchase_date: purchaseDate,
            sector,
            asset_class: assetClass,
        }
    };
}

