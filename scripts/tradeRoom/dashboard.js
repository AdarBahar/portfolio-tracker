/**
 * Dashboard Component
 * Displays user's BullPens and provides create/join functionality
 */

import { formatDateTime, formatTimeRemaining, calculateEndTime, getStatusClass, showError, showSuccess, escapeHtml } from './utils.js';

export class Dashboard {
    constructor(api, onNavigate) {
        this.api = api;
        this.onNavigate = onNavigate;
        this.bullPens = [];
        this.currentFilter = 'all';
    }

    /**
     * Initialize dashboard
     */
    async init() {
        this.attachEventListeners();
        await this.loadBullPens();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Create BullPen button
        const createBtn = document.getElementById('createBullPenBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateDialog());
        }

        // Join BullPen button
        const joinBtn = document.getElementById('joinBullPenBtn');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.showJoinDialog());
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('.bullpen-filters .filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderBullPens();
            });
        });
    }

    /**
     * Load BullPens from API
     */
    async loadBullPens() {
        try {
            const listEl = document.getElementById('bullpenList');
            if (listEl) {
                listEl.innerHTML = '<div class="loading-state">Loading your BullPens...</div>';
            }

            const data = await this.api.getMyBullPens();
            this.bullPens = data.bullPens || [];
            this.renderBullPens();
        } catch (error) {
            console.error('Failed to load BullPens:', error);
            showError('Failed to load BullPens: ' + error.message);
            const listEl = document.getElementById('bullpenList');
            if (listEl) {
                listEl.innerHTML = '<div class="empty-state">Failed to load BullPens. Please try again.</div>';
            }
        }
    }

    /**
     * Render BullPens list
     */
    renderBullPens() {
        const listEl = document.getElementById('bullpenList');
        if (!listEl) return;

        // Filter BullPens
        let filtered = this.bullPens;
        if (this.currentFilter !== 'all') {
            filtered = this.bullPens.filter(bp => bp.state === this.currentFilter);
        }

        if (filtered.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <p>No BullPens found.</p>
                    <p>Create a new BullPen or join an existing one to get started!</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = filtered.map(bp => this.renderBullPenCard(bp)).join('');

        // Attach click handlers
        listEl.querySelectorAll('.bullpen-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                const bullPen = filtered[index];
                this.onNavigate('bullpen', bullPen.id);
            });
        });
    }

    /**
     * Render single BullPen card
     */
    renderBullPenCard(bullPen) {
        const endTime = calculateEndTime(bullPen.startTime, bullPen.durationSec);
        const timeRemaining = bullPen.state === 'active' ? formatTimeRemaining(endTime) : '--';
        const startTimeFormatted = formatDateTime(bullPen.startTime);

        return `
            <div class="bullpen-card">
                <div class="bullpen-card-header">
                    <div>
                        <div class="bullpen-card-title">${escapeHtml(bullPen.name)}</div>
                        <span class="status-badge ${getStatusClass(bullPen.state)}">${bullPen.state}</span>
                    </div>
                </div>
                ${bullPen.description ? `<div class="bullpen-card-description">${escapeHtml(bullPen.description)}</div>` : ''}
                <div class="bullpen-card-meta">
                    <div class="bullpen-card-meta-row">
                        <span>Start:</span>
                        <span>${startTimeFormatted}</span>
                    </div>
                    ${bullPen.state === 'active' ? `
                        <div class="bullpen-card-meta-row">
                            <span>Time Remaining:</span>
                            <span>${timeRemaining}</span>
                        </div>
                    ` : ''}
                    <div class="bullpen-card-meta-row">
                        <span>Starting Cash:</span>
                        <span>$${Number(bullPen.startingCash).toLocaleString()}</span>
                    </div>
                    <div class="bullpen-card-meta-row">
                        <span>Max Players:</span>
                        <span>${bullPen.maxPlayers}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show create BullPen dialog
     */
    showCreateDialog() {
        // This will be implemented with modal component
        console.log('Show create dialog');
        showError('Create BullPen dialog not yet implemented');
    }

    /**
     * Show join BullPen dialog
     */
    showJoinDialog() {
        // This will be implemented with modal component
        console.log('Show join dialog');
        showError('Join BullPen dialog not yet implemented');
    }
}

