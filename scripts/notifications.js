/**
 * Notifications Module
 * Handles toast notifications for user feedback
 */

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Notification type: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Duration in milliseconds (0 = persistent)
 */
export function showToast(message, type = 'info', duration = 5000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    // Add icon based on type
    const icon = getIconForType(type);
    
    // Add content
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto-remove after duration (if not persistent)
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
    
    return toast;
}

/**
 * Remove a toast notification
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
    if (!toast) return;
    
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

/**
 * Get icon for notification type
 * @param {string} type - Notification type
 * @returns {string} Icon HTML
 */
function getIconForType(type) {
    const icons = {
        info: '&#9432;',      // ℹ
        success: '&#10004;',  // ✓
        warning: '&#9888;',   // ⚠
        error: '&#10006;',    // ✖
    };
    return icons[type] || icons.info;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show info notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showInfo(message, duration = 5000) {
    return showToast(message, 'info', duration);
}

/**
 * Show success notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showSuccess(message, duration = 5000) {
    return showToast(message, 'success', duration);
}

/**
 * Show warning notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showWarning(message, duration = 5000) {
    return showToast(message, 'warning', duration);
}

/**
 * Show error notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showError(message, duration = 5000) {
    return showToast(message, 'error', duration);
}

/**
 * Clear all notifications
 */
export function clearAllToasts() {
    const container = document.getElementById('toast-container');
    if (container) {
        const toasts = container.querySelectorAll('.toast');
        toasts.forEach(toast => removeToast(toast));
    }
}

