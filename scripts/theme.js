/**
 * Theme Manager
 * Centralized theme handling for consistent light/dark mode across all pages
 */

const THEME_STORAGE_KEY = 'portfolio_theme';
const DEFAULT_THEME = 'light';

/**
 * Get current theme from localStorage
 */
export function getCurrentTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
}

/**
 * Set theme and save to localStorage
 */
export function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
        console.warn(`Invalid theme: ${theme}. Using default.`);
        theme = DEFAULT_THEME;
    }
    
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
}

/**
 * Initialize theme on page load
 * Call this as early as possible to prevent flash of wrong theme
 */
export function initTheme() {
    const savedTheme = getCurrentTheme();
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
}

/**
 * Setup theme toggle button
 * @param {string} buttonId - ID of the theme toggle button
 */
export function setupThemeToggle(buttonId = 'themeToggle') {
    const themeToggle = document.getElementById(buttonId);
    if (!themeToggle) {
        console.warn(`Theme toggle button with id '${buttonId}' not found`);
        return;
    }
    
    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });
}

// Auto-initialize theme immediately when script loads
// This prevents flash of wrong theme
initTheme();

