/**
 * User Interactions Module
 * Handles sparkline tooltips, detail charts, and other interactions
 */

import { formatCurrency, formatPercent, calculateMovingAverage } from './utils.js';
import { TREND_COLORS, CHART_CONFIG } from './constants.js';

let detailChart = null;

/**
 * Find sparkline element from event target (handles nested SVG elements)
 * @param {HTMLElement} target - Event target
 * @returns {HTMLElement|null} Sparkline element or null
 */
function findSparklineElement(target) {
    // Check if target itself is a sparkline
    if (target.classList && target.classList.contains('sparkline')) {
        return target;
    }

    // Check if parent is a sparkline (for nested SVG elements)
    if (target.parentElement && target.parentElement.classList && target.parentElement.classList.contains('sparkline')) {
        return target.parentElement;
    }

    return null;
}

/**
 * Setup sparkline hover and click interactions
 * @param {Object} state - Application state
 */
export function setupSparklineInteractions(state) {
    const tooltip = document.getElementById('sparklineTooltip');
    if (!tooltip) return;

    let currentHoverTicker = null;

    document.addEventListener('mousemove', (e) => {
        const sparklineEl = findSparklineElement(e.target);

        if (sparklineEl) {
            const ticker = sparklineEl.getAttribute('data-ticker');
            currentHoverTicker = ticker;

            const data = state.trendData[ticker];
            if (!data) return;

            const high = Math.max(...data);
            const low = Math.min(...data);
            const first = data[0];
            const last = data[data.length - 1];
            const change = ((last - first) / first) * 100;

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 29);

            const tooltipHigh = document.getElementById('tooltipHigh');
            const tooltipLow = document.getElementById('tooltipLow');
            const tooltipChange = document.getElementById('tooltipChange');
            const tooltipRange = document.getElementById('tooltipRange');

            if (tooltipHigh) tooltipHigh.textContent = formatCurrency(high);
            if (tooltipLow) tooltipLow.textContent = formatCurrency(low);
            if (tooltipChange) {
                tooltipChange.textContent = formatPercent(change);
                tooltipChange.className = 'tooltip-value ' + (change >= 0 ? 'positive' : 'negative');
            }
            if (tooltipRange) {
                tooltipRange.textContent =
                    startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' - ' +
                    endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            tooltip.classList.add('active');

            // Position tooltip
            const offsetX = 15;
            const offsetY = 15;
            let left = e.pageX + offsetX;
            let top = e.pageY + offsetY;

            // Keep tooltip in viewport
            const tooltipRect = tooltip.getBoundingClientRect();
            if (left + tooltipRect.width > window.innerWidth) {
                left = e.pageX - tooltipRect.width - offsetX;
            }
            if (top + tooltipRect.height > window.innerHeight) {
                top = e.pageY - tooltipRect.height - offsetY;
            }

            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        } else {
            if (currentHoverTicker) {
                tooltip.classList.remove('active');
                currentHoverTicker = null;
            }
        }
    });

    // Click to show detail chart
    document.addEventListener('click', (e) => {
        const sparklineEl = findSparklineElement(e.target);

        if (sparklineEl) {
            const ticker = sparklineEl.getAttribute('data-ticker');
            showDetailChart(ticker, state);
        }
    });

    // Keyboard support for sparklines
    document.addEventListener('keydown', (e) => {
        const sparklineEl = findSparklineElement(e.target);

        if (e.key === 'Enter' && sparklineEl) {
            const ticker = sparklineEl.getAttribute('data-ticker');
            showDetailChart(ticker, state);
        }
    });
}

/**
 * Show detailed chart modal
 * @param {string} ticker - Stock ticker
 * @param {Object} state - Application state
 */
function showDetailChart(ticker, state) {
    const holding = state.holdings.find(h => h.ticker === ticker);
    if (!holding) return;
    
    const modal = document.getElementById('detailChartModal');
    const data = state.trendData[ticker];
    if (!modal || !data) return;
    
    // Update title
    const titleEl = document.getElementById('detailChartTitle');
    if (titleEl) {
        titleEl.textContent = `${ticker} - 30-Day Price History`;
    }
    
    // Calculate statistics
    const high = Math.max(...data);
    const low = Math.min(...data);
    const first = data[0];
    const last = data[data.length - 1];
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
    const volatility = Math.sqrt(variance) / avg * 100;
    const change = ((last - first) / first) * 100;
    
    // Display stats
    const statsHtml = `
        <div class="detail-stat-card">
            <div class="detail-stat-label">High</div>
            <div class="detail-stat-value">${formatCurrency(high)}</div>
        </div>
        <div class="detail-stat-card">
            <div class="detail-stat-label">Low</div>
            <div class="detail-stat-value">${formatCurrency(low)}</div>
        </div>
        <div class="detail-stat-card">
            <div class="detail-stat-label">Average</div>
            <div class="detail-stat-value">${formatCurrency(avg)}</div>
        </div>
        <div class="detail-stat-card">
            <div class="detail-stat-label">Volatility</div>
            <div class="detail-stat-value">${volatility.toFixed(2)}%</div>
        </div>
        <div class="detail-stat-card">
            <div class="detail-stat-label">30d Change</div>
            <div class="detail-stat-value ${change >= 0 ? 'positive' : 'negative'}">${formatPercent(change)}</div>
        </div>
    `;
    const statsEl = document.getElementById('detailStats');
    if (statsEl) statsEl.innerHTML = statsHtml;
    
    // Create labels for last 30 days
    const labels = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Calculate moving averages
    const ma7 = calculateMovingAverage(data, CHART_CONFIG.MOVING_AVERAGE_PERIODS.SHORT);
    const ma14 = calculateMovingAverage(data, CHART_CONFIG.MOVING_AVERAGE_PERIODS.LONG);
    
    // Generate simulated volume data
    const volumeData = data.map(() => Math.random() * 1000000 + 500000);
    
    // Destroy existing chart
    if (detailChart) {
        detailChart.destroy();
    }
    
    // Create detailed chart
    const ctx = document.getElementById('detailChart')?.getContext('2d');
    if (!ctx) return;
    
    const colors = change >= 0 ? TREND_COLORS.POSITIVE : TREND_COLORS.NEGATIVE;
    
    detailChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Price',
                    data: data,
                    borderColor: colors.CHART_LINE,
                    backgroundColor: colors.CHART_FILL,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: '7-day MA',
                    data: ma7,
                    borderColor: '#4A90E2',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: '14-day MA',
                    data: ma14,
                    borderColor: '#F5A623',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: 'Volume',
                    data: volumeData,
                    backgroundColor: 'rgba(98, 108, 113, 0.3)',
                    borderWidth: 0,
                    type: 'bar',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.yAxisID === 'y1') {
                                label += Math.round(context.parsed.y).toLocaleString();
                            } else {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Price ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Volume'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
    
    modal.classList.add('active');
    
    // Focus management for accessibility
    const closeBtn = document.getElementById('closeDetailChart');
    if (closeBtn) closeBtn.focus();
}

/**
 * Close detail chart modal
 */
export function closeDetailChartModal() {
    const modal = document.getElementById('detailChartModal');
    if (modal) {
        modal.classList.remove('active');
    }
    if (detailChart) {
        detailChart.destroy();
        detailChart = null;
    }
}

