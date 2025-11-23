/**
 * Financial Calculations
 * Pure functions for portfolio metrics and calculations
 */

import { CURRENT_YEAR, PRICE_SIMULATION, DEFAULT_PORTFOLIO_BETA } from './constants.js';
import { safeDivide } from './utils.js';

/**
 * Generate simulated trend data for a stock
 * @param {string} ticker - Stock ticker
 * @param {number} purchasePrice - Purchase price
 * @param {number} currentPrice - Current price
 * @returns {number[]} Array of prices over time
 */
export function generateTrendData(ticker, purchasePrice, currentPrice) {
    const days = PRICE_SIMULATION.TREND_DAYS;
    const data = [];
    const startPrice = purchasePrice;
    const endPrice = currentPrice;
    
    // Generate smooth trend from purchase price to current price
    for (let i = 0; i < days; i++) {
        const progress = i / (days - 1);
        const basePrice = startPrice + (endPrice - startPrice) * progress;
        
        // Add volatility (±2-5% daily)
        const volatility = PRICE_SIMULATION.TREND_VOLATILITY_MIN + 
                          Math.random() * (PRICE_SIMULATION.TREND_VOLATILITY_MAX - PRICE_SIMULATION.TREND_VOLATILITY_MIN);
        const change = (Math.random() - 0.5) * 2 * volatility;
        const price = basePrice * (1 + change);
        
        data.push(Math.max(price, 0.01));
    }
    
    // Ensure last price matches current price
    data[data.length - 1] = currentPrice;
    
    return data;
}

/**
 * Calculate initial price with random fluctuation
 * @param {number} purchasePrice - Purchase price
 * @returns {number} Simulated current price
 */
export function calculateInitialPrice(purchasePrice) {
    const fluctuation = 1 + (Math.random() * 
        (PRICE_SIMULATION.INITIAL_FLUCTUATION_MAX - PRICE_SIMULATION.INITIAL_FLUCTUATION_MIN) + 
        PRICE_SIMULATION.INITIAL_FLUCTUATION_MIN);
    return purchasePrice * fluctuation;
}

/**
 * Simulate price change
 * @param {number} currentPrice - Current price
 * @returns {number} New price
 */
export function simulatePriceChange(currentPrice) {
    const change = (Math.random() - 0.5) * 2 * PRICE_SIMULATION.DAILY_CHANGE_MAX;
    return Math.max(currentPrice * (1 + change), 0.01);
}

/**
 * Calculate portfolio metrics
 * @param {Array} holdings - Array of holdings
 * @param {Object} currentPrices - Current prices by ticker
 * @param {Object} previousPrices - Previous prices by ticker
 * @param {Array} dividends - Array of dividend payments
 * @returns {Object} Portfolio metrics
 */
export function calculatePortfolioMetrics(holdings, currentPrices, previousPrices, dividends) {
    try {
        let totalValue = 0;
        let totalCostBasis = 0;
        let todayChange = 0;

        holdings.forEach(holding => {
            const currentPrice = currentPrices[holding.ticker] || 0;
            const previousPrice = previousPrices[holding.ticker] || currentPrice;
            
            const currentValue = holding.shares * currentPrice;
            const costBasis = holding.shares * holding.purchase_price;
            const previousValue = holding.shares * previousPrice;
            
            totalValue += currentValue;
            totalCostBasis += costBasis;
            todayChange += (currentValue - previousValue);
        });

        const totalGain = totalValue - totalCostBasis;
        const totalGainPercent = safeDivide(totalGain * 100, totalCostBasis, 0);
        const todayChangePercent = safeDivide(todayChange * 100, (totalValue - todayChange), 0);

        // Calculate YTD dividend income
        const dividendIncome = dividends
            .filter(d => new Date(d.date).getFullYear() === CURRENT_YEAR)
            .reduce((sum, d) => sum + (d.amount * d.shares), 0);

        // Calculate estimated annual dividend (sum of last 4 quarters or annualize YTD)
        const estimatedAnnual = calculateEstimatedAnnualDividend(dividends);

        return {
            totalValue,
            totalCostBasis,
            totalGain,
            totalGainPercent,
            todayChange,
            todayChangePercent,
            dividendIncome,
            estimatedAnnual,
        };
    } catch (error) {
        console.error('Error calculating portfolio metrics:', error);
        return {
            totalValue: 0,
            totalCostBasis: 0,
            totalGain: 0,
            totalGainPercent: 0,
            todayChange: 0,
            todayChangePercent: 0,
            dividendIncome: 0,
            estimatedAnnual: 0,
        };
    }
}

/**
 * Calculate estimated annual dividend income
 * @param {Array} dividends - Array of dividend payments
 * @returns {number} Estimated annual dividend
 */
function calculateEstimatedAnnualDividend(dividends) {
    if (dividends.length === 0) return 0;
    
    // Group dividends by ticker and calculate quarterly average
    const tickerDividends = {};
    
    dividends.forEach(div => {
        if (!tickerDividends[div.ticker]) {
            tickerDividends[div.ticker] = [];
        }
        tickerDividends[div.ticker].push(div.amount * div.shares);
    });
    
    // For each ticker, estimate annual based on average payment * 4 (quarterly)
    let estimatedAnnual = 0;
    
    Object.values(tickerDividends).forEach(payments => {
        const avgPayment = payments.reduce((sum, p) => sum + p, 0) / payments.length;
        estimatedAnnual += avgPayment * 4; // Assume quarterly payments
    });
    
    return estimatedAnnual;
}

/**
 * Calculate performance metrics for holdings
 * @param {Array} holdings - Array of holdings
 * @param {Object} currentPrices - Current prices by ticker
 * @returns {Object} Performance metrics
 */
export function calculatePerformanceMetrics(holdings, currentPrices) {
    if (holdings.length === 0) {
        return {
            bestPerformer: null,
            worstPerformer: null,
            bestGain: 0,
            worstGain: 0,
        };
    }

    let best = holdings[0];
    let worst = holdings[0];
    let bestGain = -Infinity;
    let worstGain = Infinity;

    holdings.forEach(holding => {
        const currentPrice = currentPrices[holding.ticker] || holding.purchase_price;
        const gainPercent = safeDivide(
            (currentPrice - holding.purchase_price) * 100,
            holding.purchase_price,
            0
        );
        
        if (gainPercent > bestGain) {
            bestGain = gainPercent;
            best = holding;
        }
        if (gainPercent < worstGain) {
            worstGain = gainPercent;
            worst = holding;
        }
    });

    return { bestPerformer: best, worstPerformer: worst, bestGain, worstGain };
}

/**
 * Calculate average dividend yield
 * @param {Array} dividends - Array of dividend payments
 * @param {number} totalValue - Total portfolio value
 * @returns {number} Average dividend yield percentage
 */
export function calculateAverageDividendYield(dividends, totalValue) {
    if (totalValue === 0) return 0;
    
    const totalDividends = dividends.reduce((sum, d) => sum + (d.amount * d.shares), 0);
    return safeDivide(totalDividends * 100, totalValue, 0);
}

/**
 * Calculate portfolio beta (simplified)
 * In a real implementation, this would calculate based on stock betas and weights
 * @param {Array} holdings - Array of holdings
 * @returns {number} Portfolio beta
 */
export function calculatePortfolioBeta(holdings) {
    // Simplified: return default beta
    // TODO: Implement actual beta calculation when stock data is available
    return DEFAULT_PORTFOLIO_BETA;
}

