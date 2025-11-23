/**
 * Chart Rendering Module
 * Handles all Chart.js visualizations with proper cleanup
 */

import { SECTOR_COLORS, ASSET_CLASS_COLORS, CHART_CONFIG, TREND_COLORS } from './constants.js';
import { formatCurrency, formatPercent, getTrendDirection, calculateMovingAverage } from './utils.js';

// Chart instances registry for proper cleanup
const chartInstances = {};

/**
 * Safely destroy a chart instance
 * @param {string} chartId - Chart identifier
 */
function destroyChart(chartId) {
    if (chartInstances[chartId]) {
        chartInstances[chartId].destroy();
        delete chartInstances[chartId];
    }
}

/**
 * Create or update sector allocation pie chart
 * @param {Array} holdings - Holdings array
 * @param {Object} currentPrices - Current prices by ticker
 */
export function renderSectorChart(holdings, currentPrices) {
    const sectorData = {};
    holdings.forEach(holding => {
        const value = holding.shares * (currentPrices[holding.ticker] || 0);
        sectorData[holding.sector] = (sectorData[holding.sector] || 0) + value;
    });

    const ctx = document.getElementById('sectorChart')?.getContext('2d');
    if (!ctx) return;

    destroyChart('sector');

    chartInstances.sector = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(sectorData),
            datasets: [{
                data: Object.values(sectorData),
                backgroundColor: Object.keys(sectorData).map(s => SECTOR_COLORS[s] || '#999')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (context) => context.label + ': ' + formatCurrency(context.raw)
                    }
                }
            }
        }
    });
}

/**
 * Create or update asset class allocation pie chart
 * @param {Array} holdings - Holdings array
 * @param {Object} currentPrices - Current prices by ticker
 */
export function renderAssetClassChart(holdings, currentPrices) {
    const assetData = {};
    holdings.forEach(holding => {
        const value = holding.shares * (currentPrices[holding.ticker] || 0);
        assetData[holding.asset_class] = (assetData[holding.asset_class] || 0) + value;
    });

    const ctx = document.getElementById('assetClassChart')?.getContext('2d');
    if (!ctx) return;

    destroyChart('assetClass');

    chartInstances.assetClass = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(assetData),
            datasets: [{
                data: Object.values(assetData),
                backgroundColor: ASSET_CLASS_COLORS
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (context) => context.label + ': ' + formatCurrency(context.raw)
                    }
                }
            }
        }
    });
}

/**
 * Create or update performance bar chart
 * @param {Array} holdings - Holdings array
 * @param {Object} currentPrices - Current prices by ticker
 */
export function renderPerformanceChart(holdings, currentPrices) {
    const performanceData = holdings.map(holding => {
        const currentPrice = currentPrices[holding.ticker] || holding.purchase_price;
        return {
            ticker: holding.ticker,
            percent: ((currentPrice - holding.purchase_price) / holding.purchase_price) * 100
        };
    });

    const ctx = document.getElementById('performanceChart')?.getContext('2d');
    if (!ctx) return;

    destroyChart('performance');

    chartInstances.performance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: performanceData.map(d => d.ticker),
            datasets: [{
                label: 'Gain/Loss %',
                data: performanceData.map(d => d.percent),
                backgroundColor: performanceData.map(d => 
                    d.percent >= 0 ? TREND_COLORS.POSITIVE.CHART_LINE : TREND_COLORS.NEGATIVE.CHART_LINE
                )
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => formatPercent(context.raw)
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => value + '%'
                    }
                }
            }
        }
    });
}

/**
 * Create or update dividend timeline chart
 * @param {Array} dividends - Dividends array
 */
export function renderDividendChart(dividends) {
    const dividendsByMonth = {};
    dividends.forEach(div => {
        const date = new Date(div.date);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const amount = div.amount * div.shares;
        dividendsByMonth[monthKey] = (dividendsByMonth[monthKey] || 0) + amount;
    });

    const sortedMonths = Object.keys(dividendsByMonth).sort((a, b) => new Date(a) - new Date(b));

    const ctx = document.getElementById('dividendChart')?.getContext('2d');
    if (!ctx) return;

    destroyChart('dividend');

    chartInstances.dividend = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Dividend Income',
                data: sortedMonths.map(m => dividendsByMonth[m]),
                backgroundColor: '#21808D'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => formatCurrency(context.raw)
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => '$' + value
                    }
                }
            }
        }
    });
}

/**
 * Cleanup all chart instances
 */
export function destroyAllCharts() {
    Object.keys(chartInstances).forEach(chartId => {
        destroyChart(chartId);
    });
}

