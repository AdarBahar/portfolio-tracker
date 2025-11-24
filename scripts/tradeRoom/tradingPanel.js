/**
 * Trading Panel Component
 * Handles stock/option/ETF trading interface
 */

import { formatCurrency, showError, showSuccess, debounce } from './utils.js';

export class TradingPanel {
    constructor(api, bullPenId) {
        this.api = api;
        this.bullPenId = bullPenId;
        this.currentInstrument = 'stock';
        this.currentPrice = null;
        this.currentSymbol = null;
    }

    /**
     * Render trading panel
     */
    render() {
        const container = document.getElementById('tradingPanel');
        if (!container) return;

        container.innerHTML = `
            <div class="trading-form">
                <!-- Instrument Type Tabs -->
                <div class="instrument-tabs">
                    <button class="instrument-tab active" data-type="stock">Stock</button>
                    <button class="instrument-tab" data-type="option">Option</button>
                    <button class="instrument-tab" data-type="etf">ETF</button>
                </div>

                <!-- Symbol Input -->
                <div class="form-group">
                    <label class="form-label">Symbol</label>
                    <input type="text" class="form-input" id="tradeSymbol" placeholder="AAPL" style="text-transform: uppercase;">
                </div>

                <!-- Price Display -->
                <div class="price-display" id="priceDisplay" style="display: none;">
                    <div class="price-display-label">Current Price</div>
                    <div class="price-display-value" id="currentPrice">--</div>
                </div>

                <!-- Quantity -->
                <div class="form-group">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-input" id="tradeQuantity" placeholder="10" min="0" step="0.01">
                </div>

                <!-- Order Type -->
                <div class="form-group">
                    <label class="form-label">Order Type</label>
                    <select class="form-select" id="orderType">
                        <option value="market">Market</option>
                        <option value="limit">Limit</option>
                    </select>
                </div>

                <!-- Limit Price (conditional) -->
                <div class="form-group" id="limitPriceGroup" style="display: none;">
                    <label class="form-label">Limit Price</label>
                    <input type="number" class="form-input" id="limitPrice" placeholder="0.00" min="0" step="0.01">
                </div>

                <!-- Option-specific fields (conditional) -->
                <div id="optionFields" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Option Type</label>
                            <select class="form-select" id="optionType">
                                <option value="call">Call</option>
                                <option value="put">Put</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Strike Price</label>
                            <input type="number" class="form-input" id="strikePrice" placeholder="0.00" min="0" step="0.01">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Expiration Date</label>
                        <input type="date" class="form-input" id="expirationDate">
                    </div>
                </div>

                <!-- Estimated Total -->
                <div class="price-display" id="estimatedTotal" style="display: none;">
                    <div class="price-display-label">Estimated Total</div>
                    <div class="price-display-value" id="totalCost">--</div>
                </div>

                <!-- Trade Actions -->
                <div class="trade-actions">
                    <button class="btn btn-buy" id="buyBtn">Buy</button>
                    <button class="btn btn-sell" id="sellBtn">Sell</button>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Instrument tabs
        const tabs = document.querySelectorAll('.instrument-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentInstrument = e.target.dataset.type;
                this.updateFormForInstrument();
            });
        });

        // Symbol input with debounced price lookup
        const symbolInput = document.getElementById('tradeSymbol');
        if (symbolInput) {
            symbolInput.addEventListener('input', debounce((e) => {
                this.lookupPrice(e.target.value);
            }, 500));
        }

        // Order type change
        const orderTypeSelect = document.getElementById('orderType');
        if (orderTypeSelect) {
            orderTypeSelect.addEventListener('change', (e) => {
                const limitPriceGroup = document.getElementById('limitPriceGroup');
                if (limitPriceGroup) {
                    limitPriceGroup.style.display = e.target.value === 'limit' ? 'block' : 'none';
                }
            });
        }

        // Quantity input for estimated total
        const qtyInput = document.getElementById('tradeQuantity');
        if (qtyInput) {
            qtyInput.addEventListener('input', () => this.updateEstimatedTotal());
        }

        // Buy/Sell buttons
        const buyBtn = document.getElementById('buyBtn');
        const sellBtn = document.getElementById('sellBtn');
        if (buyBtn) buyBtn.addEventListener('click', () => this.handleTrade('buy'));
        if (sellBtn) sellBtn.addEventListener('click', () => this.handleTrade('sell'));
    }

    /**
     * Update form based on instrument type
     */
    updateFormForInstrument() {
        const optionFields = document.getElementById('optionFields');
        if (optionFields) {
            optionFields.style.display = this.currentInstrument === 'option' ? 'block' : 'none';
        }
    }

    /**
     * Lookup price for symbol
     */
    async lookupPrice(symbol) {
        if (!symbol || symbol.length < 1) {
            this.currentPrice = null;
            this.currentSymbol = null;
            const priceDisplay = document.getElementById('priceDisplay');
            if (priceDisplay) priceDisplay.style.display = 'none';
            return;
        }

        try {
            const upperSymbol = symbol.toUpperCase();
            const data = await this.api.getMarketData(upperSymbol);

            this.currentPrice = data.currentPrice;
            this.currentSymbol = upperSymbol;

            const priceDisplay = document.getElementById('priceDisplay');
            const currentPriceEl = document.getElementById('currentPrice');

            if (priceDisplay && currentPriceEl) {
                currentPriceEl.textContent = formatCurrency(this.currentPrice);
                priceDisplay.style.display = 'block';
            }

            this.updateEstimatedTotal();
        } catch (error) {
            console.error('Failed to lookup price:', error);
            this.currentPrice = null;
        }
    }

    /**
     * Update estimated total
     */
    updateEstimatedTotal() {
        const qtyInput = document.getElementById('tradeQuantity');
        const estimatedTotalEl = document.getElementById('estimatedTotal');
        const totalCostEl = document.getElementById('totalCost');

        if (!qtyInput || !estimatedTotalEl || !totalCostEl) return;

        const qty = parseFloat(qtyInput.value);

        if (this.currentPrice && qty > 0) {
            const total = this.currentPrice * qty;
            totalCostEl.textContent = formatCurrency(total);
            estimatedTotalEl.style.display = 'block';
        } else {
            estimatedTotalEl.style.display = 'none';
        }
    }

    /**
     * Handle trade execution
     */
    async handleTrade(side) {
        try {
            const symbol = document.getElementById('tradeSymbol')?.value.toUpperCase();
            const qty = parseFloat(document.getElementById('tradeQuantity')?.value);
            const orderType = document.getElementById('orderType')?.value;
            const limitPrice = parseFloat(document.getElementById('limitPrice')?.value);

            // Validation
            if (!symbol) {
                showError('Please enter a symbol');
                return;
            }

            if (!qty || qty <= 0) {
                showError('Please enter a valid quantity');
                return;
            }

            if (orderType === 'limit' && (!limitPrice || limitPrice <= 0)) {
                showError('Please enter a valid limit price');
                return;
            }

            // Build order data
            const orderData = {
                symbol,
                side,
                type: orderType,
                qty,
            };

            if (orderType === 'limit') {
                orderData.limitPrice = limitPrice;
            }

            // Place order
            await this.api.placeOrder(this.bullPenId, orderData);

            showSuccess(`${side.toUpperCase()} order placed successfully!`);

            // Reset form
            this.resetForm();

            // Trigger refresh of positions and leaderboard
            window.dispatchEvent(new CustomEvent('trade-executed'));

        } catch (error) {
            console.error('Trade failed:', error);
            showError('Trade failed: ' + error.message);
        }
    }

    /**
     * Reset form
     */
    resetForm() {
        const form = document.querySelector('.trading-form');
        if (!form) return;

        form.querySelectorAll('input').forEach(input => {
            if (input.type === 'text' || input.type === 'number' || input.type === 'date') {
                input.value = '';
            }
        });

        this.currentPrice = null;
        this.currentSymbol = null;

        const priceDisplay = document.getElementById('priceDisplay');
        const estimatedTotal = document.getElementById('estimatedTotal');
        if (priceDisplay) priceDisplay.style.display = 'none';
        if (estimatedTotal) estimatedTotal.style.display = 'none';
    }
}


