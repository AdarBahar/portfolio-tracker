import { debounce } from './utils.js';

/**
 * Ticker Autocomplete Module
 * Handles symbol search and autocomplete functionality for the Add Position modal
 */

class TickerAutocomplete {
  constructor(inputElement, dropdownElement, onSelect, apiUrl) {
    this.input = inputElement;
    this.dropdown = dropdownElement;
    this.onSelect = onSelect;
    this.apiUrl = apiUrl; // API base URL passed from parent
    this.selectedIndex = -1;
    this.results = [];

    this.init();
  }
  
  init() {
    // Debounced search function (300ms delay)
    this.debouncedSearch = debounce(this.search.bind(this), 300);
    
    // Input event listener
    this.input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= 1) {
        this.debouncedSearch(query);
      } else {
        this.hideDropdown();
      }
    });
    
    // Keyboard navigation
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
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.hideDropdown();
      }
    });
  }
  
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
  
  showLoading() {
    this.dropdown.innerHTML = '<div class="autocomplete-loading">Searching...</div>';
    this.dropdown.classList.add('active');
  }
  
  showEmpty() {
    this.dropdown.innerHTML = '<div class="autocomplete-empty">No symbols found</div>';
    this.dropdown.classList.add('active');
  }
  
  showError() {
    this.dropdown.innerHTML = '<div class="autocomplete-empty">Error searching symbols</div>';
    this.dropdown.classList.add('active');
  }
  
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
    
    // Add click listeners
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item) => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.selectItem(this.results[index]);
      });
    });
  }
  
  selectNext() {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;
    
    if (this.selectedIndex < items.length - 1) {
      this.selectedIndex++;
      this.updateSelection(items);
    }
  }
  
  selectPrevious() {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;

    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateSelection(items);
    }
  }

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

  selectItem(item) {
    this.input.value = item.symbol;
    this.hideDropdown();

    // Call the onSelect callback with the selected item
    if (this.onSelect) {
      this.onSelect(item);
    }
  }

  hideDropdown() {
    this.dropdown.classList.remove('active');
    this.dropdown.innerHTML = '';
    this.selectedIndex = -1;
    this.results = [];
  }

  reset() {
    this.input.value = '';
    this.hideDropdown();
  }
}

export { TickerAutocomplete };

