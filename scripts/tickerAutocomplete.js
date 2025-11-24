import { debounce } from './utils.js';

/**
 * TickerAutocomplete - Autocomplete component for stock ticker search
 *
 * Provides real-time symbol search using Finnhub API with:
 * - Debounced search (300ms delay to reduce API calls)
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click-outside-to-close behavior
 * - Loading, empty, and error states
 *
 * @example
 * const autocomplete = new TickerAutocomplete(
 *   inputElement,
 *   dropdownElement,
 *   (selectedItem) => console.log('Selected:', selectedItem),
 *   'https://api.example.com/api'
 * );
 */
class TickerAutocomplete {
  /**
   * @param {HTMLInputElement} inputElement - The ticker input field
   * @param {HTMLElement} dropdownElement - The dropdown container for results
   * @param {Function} onSelect - Callback when a ticker is selected (receives item object)
   * @param {string} apiUrl - Base API URL for market data endpoints
   */
  constructor(inputElement, dropdownElement, onSelect, apiUrl) {
    this.input = inputElement;
    this.dropdown = dropdownElement;
    this.onSelect = onSelect;
    this.apiUrl = apiUrl;
    this.selectedIndex = -1;
    this.results = [];

    this.init();
  }

  /**
   * Initialize event listeners for input, keyboard navigation, and click-outside
   * @private
   */
  init() {
    // Debounce search to avoid excessive API calls
    this.debouncedSearch = debounce(this.search.bind(this), 300);

    // Trigger search on input
    this.input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= 1) {
        this.debouncedSearch(query);
      } else {
        this.hideDropdown();
      }
    });

    // Keyboard navigation: Arrow keys, Enter, Escape
    this.input.addEventListener('keydown', (e) => {
      if (!this.dropdown.classList.contains('active')) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectPrevious();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.results[this.selectedIndex]) {
          this.selectItem(this.results[this.selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        this.hideDropdown();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.hideDropdown();
      }
    });
  }
  
  /**
   * Search for ticker symbols via API
   * @param {string} query - Search query (ticker symbol or company name)
   * @private
   */
  async search(query) {
    try {
      this.showLoading();

      const response = await fetch(`${this.apiUrl}/market-data/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      this.results = data.result || [];

      if (this.results.length === 0) {
        this.showEmpty();
      } else {
        this.showResults(this.results);
      }
    } catch (error) {
      console.error('Error searching symbols:', error);
      this.showError();
    }
  }

  /**
   * Display loading state
   * @private
   */
  showLoading() {
    this.dropdown.innerHTML = '<div class="autocomplete-loading">Searching...</div>';
    this.dropdown.classList.add('active');
  }

  /**
   * Display empty state (no results found)
   * @private
   */
  showEmpty() {
    this.dropdown.innerHTML = '<div class="autocomplete-empty">No symbols found</div>';
    this.dropdown.classList.add('active');
  }

  /**
   * Display error state
   * @private
   */
  showError() {
    this.dropdown.innerHTML = '<div class="autocomplete-empty">Error searching symbols</div>';
    this.dropdown.classList.add('active');
  }

  /**
   * Display search results in dropdown
   * @param {Array} results - Array of ticker objects from API
   * @private
   */
  showResults(results) {
    this.selectedIndex = -1;

    const html = results.map((item, index) => `
      <div class="autocomplete-item" data-index="${index}">
        <div class="autocomplete-symbol">
          ${item.symbol}
          <span class="autocomplete-type">${item.type}</span>
        </div>
        <div class="autocomplete-description">${item.description}</div>
      </div>
    `).join('');

    this.dropdown.innerHTML = html;
    this.dropdown.classList.add('active');

    // Attach click handlers to result items
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item) => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.selectItem(this.results[index]);
      });
    });
  }
  
  /**
   * Move selection to next item (Arrow Down)
   * @private
   */
  selectNext() {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;

    if (this.selectedIndex < items.length - 1) {
      this.selectedIndex++;
      this.updateSelection(items);
    }
  }

  /**
   * Move selection to previous item (Arrow Up)
   * @private
   */
  selectPrevious() {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;

    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateSelection(items);
    }
  }

  /**
   * Update visual selection state and scroll into view
   * @param {NodeList} items - List of autocomplete item elements
   * @private
   */
  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  /**
   * Select an item and trigger callback
   * @param {Object} item - Selected ticker object {symbol, description, type, displaySymbol}
   * @private
   */
  selectItem(item) {
    this.input.value = item.symbol;
    this.hideDropdown();

    if (this.onSelect) {
      this.onSelect(item);
    }
  }

  /**
   * Hide dropdown and clear results
   * @private
   */
  hideDropdown() {
    this.dropdown.classList.remove('active');
    this.dropdown.innerHTML = '';
    this.selectedIndex = -1;
    this.results = [];
  }

  /**
   * Reset input and dropdown (called when modal closes)
   * @public
   */
  reset() {
    this.input.value = '';
    this.hideDropdown();
  }
}

export { TickerAutocomplete };

