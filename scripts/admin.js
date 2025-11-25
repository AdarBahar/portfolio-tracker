/**
 * Admin Panel Module
 * Handles admin-only functionality for user management and audit logs
 */

import { authManager } from './auth.js';
import { setupThemeToggle } from './theme.js';
import configPromise from './config.js';

let config = null;
let allUsers = [];

/**
 * Initialize admin panel
 */
async function init() {
    // Load config
    config = await configPromise;

    // Check authentication and admin status
    if (!authManager.initialize()) {
        window.location.href = '/fantasybroker/login.html';
        return;
    }

    const user = authManager.getUser();
    if (!user || !user.isAdmin) {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/fantasybroker/index.html';
        return;
    }

    // Setup UI
    setupThemeToggle();
    setupEventListeners();
    
    // Load users
    await loadUsers();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Back to portfolio button
    const backBtn = document.getElementById('backToPortfolioBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/fantasybroker/index.html';
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                authManager.logout();
            }
        });
    }

    // Search input
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterUsers(e.target.value);
        });
    }

    // Close logs modal
    const closeLogsBtn = document.getElementById('closeLogsModal');
    const logsModal = document.getElementById('logsModal');
    if (closeLogsBtn && logsModal) {
        closeLogsBtn.addEventListener('click', () => {
            logsModal.style.display = 'none';
            logsModal.setAttribute('aria-hidden', 'true');
        });

        // Close on background click
        logsModal.addEventListener('click', (e) => {
            if (e.target === logsModal) {
                logsModal.style.display = 'none';
                logsModal.setAttribute('aria-hidden', 'true');
            }
        });
    }
}

/**
 * Load all users from API
 */
async function loadUsers() {
    try {
        const response = await fetch(`${config.apiUrl}/admin/users`, {
            headers: authManager.getAuthHeader(),
        });

        if (!response.ok) {
            if (response.status === 403) {
                alert('Access denied. Admin privileges required.');
                window.location.href = '/fantasybroker/index.html';
                return;
            }
            throw new Error(`Failed to load users: ${response.statusText}`);
        }

        const data = await response.json();
        allUsers = data.users || [];
        
        renderUsers(allUsers);
        updateUserCount(allUsers.length);
        updateLastUpdated();
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users: ' + error.message);
    }
}

/**
 * Render users table
 */
function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${escapeHtml(user.name || 'N/A')}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.authProvider)}</td>
            <td><span class="status-badge ${user.status}">${user.status}</span></td>
            <td>${user.isAdmin ? '<span class="admin-indicator">✓ Admin</span>' : ''}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
            <td>
                <button class="action-btn action-btn-primary" onclick="window.adminPanel.viewLogs(${user.id})">
                    Logs
                </button>
                ${!user.isAdmin ? `
                    <button class="action-btn action-btn-secondary" onclick="window.adminPanel.toggleAdmin(${user.id}, true)">
                        Make Admin
                    </button>
                ` : `
                    <button class="action-btn action-btn-danger" onclick="window.adminPanel.toggleAdmin(${user.id}, false)">
                        Remove Admin
                    </button>
                `}
            </td>
        </tr>
    `).join('');
}

/**
 * Filter users based on search query
 */
function filterUsers(query) {
    if (!query) {
        renderUsers(allUsers);
        updateUserCount(allUsers.length);
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allUsers.filter(user =>
        (user.name && user.name.toLowerCase().includes(lowerQuery)) ||
        (user.email && user.email.toLowerCase().includes(lowerQuery))
    );

    renderUsers(filtered);
    updateUserCount(filtered.length, allUsers.length);
}

/**
 * View user logs
 */
async function viewLogs(userId) {
    const modal = document.getElementById('logsModal');
    const container = document.getElementById('logsContainer');
    const userNameEl = document.getElementById('logsUserName');
    const userEmailEl = document.getElementById('logsUserEmail');

    if (!modal || !container) return;

    // Show modal
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    container.innerHTML = '<p class="loading-text">Loading logs...</p>';

    try {
        const response = await fetch(`${config.apiUrl}/admin/users/${userId}/logs`, {
            headers: authManager.getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error(`Failed to load logs: ${response.statusText}`);
        }

        const data = await response.json();

        // Update user info
        if (userNameEl) userNameEl.textContent = data.user.name || 'N/A';
        if (userEmailEl) userEmailEl.textContent = data.user.email;

        // Render logs
        renderLogs(data.logs);
    } catch (error) {
        console.error('Error loading logs:', error);
        container.innerHTML = `<p class="loading-text" style="color: var(--color-red-400);">Failed to load logs: ${escapeHtml(error.message)}</p>`;
    }
}

/**
 * Render audit logs
 */
function renderLogs(logs) {
    const container = document.getElementById('logsContainer');
    if (!container) return;

    if (logs.length === 0) {
        container.innerHTML = '<p class="no-logs">No audit logs found for this user.</p>';
        return;
    }

    container.innerHTML = logs.map(log => `
        <div class="log-entry">
            <div class="log-entry-header">
                <span class="log-event-type">${escapeHtml(log.eventType)}</span>
                <span class="log-timestamp">${formatDateTime(log.createdAt)}</span>
            </div>
            <div class="log-description">${escapeHtml(log.description)}</div>
            <div class="log-details">
                ${log.eventCategory ? `<div class="log-detail-item"><span class="log-detail-label">Category:</span> ${escapeHtml(log.eventCategory)}</div>` : ''}
                ${log.ipAddress ? `<div class="log-detail-item"><span class="log-detail-label">IP:</span> ${escapeHtml(log.ipAddress)}</div>` : ''}
            </div>
            ${(log.previousValues || log.newValues) ? `
                <div class="log-changes">
                    ${log.previousValues ? `<div><strong>Previous:</strong> ${escapeHtml(JSON.stringify(log.previousValues, null, 2))}</div>` : ''}
                    ${log.newValues ? `<div><strong>New:</strong> ${escapeHtml(JSON.stringify(log.newValues, null, 2))}</div>` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * Toggle admin status for a user
 */
async function toggleAdmin(userId, makeAdmin) {
    const action = makeAdmin ? 'grant admin privileges to' : 'revoke admin privileges from';
    const user = allUsers.find(u => u.id === userId);

    if (!user) return;

    if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) {
        return;
    }

    try {
        const response = await fetch(`${config.apiUrl}/admin/users/${userId}/admin`, {
            method: 'PATCH',
            headers: {
                ...authManager.getAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isAdmin: makeAdmin }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Failed to update admin status: ${response.statusText}`);
        }

        // Reload users
        await loadUsers();
        alert(`Successfully ${makeAdmin ? 'granted' : 'revoked'} admin privileges.`);
    } catch (error) {
        console.error('Error updating admin status:', error);
        alert('Failed to update admin status: ' + error.message);
    }
}

/**
 * Update user count display
 */
function updateUserCount(count, total = null) {
    const countEl = document.getElementById('userCount');
    if (!countEl) return;

    if (total !== null && count !== total) {
        countEl.textContent = `Showing ${count} of ${total} users`;
    } else {
        countEl.textContent = `${count} user${count !== 1 ? 's' : ''}`;
    }
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (!el) return;

    const now = new Date();
    el.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text.toString();
    return div.innerHTML;
}

/**
 * Show error message
 */
function showError(message) {
    const tbody = document.getElementById('usersTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" class="loading-cell" style="color: var(--color-red-400);">${escapeHtml(message)}</td></tr>`;
    }
}

// Export functions for global access (for onclick handlers)
window.adminPanel = {
    viewLogs,
    toggleAdmin,
};

// Initialize on page load
init();

