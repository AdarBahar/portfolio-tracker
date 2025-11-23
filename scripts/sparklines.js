/**
 * Sparkline Rendering Module
 * Handles mini trend charts in the holdings table
 */

import { CHART_CONFIG, TREND_COLORS } from './constants.js';
import { getTrendDirection } from './utils.js';

// Animation state for sparklines
const sparklineAnimations = {};

/**
 * Render a single sparkline
 * @param {string} ticker - Stock ticker
 * @param {number[]} data - Price data array
 * @param {boolean} animate - Whether to animate the drawing
 */
export function renderSparkline(ticker, data, animate = false) {
    const canvas = document.getElementById(`sparkline-${ticker}`);
    if (!canvas || !data || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = CHART_CONFIG.SPARKLINE_PADDING;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;
    
    // Calculate min/max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    // Determine trend color
    const firstPrice = data[0];
    const lastPrice = data[data.length - 1];
    const { isPositive, isFlat } = getTrendDirection(firstPrice, lastPrice);
    
    let lineColor, fillColor;
    if (isFlat) {
        lineColor = TREND_COLORS.NEUTRAL.LINE;
        fillColor = TREND_COLORS.NEUTRAL.FILL;
    } else if (isPositive) {
        lineColor = TREND_COLORS.POSITIVE.LINE;
        fillColor = TREND_COLORS.POSITIVE.FILL;
    } else {
        lineColor = TREND_COLORS.NEGATIVE.LINE;
        fillColor = TREND_COLORS.NEGATIVE.FILL;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Animation progress
    let progress = 1;
    if (animate && sparklineAnimations[ticker] !== undefined) {
        progress = sparklineAnimations[ticker];
    }
    
    const pointsToShow = Math.floor(data.length * progress);
    if (pointsToShow < 2) return;
    
    // Create path
    ctx.beginPath();
    
    for (let i = 0; i < pointsToShow; i++) {
        const x = padding + (i / (data.length - 1)) * plotWidth;
        const y = padding + plotHeight - ((data[i] - min) / range) * plotHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    // Draw fill
    const lastX = padding + ((pointsToShow - 1) / (data.length - 1)) * plotWidth;
    const lastY = padding + plotHeight - ((data[pointsToShow - 1] - min) / range) * plotHeight;
    
    ctx.lineTo(lastX, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    for (let i = 0; i < pointsToShow; i++) {
        const x = padding + (i / (data.length - 1)) * plotWidth;
        const y = padding + plotHeight - ((data[i] - min) / range) * plotHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw mini data points
    ctx.fillStyle = lineColor;
    for (let i = 0; i < pointsToShow; i += CHART_CONFIG.SPARKLINE_POINT_INTERVAL) {
        const x = padding + (i / (data.length - 1)) * plotWidth;
        const y = padding + plotHeight - ((data[i] - min) / range) * plotHeight;
        ctx.beginPath();
        ctx.arc(x, y, CHART_CONFIG.SPARKLINE_POINT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Animate sparkline drawing
 * @param {string} ticker - Stock ticker
 * @param {number[]} data - Price data array
 */
export function animateSparkline(ticker, data) {
    const duration = CHART_CONFIG.ANIMATION_DURATION;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sparklineAnimations[ticker] = progress;
        renderSparkline(ticker, data, true);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            delete sparklineAnimations[ticker];
        }
    }
    
    animate();
}

/**
 * Render all sparklines for holdings
 * @param {Array} holdings - Holdings array
 * @param {Object} trendData - Trend data by ticker
 * @param {boolean} animate - Whether to animate
 */
export function renderAllSparklines(holdings, trendData, animate = true) {
    holdings.forEach(holding => {
        const data = trendData[holding.ticker];
        if (data) {
            if (animate) {
                animateSparkline(holding.ticker, data);
            } else {
                renderSparkline(holding.ticker, data, false);
            }
        }
    });
}

