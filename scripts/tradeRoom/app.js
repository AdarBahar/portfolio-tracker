/**
 * Trade Room Application
 * Main entry point and router
 */

import { authManager } from '../auth.js';
import configPromise from '../config.js';
import { setupThemeToggle } from '../theme.js';
import { BullPenAPI } from './api.js';
import { Dashboard } from './dashboard.js';
import { BullPenDetail } from './bullPenDetail.js';
import { showError } from './utils.js';

class TradeRoomApp {
    constructor() {
        this.config = null;
        this.api = null;
        this.currentView = null;
        this.currentComponent = null;
        this.currentBullPenId = null;
    }

    /**
     * Initialize application
     */
    async init() {
        try {
            // Load configuration
            this.config = await configPromise;
            
            // Check authentication
            if (!authManager.initialize()) {
                window.location.href = './login.html';
                return;
            }

            // Initialize API
            this.api = new BullPenAPI(this.config.apiUrl);

            // Set up UI
            this.setupUI();
            
            // Parse URL and navigate
            this.parseURL();
            
            // Set up URL change listener
            window.addEventListener('popstate', () => this.parseURL());
            
        } catch (error) {
            console.error('Failed to initialize Trade Room:', error);
            showError('Failed to initialize application: ' + error.message);
        }
    }

    /**
     * Set up UI elements
     */
    setupUI() {
        const user = authManager.getUser();
        
        // Update user info
        const userNameEl = document.getElementById('userName');
        if (userNameEl && user) {
            userNameEl.textContent = user.name;
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authManager.logout();
            });
        }

        // Back to portfolio button
        const backToPortfolioBtn = document.getElementById('backToPortfolioBtn');
        if (backToPortfolioBtn) {
            backToPortfolioBtn.addEventListener('click', () => {
                window.location.href = './index.html';
            });
        }

        // Theme toggle
        setupThemeToggle();
    }

    /**
     * Parse URL and navigate
     */
    parseURL() {
        const params = new URLSearchParams(window.location.search);
        const bullPenId = params.get('id');
        
        if (bullPenId) {
            this.navigate('bullpen', bullPenId);
        } else {
            this.navigate('dashboard');
        }
    }

    /**
     * Navigate to view
     */
    async navigate(view, bullPenId = null) {
        // Cleanup current component
        if (this.currentComponent && this.currentComponent.destroy) {
            this.currentComponent.destroy();
        }

        this.currentView = view;
        this.currentBullPenId = bullPenId;

        // Hide all views
        const dashboardView = document.getElementById('dashboardView');
        const detailView = document.getElementById('bullpenDetailView');
        
        if (dashboardView) dashboardView.style.display = 'none';
        if (detailView) detailView.style.display = 'none';

        // Update subtitle
        const subtitleEl = document.getElementById('pageSubtitle');
        
        if (view === 'dashboard') {
            // Show dashboard
            if (dashboardView) dashboardView.style.display = 'block';
            if (subtitleEl) subtitleEl.textContent = 'Dashboard';
            
            this.currentComponent = new Dashboard(this.api, (view, id) => this.navigate(view, id));
            await this.currentComponent.init();
            
            // Update URL
            window.history.pushState({}, '', 'trade-room.html');
            
        } else if (view === 'bullpen' && bullPenId) {
            // Show BullPen detail
            if (detailView) detailView.style.display = 'block';
            if (subtitleEl) subtitleEl.textContent = 'Trading';
            
            this.currentComponent = new BullPenDetail(this.api, bullPenId, (view, id) => this.navigate(view, id));
            await this.currentComponent.init();
            
            // Update URL
            window.history.pushState({}, '', `trade-room.html?id=${bullPenId}`);
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new TradeRoomApp();
        app.init();
    });
} else {
    const app = new TradeRoomApp();
    app.init();
}

