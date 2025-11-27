/**
 * User Detail Page Module
 * Handles user detail view and audit logs with pagination and search
 */

import { authManager } from './auth.js';
import { setupThemeToggle } from './theme.js';
import configPromise from './config.js';

let config = null;
let currentUserId = null;
let allLogs = [];
let filteredLogs = [];
let currentPage = 1;
const LOGS_PER_PAGE = 10;

/**
 * Initialize user detail page
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

    // Get user ID from URL
    const params = new URLSearchParams(window.location.search);
    currentUserId = parseInt(params.get('userId'));

    if (!currentUserId) {
        alert('Invalid user ID');
        window.location.href = '/fantasybroker/admin.html';
        return;
    }

    // Setup UI
    setupThemeToggle();
    setupEventListeners();
    
    // Load user detail and logs
    await loadUserDetail();
    await loadLogs();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Back to admin button
    const backBtn = document.getElementById('backToAdminBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/fantasybroker/admin.html';
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

    // Logs search
    const searchInput = document.getElementById('logsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            applyFilters();
        });
    }

    // Transaction filter
    const transactionFilter = document.getElementById('logsTransactionFilter');
    if (transactionFilter) {
        transactionFilter.addEventListener('change', () => {
            currentPage = 1;
            applyFilters();
        });
    }

    // Star filter
    const starFilter = document.getElementById('logsStarFilter');
    if (starFilter) {
        starFilter.addEventListener('change', () => {
            currentPage = 1;
            applyFilters();
        });
    }

    // Pagination buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderLogs();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxPage = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
            if (currentPage < maxPage) {
                currentPage++;
                renderLogs();
            }
        });
    }
}

/**
 * Load user detail
 */
