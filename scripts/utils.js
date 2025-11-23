/**
 * Utility Functions
 * Pure functions for formatting, validation, and calculations
 */

import { VALIDATION, ERROR_MESSAGES, FLAT_TREND_THRESHOLD } from './constants.js';

/**
 * Format number as currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '$0.00';
    }
    return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format number as percentage
 * @param {number} value - The value to format
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0.00%';
    }
    return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Validate ticker symbol
 * @param {string} ticker - Ticker to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateTicker(ticker) {
    if (!ticker || typeof ticker !== 'string') {
        return { valid: false, error: ERROR_MESSAGES.INVALID_TICKER };
    }
    
    const trimmed = ticker.trim().toUpperCase();
    
    if (trimmed.length === 0 || trimmed.length > VALIDATION.MAX_TICKER_LENGTH) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_TICKER };
    }
    
    if (!/^[A-Z0-9]+$/.test(trimmed)) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_TICKER };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate shares amount
 * @param {number} shares - Shares to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateShares(shares) {
    const num = parseFloat(shares);
    
    if (isNaN(num) || num < VALIDATION.MIN_SHARES) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_SHARES };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate price
 * @param {number} price - Price to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validatePrice(price) {
    const num = parseFloat(price);
    
    if (isNaN(num) || num < VALIDATION.MIN_PRICE) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_PRICE };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate date
 * @param {string} dateStr - Date string to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateDate(dateStr) {
    if (!dateStr) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_DATE };
    }
    
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_DATE };
    }
    
    return { valid: true, error: null };
}

/**
 * Determine trend color based on price change
 * @param {number} firstPrice - Starting price
 * @param {number} lastPrice - Ending price
 * @returns {{isPositive: boolean, isFlat: boolean}}
 */
export function getTrendDirection(firstPrice, lastPrice) {
    const change = Math.abs(lastPrice - firstPrice) / firstPrice;
    const isFlat = change < FLAT_TREND_THRESHOLD;
    const isPositive = lastPrice >= firstPrice;
    
    return { isPositive, isFlat };
}

/**
 * Calculate moving average
 * @param {number[]} data - Array of numbers
 * @param {number} period - Period for moving average
 * @returns {(number|null)[]} Array with moving averages (null for insufficient data points)
 */
export function calculateMovingAverage(data, period) {
    const ma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            ma.push(null);
        } else {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            ma.push(sum / period);
        }
    }
    return ma;
}

/**
 * Safely divide two numbers
 * @param {number} numerator
 * @param {number} denominator
 * @param {number} defaultValue - Value to return if division is invalid
 * @returns {number}
 */
export function safeDivide(numerator, denominator, defaultValue = 0) {
    if (denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
        return defaultValue;
    }
    return numerator / denominator;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

