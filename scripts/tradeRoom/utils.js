/**
 * Trade Room Utility Functions
 */

/**
 * Format currency
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format date/time
 */
export function formatDateTime(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(endTime) {
    if (!endTime) return '--';
    
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

/**
 * Calculate end time from start and duration
 */
export function calculateEndTime(startTime, durationSec) {
    if (!startTime || !durationSec) return null;
    const start = new Date(startTime);
    return new Date(start.getTime() + durationSec * 1000);
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'success') {
    const toastId = type === 'error' ? 'errorToast' : 'successToast';
    const toast = document.getElementById(toastId);
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Show error toast
 */
export function showError(message) {
    showToast(message, 'error');
}

/**
 * Show success toast
 */
export function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * Debounce function
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
 * Generate random invite code
 */
export function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Validate invite code format
 */
export function isValidInviteCode(code) {
    return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Get status badge class
 */
export function getStatusClass(status) {
    const statusMap = {
        draft: 'draft',
        scheduled: 'scheduled',
        active: 'active',
        completed: 'completed',
        archived: 'archived',
    };
    return statusMap[status] || 'draft';
}

/**
 * Get rank badge class
 */
export function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