async function loadUserDetail() {
    try {
        const response = await fetch(`${config.apiUrl}/admin/users/${currentUserId}/detail`, {
            headers: authManager.getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error(`Failed to load user detail: ${response.statusText}`);
        }

        const data = await response.json();
        renderUserDetail(data);
    } catch (error) {
        console.error('Error loading user detail:', error);
        const container = document.getElementById('userDetailContainer');
        if (container) {
            container.innerHTML = `<p class="loading-text" style="color: var(--color-red-400);">Failed to load user details: ${escapeHtml(error.message)}</p>`;
        }
    }
}

/**
 * Load audit logs
 */
async function loadLogs() {
    try {
        const response = await fetch(`${config.apiUrl}/admin/users/${currentUserId}/logs`, {
            headers: authManager.getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error(`Failed to load logs: ${response.statusText}`);
        }

        const data = await response.json();
        allLogs = data.logs || [];
        
        // Sort by most recent first
        allLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        filteredLogs = [...allLogs];
        currentPage = 1;
        renderLogs();
    } catch (error) {
        console.error('Error loading logs:', error);
        const container = document.getElementById('logsContainer');
        if (container) {
            container.innerHTML = `<p class="loading-text" style="color: var(--color-red-400);">Failed to load logs: ${escapeHtml(error.message)}</p>`;
        }
    }
}

/**
 * Apply filters to logs
 */
function applyFilters() {
    const searchQuery = document.getElementById('logsSearch')?.value.toLowerCase() || '';
    const transactionFilter = document.getElementById('logsTransactionFilter')?.value || '';
    const starFilter = document.getElementById('logsStarFilter')?.value || '';

    filteredLogs = allLogs.filter(log => {
        // Free text search
        if (searchQuery) {
            const searchableText = `${log.eventType} ${log.description} ${log.eventCategory || ''}`.toLowerCase();
            if (!searchableText.includes(searchQuery)) {
                return false;
            }
        }

        // Transaction filter
        if (transactionFilter) {
            if (!log.eventCategory || !log.eventCategory.toLowerCase().includes(transactionFilter.toLowerCase())) {
                return false;
            }
        }

        // Star filter (based on eventType or custom field)
        if (starFilter) {
            const stars = parseInt(log.stars) || 0;
            if (stars !== parseInt(starFilter)) {
                return false;
            }
        }

        return true;
    });

    renderLogs();
}

/**
 * Render logs with pagination
 */
function renderLogs() {
    const container = document.getElementById('logsContainer');
    if (!container) return;

    if (filteredLogs.length === 0) {
        container.innerHTML = '<p class="no-logs">No audit logs found.</p>';
        updatePagination();
        return;
    }

    const startIdx = (currentPage - 1) * LOGS_PER_PAGE;
    const endIdx = startIdx + LOGS_PER_PAGE;
    const paginatedLogs = filteredLogs.slice(startIdx, endIdx);

    container.innerHTML = paginatedLogs.map(log => `
        <div class="log-entry">
            <div class="log-entry-header">
                <span class="log-event-type">${escapeHtml(log.eventType)}</span>
                <span class="log-timestamp">${formatDateTime(log.createdAt)}</span>
            </div>
            <div class="log-description">${escapeHtml(log.description)}</div>
            <div class="log-details">
                ${log.eventCategory ? `<div class="log-detail-item"><span class="log-detail-label">Category:</span> ${escapeHtml(log.eventCategory)}</div>` : ''}
                ${log.ipAddress ? `<div class="log-detail-item"><span class="log-detail-label">IP:</span> ${escapeHtml(log.ipAddress)}</div>` : ''}
                ${log.stars ? `<div class="log-detail-item"><span class="log-detail-label">Stars:</span> ${'⭐'.repeat(log.stars)}</div>` : ''}
            </div>
            ${(log.previousValues || log.newValues) ? `
                <div class="log-changes">
                    ${log.previousValues ? `<div><strong>Previous:</strong> ${escapeHtml(JSON.stringify(log.previousValues, null, 2))}</div>` : ''}
                    ${log.newValues ? `<div><strong>New:</strong> ${escapeHtml(JSON.stringify(log.newValues, null, 2))}</div>` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');

    updatePagination();
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const maxPage = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const paginationInfo = document.getElementById('paginationInfo');

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= maxPage;
    if (paginationInfo) paginationInfo.textContent = `Page ${currentPage} of ${Math.max(1, maxPage)}`;
}

/**
 * Render user detail overview (from admin.js)
 */
function renderUserDetail(data) {
    const container = document.getElementById('userDetailContainer');
    if (!container) return;

    const user = data.user;
    const budget = data.budget;
    const tradingRooms = data.tradingRooms || [];
    const standings = data.standings || [];

    // Calculate totals
    const totalPnL = standings.reduce((sum, s) => sum + (parseFloat(s.pnlAbs) || 0), 0);
    const totalPnLPct = standings.length > 0
        ? standings.reduce((sum, s) => sum + (parseFloat(s.pnlPct) || 0), 0) / standings.length
        : 0;

    const globalRank = standings.length > 0
        ? Math.round(standings.reduce((sum, s) => sum + (parseInt(s.rank) || 0), 0) / standings.length)
        : 'N/A';

    const totalBudget = budget
        ? (parseFloat(budget.availableBalance) + parseFloat(budget.lockedBalance)).toFixed(2)
        : 'N/A';

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = `${escapeHtml(user.name || 'User')} - Detail`;

    const html = `
        <div class="user-detail-content">
            <!-- User Profile Section -->
            <div class="detail-section">
                <h3 class="detail-section-title">User Profile</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${escapeHtml(user.name || 'N/A')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${escapeHtml(user.email)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value"><span class="status-badge ${user.status}">${user.status}</span></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Admin:</span>
                        <span class="detail-value">${user.isAdmin ? '✓ Yes' : 'No'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Created:</span>
                        <span class="detail-value">${formatDate(user.createdAt)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Login:</span>
                        <span class="detail-value">${user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}</span>
                    </div>
                </div>
            </div>

            <!-- Budget & Performance Section -->
            <div class="detail-section">
                <h3 class="detail-section-title">Budget & Performance</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Total Budget:</span>
                        <span class="detail-value">${escapeHtml(totalBudget)} ${budget ? budget.currency : 'VUSD'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Available Balance:</span>
                        <span class="detail-value">${budget ? escapeHtml(parseFloat(budget.availableBalance).toFixed(2)) : 'N/A'} ${budget ? budget.currency : 'VUSD'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Locked Balance:</span>
                        <span class="detail-value">${budget ? escapeHtml(parseFloat(budget.lockedBalance).toFixed(2)) : 'N/A'} ${budget ? budget.currency : 'VUSD'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Global Ranking:</span>
                        <span class="detail-value">${globalRank}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total P&L (Absolute):</span>
                        <span class="detail-value ${totalPnL >= 0 ? 'pnl-positive' : 'pnl-negative'}">${totalPnL >= 0 ? '+' : ''}${escapeHtml(totalPnL.toFixed(2))}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total P&L (%):</span>
                        <span class="detail-value ${totalPnLPct >= 0 ? 'pnl-positive' : 'pnl-negative'}">${totalPnLPct >= 0 ? '+' : ''}${escapeHtml(totalPnLPct.toFixed(2))}%</span>
                    </div>
                </div>
            </div>

            <!-- Trading Rooms Section -->
            <div class="detail-section">
                <h3 class="detail-section-title">Trading Rooms (${tradingRooms.length})</h3>
                ${tradingRooms.length === 0 ? `
                    <p class="no-data">User is not a member of any trading rooms.</p>
                ` : `
                    <div class="rooms-list">
                        ${tradingRooms.map(room => {
                            const standing = standings.find(s => s.bullPenId === room.id);
                            return `
                                <div class="room-card">
                                    <div class="room-header">
                                        <h4 class="room-name">${escapeHtml(room.name)}</h4>
                                        <span class="room-state-badge ${room.state}">${room.state}</span>
                                    </div>
                                    <div class="room-details">
                                        <div class="room-detail-item">
                                            <span class="room-detail-label">Joined:</span>
                                            <span class="room-detail-value">${formatDate(room.joinedAt)}</span>
                                        </div>
                                        <div class="room-detail-item">
                                            <span class="room-detail-label">Role:</span>
                                            <span class="room-detail-value">${escapeHtml(room.role)}</span>
                                        </div>
                                        <div class="room-detail-item">
                                            <span class="room-detail-label">Status:</span>
                                            <span class="room-detail-value">${escapeHtml(room.status)}</span>
                                        </div>
                                        <div class="room-detail-item">
                                            <span class="room-detail-label">Cash:</span>
                                            <span class="room-detail-value">${escapeHtml(parseFloat(room.cash).toFixed(2))}</span>
                                        </div>
                                        ${standing ? `
                                            <div class="room-detail-item">
                                                <span class="room-detail-label">Ranking:</span>
                                                <span class="room-detail-value">#${standing.rank}</span>
                                            </div>
                                            <div class="room-detail-item">
                                                <span class="room-detail-label">Portfolio Value:</span>
                                                <span class="room-detail-value">${escapeHtml(parseFloat(standing.portfolioValue).toFixed(2))}</span>
                                            </div>
                                            <div class="room-detail-item">
                                                <span class="room-detail-label">P&L:</span>
                                                <span class="room-detail-value ${parseFloat(standing.pnlAbs) >= 0 ? 'pnl-positive' : 'pnl-negative'}">${parseFloat(standing.pnlAbs) >= 0 ? '+' : ''}${escapeHtml(parseFloat(standing.pnlAbs).toFixed(2))} (${parseFloat(standing.pnlPct) >= 0 ? '+' : ''}${escapeHtml(parseFloat(standing.pnlPct).toFixed(2))}%)</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Utility functions (from admin.js)
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Initialize on page load
init();

