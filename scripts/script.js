// Initial data
let holdings = [
    {ticker: 'AAPL', name: 'Apple Inc.', shares: 50, purchase_price: 150.00, purchase_date: '2024-01-15', sector: 'Technology', asset_class: 'US Stocks'},
    {ticker: 'MSFT', name: 'Microsoft Corporation', shares: 30, purchase_price: 320.00, purchase_date: '2024-02-20', sector: 'Technology', asset_class: 'US Stocks'},
    {ticker: 'JNJ', name: 'Johnson & Johnson', shares: 40, purchase_price: 160.00, purchase_date: '2024-03-10', sector: 'Healthcare', asset_class: 'US Stocks'},
    {ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 100, purchase_price: 210.00, purchase_date: '2024-01-05', sector: 'Diversified', asset_class: 'ETF'},
    {ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 25, purchase_price: 140.00, purchase_date: '2024-04-12', sector: 'Technology', asset_class: 'US Stocks'}
];

let dividends = [
    {ticker: 'AAPL', date: '2024-02-15', amount: 0.24, shares: 50},
    {ticker: 'AAPL', date: '2024-05-15', amount: 0.24, shares: 50},
    {ticker: 'AAPL', date: '2024-08-15', amount: 0.25, shares: 50},
    {ticker: 'AAPL', date: '2024-11-15', amount: 0.25, shares: 50},
    {ticker: 'MSFT', date: '2024-03-15', amount: 0.75, shares: 30},
    {ticker: 'MSFT', date: '2024-06-15', amount: 0.75, shares: 30},
    {ticker: 'MSFT', date: '2024-09-15', amount: 0.75, shares: 30},
    {ticker: 'JNJ', date: '2024-04-01', amount: 1.19, shares: 40},
    {ticker: 'JNJ', date: '2024-07-01', amount: 1.19, shares: 40},
    {ticker: 'JNJ', date: '2024-10-01', amount: 1.19, shares: 40},
    {ticker: 'VTI', date: '2024-03-25', amount: 0.85, shares: 100},
    {ticker: 'VTI', date: '2024-06-25', amount: 0.92, shares: 100},
    {ticker: 'VTI', date: '2024-09-25', amount: 0.89, shares: 100},
    {ticker: 'GOOGL', date: '2024-06-10', amount: 0.20, shares: 25},
    {ticker: 'GOOGL', date: '2024-09-10', amount: 0.20, shares: 25}
];

let transactions = [
    {type: 'buy', ticker: 'AAPL', shares: 50, price: 150.00, date: '2024-01-15', fees: 5.00},
    {type: 'buy', ticker: 'MSFT', shares: 30, price: 320.00, date: '2024-02-20', fees: 5.00},
    {type: 'buy', ticker: 'JNJ', shares: 40, price: 160.00, date: '2024-03-10', fees: 5.00},
    {type: 'buy', ticker: 'VTI', shares: 100, price: 210.00, date: '2024-01-05', fees: 7.00},
    {type: 'buy', ticker: 'GOOGL', shares: 25, price: 140.00, date: '2024-04-12', fees: 4.00}
];

const sectorColors = {
    Technology: '#4A90E2',
    Healthcare: '#E24A4A',
    Diversified: '#50C878',
    Finance: '#F5A623',
    Consumer: '#9013FE',
    Energy: '#FF6B6B'
};

let currentPrices = {};
let previousPrices = {};
let charts = {};
let sortColumn = null;
let sortDirection = 'asc';
let activeFilter = 'all';
let trendData = {};
let sparklineAnimations = {};

// Stock insights data
const stockInsights = {
    'AAPL': {
        recommendation: 'BUY',
        analyst_rating: 'Strong Buy',
        price_target: 250,
        analysis: "Apple's stock has surged 78% since your purchase due to strong iPhone 16 sales driven by AI features, continued Services growth (App Store, iCloud, Apple Music), and market expansion. The company trades at a P/E ratio of 36.5x reflecting premium valuation for tech leadership.",
        learning_points: [
            "P/E Ratio: Price-to-Earnings of 36.5x means investors pay $36.50 for every $1 of annual earnings",
            "Market Cap: $3.95 trillion makes Apple the world's most valuable company",
            "Services Revenue: High-margin recurring revenue from subscriptions drives profitability",
            "Economic Moat: Brand loyalty and ecosystem lock-in create competitive advantages"
        ],
        key_factors: [
            "AI integration in iPhone and Siri",
            "App Store and Services revenue growth",
            "China demand recovery",
            "Strong brand loyalty and pricing power"
        ],
        risks: [
            "High valuation vulnerable to market corrections",
            "Regulatory pressure on App Store fees",
            "Dependence on China for manufacturing and sales",
            "Smartphone market saturation"
        ]
    },
    'MSFT': {
        recommendation: 'BUY',
        analyst_rating: 'Buy',
        price_target: 550,
        analysis: "Microsoft gained 59% driven by Azure cloud growth (30%+ annually), OpenAI partnership bringing ChatGPT and Copilot AI to products, and strong enterprise software dominance. Cloud margins are expanding as the division scales.",
        learning_points: [
            "Cloud Margins: Azure profit margins improve as infrastructure scales, boosting overall profitability",
            "Recurring Revenue: Subscription model (Office 365, Azure) provides predictable cash flow",
            "Economic Moat: Enterprise software lock-in makes switching costs high for customers",
            "AI Integration: Copilot AI embedded across products creates new revenue streams"
        ],
        key_factors: [
            "Azure cloud market share gains vs AWS",
            "AI Copilot adoption in Office and Windows",
            "Gaming division (Xbox, Activision acquisition)",
            "LinkedIn and Teams growth"
        ],
        risks: [
            "Intense cloud competition from Amazon and Google",
            "Regulatory scrutiny on market dominance",
            "High expectations priced into stock",
            "Cybersecurity threats to cloud infrastructure"
        ]
    },
    'JNJ': {
        recommendation: 'HOLD',
        analyst_rating: 'Hold',
        price_target: 180,
        analysis: "J&J rose 24% as a defensive healthcare stock with stable pharmaceutical revenue, 3.0% dividend yield, and consistent cash flow. Beta of 0.36 means it's much less volatile than the overall market, making it a portfolio stabilizer.",
        learning_points: [
            "Dividend Aristocrat: Companies that have increased dividends for 25+ consecutive years",
            "Beta: 0.36 means stock is 64% less volatile than the market (beta 1.0 = market volatility)",
            "Defensive Stock: Healthcare demand remains stable regardless of economic conditions",
            "Diversification: Consumer health, pharmaceuticals, and medical devices reduce single-product risk"
        ],
        key_factors: [
            "Strong pharmaceutical pipeline with new drug approvals",
            "Legal settlements resolved reducing uncertainty",
            "Consistent dividend payments and increases",
            "Healthcare sector stability during market volatility"
        ],
        risks: [
            "Patent cliffs as major drugs lose exclusivity",
            "Ongoing litigation related to consumer products",
            "Slower growth compared to technology stocks",
            "Healthcare regulation and pricing pressure"
        ]
    },
    'VTI': {
        recommendation: 'BUY',
        analyst_rating: 'Buy',
        price_target: 280,
        analysis: "VTI gained 60% tracking the entire US stock market across 3,500+ companies. With a 0.03% expense ratio, it provides instant diversification at minimal cost. Market-cap weighting means larger companies like Apple and Microsoft drive returns.",
        learning_points: [
            "ETF Structure: Exchange-Traded Fund tracks an index, providing instant diversification",
            "Expense Ratio: 0.03% means you pay only $3 per year for every $10,000 invested",
            "Market-Cap Weighting: Larger companies get bigger allocation, so tech giants dominate returns",
            "Index Investing: Passive strategy that matches market returns rather than trying to beat it"
        ],
        key_factors: [
            "Overall US stock market strength in 2024",
            "Broad diversification across all sectors and sizes",
            "Ultra-low cost structure preserves returns",
            "Tax efficiency compared to mutual funds"
        ],
        risks: [
            "Complete market correlation (beta = 1.0) means no downside protection",
            "Cannot outperform the market by design",
            "Heavy concentration in technology sector (30%+)",
            "No active management to avoid troubled companies"
        ]
    },
    'GOOGL': {
        recommendation: 'BUY',
        analyst_rating: 'Strong Buy',
        price_target: 200,
        analysis: "Google surged 104% on search advertising strength, YouTube revenue growth, Gemini AI launch competing with ChatGPT, and cloud business acceleration. Warren Buffett invested $4.3B signaling confidence. Network effects create a powerful moat in search.",
        learning_points: [
            "Network Effects: More users make search better, which attracts more users (self-reinforcing)",
            "Advertising Model: Free services monetized through targeted ads based on user data",
            "Economic Moat: 90%+ search market share creates enormous competitive advantage",
            "Cloud Growth: Google Cloud growing 30%+ annually, improving overall profit margins"
        ],
        key_factors: [
            "AI search improvements maintaining dominance",
            "YouTube Shorts competing with TikTok",
            "Google Cloud margins expanding toward profitability",
            "Cost discipline and efficiency improvements"
        ],
        risks: [
            "Antitrust lawsuits threatening to break up the company",
            "AI competition from ChatGPT changing search behavior",
            "Advertising cyclicality tied to economic conditions",
            "Regulatory pressure on data privacy and market power"
        ]
    }
};

// Get recommendation for a ticker
function getRecommendation(ticker) {
    return stockInsights[ticker]?.recommendation || 'HOLD';
}

// Generate 30-day trend data
function generateTrendData(ticker, purchasePrice, currentPrice) {
    const days = 30;
    const data = [];
    const startPrice = purchasePrice;
    const endPrice = currentPrice;
    
    // Generate smooth trend from purchase price to current price
    for (let i = 0; i < days; i++) {
        const progress = i / (days - 1);
        const basePrice = startPrice + (endPrice - startPrice) * progress;
        
        // Add volatility (±2-5% daily)
        const volatility = 0.02 + Math.random() * 0.03;
        const change = (Math.random() - 0.5) * 2 * volatility;
        const price = basePrice * (1 + change);
        
        data.push(Math.max(price, 0.01));
    }
    
    // Ensure last price matches current price
    data[data.length - 1] = currentPrice;
    
    return data;
}

// Initialize current prices
function initializePrices() {
    holdings.forEach(holding => {
        const fluctuation = 1 + (Math.random() * 0.20 - 0.05);
        currentPrices[holding.ticker] = holding.purchase_price * fluctuation;
        previousPrices[holding.ticker] = currentPrices[holding.ticker];
        trendData[holding.ticker] = generateTrendData(
            holding.ticker,
            holding.purchase_price,
            currentPrices[holding.ticker]
        );
    });
}

// Update prices to simulate real-time
function updatePrices() {
    holdings.forEach(holding => {
        previousPrices[holding.ticker] = currentPrices[holding.ticker];
        const change = (Math.random() - 0.5) * 2;
        currentPrices[holding.ticker] = Math.max(currentPrices[holding.ticker] * (1 + change / 100), 0.01);
        
        // Update trend data - shift left and add new price
        trendData[holding.ticker].shift();
        trendData[holding.ticker].push(currentPrices[holding.ticker]);
    });
    updateDashboard();
}

// Format currency
function formatCurrency(value) {
    return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format percentage
function formatPercent(value) {
    return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
}

// Calculate metrics
function calculateMetrics() {
    let totalValue = 0;
    let totalCostBasis = 0;
    let todayChange = 0;

    holdings.forEach(holding => {
        const currentValue = holding.shares * currentPrices[holding.ticker];
        const costBasis = holding.shares * holding.purchase_price;
        const previousValue = holding.shares * previousPrices[holding.ticker];
        
        totalValue += currentValue;
        totalCostBasis += costBasis;
        todayChange += (currentValue - previousValue);
    });

    const totalGain = totalValue - totalCostBasis;
    const totalGainPercent = (totalGain / totalCostBasis) * 100;
    const todayChangePercent = (todayChange / (totalValue - todayChange)) * 100;

    const currentYear = 2024;
    const dividendIncome = dividends
        .filter(d => new Date(d.date).getFullYear() === currentYear)
        .reduce((sum, d) => sum + (d.amount * d.shares), 0);

    const estimatedAnnual = dividends.reduce((sum, d) => sum + (d.amount * d.shares), 0);

    return {
        totalValue,
        totalCostBasis,
        totalGain,
        totalGainPercent,
        todayChange,
        todayChangePercent,
        dividendIncome,
        estimatedAnnual
    };
}

// Update metrics display
function updateMetrics() {
    const metrics = calculateMetrics();

    document.getElementById('totalValue').textContent = formatCurrency(metrics.totalValue);
    
    const gainElement = document.getElementById('totalGain');
    gainElement.textContent = formatCurrency(metrics.totalGain);
    gainElement.className = 'metric-value ' + (metrics.totalGain >= 0 ? 'positive' : 'negative');

    const gainPercentElement = document.getElementById('totalGainPercent');
    gainPercentElement.textContent = formatPercent(metrics.totalGainPercent);
    gainPercentElement.className = 'metric-change ' + (metrics.totalGain >= 0 ? 'positive' : 'negative');

    document.getElementById('dividendIncome').textContent = formatCurrency(metrics.dividendIncome);
    document.getElementById('estimatedAnnual').textContent = 'Est. Annual: ' + formatCurrency(metrics.estimatedAnnual);

    const todayElement = document.getElementById('todayChange');
    todayElement.textContent = formatCurrency(metrics.todayChange);
    todayElement.className = 'metric-value ' + (metrics.todayChange >= 0 ? 'positive' : 'negative');

    const todayPercentElement = document.getElementById('todayChangePercent');
    todayPercentElement.textContent = formatPercent(metrics.todayChangePercent);
    todayPercentElement.className = 'metric-change ' + (metrics.todayChange >= 0 ? 'positive' : 'negative');

    document.getElementById('lastUpdated').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
}

// Update holdings table
function updateHoldingsTable() {
    const tbody = document.getElementById('holdingsBody');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredHoldings = holdings.filter(holding => {
        const matchesSearch = holding.ticker.toLowerCase().includes(searchTerm) || 
                            holding.name.toLowerCase().includes(searchTerm);
        const matchesFilter = activeFilter === 'all' || holding.sector === activeFilter;
        return matchesSearch && matchesFilter;
    });

    if (sortColumn) {
        filteredHoldings.sort((a, b) => {
            let aVal, bVal;
            
            if (sortColumn === 'current_price') {
                aVal = currentPrices[a.ticker];
                bVal = currentPrices[b.ticker];
            } else if (sortColumn === 'current_value') {
                aVal = a.shares * currentPrices[a.ticker];
                bVal = b.shares * currentPrices[b.ticker];
            } else if (sortColumn === 'gain_loss') {
                aVal = (currentPrices[a.ticker] - a.purchase_price) * a.shares;
                bVal = (currentPrices[b.ticker] - b.purchase_price) * b.shares;
            } else if (sortColumn === 'gain_loss_percent') {
                aVal = ((currentPrices[a.ticker] - a.purchase_price) / a.purchase_price) * 100;
                bVal = ((currentPrices[b.ticker] - b.purchase_price) / b.purchase_price) * 100;
            } else {
                aVal = a[sortColumn];
                bVal = b[sortColumn];
            }

            if (typeof aVal === 'string') {
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }

    tbody.innerHTML = filteredHoldings.map(holding => {
        const currentPrice = currentPrices[holding.ticker];
        const currentValue = holding.shares * currentPrice;
        const costBasis = holding.shares * holding.purchase_price;
        const gainLoss = currentValue - costBasis;
        const gainLossPercent = (gainLoss / costBasis) * 100;

        const sparklineId = `sparkline-${holding.ticker}`;
        
        return `
            <tr>
                <td><strong style="color: var(--color-primary);">${holding.ticker}</strong></td>
                <td>${holding.name}</td>
                <td>${holding.shares}</td>
                <td>${formatCurrency(holding.purchase_price)}</td>
                <td>${formatCurrency(currentPrice)}</td>
                <td>
                    <canvas id="${sparklineId}" 
                            class="sparkline" 
                            width="100" 
                            height="35"
                            data-ticker="${holding.ticker}"
                            style="cursor: pointer;"></canvas>
                </td>
                <td><strong>${formatCurrency(currentValue)}</strong></td>
                <td class="${gainLoss >= 0 ? 'positive' : 'negative'}">
                    <strong>${formatCurrency(gainLoss)}</strong>
                </td>
                <td class="${gainLoss >= 0 ? 'positive' : 'negative'}">
                    <strong>${formatPercent(gainLossPercent)}</strong>
                </td>
                <td><span class="recommendation-badge recommendation-${getRecommendation(holding.ticker).toLowerCase()}">${getRecommendation(holding.ticker)}</span></td>
                <td><button class="info-btn" data-ticker="${holding.ticker}" title="View insights">💡</button></td>
                <td>${holding.sector}</td>
            </tr>
        `;
    }).join('');
    
    // Render sparklines after table update
    setTimeout(() => renderAllSparklines(), 0);
}

// Render sparkline for a single holding
function renderSparkline(ticker, animate = false) {
    const canvas = document.getElementById(`sparkline-${ticker}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = trendData[ticker];
    if (!data || data.length === 0) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 3;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;
    
    // Calculate min/max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    // Determine trend color
    const firstPrice = data[0];
    const lastPrice = data[data.length - 1];
    const isPositive = lastPrice >= firstPrice;
    const isFlat = Math.abs(lastPrice - firstPrice) / firstPrice < 0.01;
    
    let lineColor, fillColor;
    if (isFlat) {
        lineColor = 'rgba(119, 124, 124, 0.8)';
        fillColor = 'rgba(119, 124, 124, 0.1)';
    } else if (isPositive) {
        lineColor = 'rgba(34, 197, 94, 0.9)';
        fillColor = 'rgba(34, 197, 94, 0.1)';
    } else {
        lineColor = 'rgba(192, 21, 47, 0.9)';
        fillColor = 'rgba(192, 21, 47, 0.1)';
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Animation progress
    let progress = 1;
    if (animate && sparklineAnimations[ticker] !== undefined) {
        progress = sparklineAnimations[ticker];
    }
    
    const pointsToShow = Math.floor(data.length * progress);
    if (pointsToShow < 2) return;
    
    // Create path
    ctx.beginPath();
    
    for (let i = 0; i < pointsToShow; i++) {
        const x = padding + (i / (data.length - 1)) * plotWidth;
        const y = padding + plotHeight - ((data[i] - min) / range) * plotHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    // Draw fill
    const lastX = padding + ((pointsToShow - 1) / (data.length - 1)) * plotWidth;
    const lastY = padding + plotHeight - ((data[pointsToShow - 1] - min) / range) * plotHeight;
    
    ctx.lineTo(lastX, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    for (let i = 0; i < pointsToShow; i++) {
        const x = padding + (i / (data.length - 1)) * plotWidth;
        const y = padding + plotHeight - ((data[i] - min) / range) * plotHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw mini data points
    ctx.fillStyle = lineColor;
    for (let i = 0; i < pointsToShow; i += 5) {
        const x = padding + (i / (data.length - 1)) * plotWidth;
        const y = padding + plotHeight - ((data[i] - min) / range) * plotHeight;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Render all sparklines
function renderAllSparklines(animate = true) {
    holdings.forEach(holding => {
        if (animate) {
            sparklineAnimations[holding.ticker] = 0;
            animateSparkline(holding.ticker);
        } else {
            renderSparkline(holding.ticker, false);
        }
    });
}

// Animate sparkline drawing
function animateSparkline(ticker) {
    const duration = 1000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sparklineAnimations[ticker] = progress;
        renderSparkline(ticker, true);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Setup sparkline interactions
function setupSparklineInteractions() {
    const tooltip = document.getElementById('sparklineTooltip');
    let currentHoverTicker = null;
    
    document.addEventListener('mousemove', (e) => {
        if (e.target.classList.contains('sparkline')) {
            const ticker = e.target.getAttribute('data-ticker');
            currentHoverTicker = ticker;
            
            const data = trendData[ticker];
            if (!data) return;
            
            const high = Math.max(...data);
            const low = Math.min(...data);
            const first = data[0];
            const last = data[data.length - 1];
            const change = ((last - first) / first) * 100;
            
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 29);
            
            document.getElementById('tooltipHigh').textContent = formatCurrency(high);
            document.getElementById('tooltipLow').textContent = formatCurrency(low);
            document.getElementById('tooltipChange').textContent = formatPercent(change);
            document.getElementById('tooltipChange').className = 'tooltip-value ' + (change >= 0 ? 'positive' : 'negative');
            document.getElementById('tooltipRange').textContent = 
                startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' - ' +
                endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            tooltip.classList.add('active');
            
            // Position tooltip
            const offsetX = 15;
            const offsetY = 15;
            let left = e.pageX + offsetX;
            let top = e.pageY + offsetY;
            
            // Keep tooltip in viewport
            const tooltipRect = tooltip.getBoundingClientRect();
            if (left + tooltipRect.width > window.innerWidth) {
                left = e.pageX - tooltipRect.width - offsetX;
            }
            if (top + tooltipRect.height > window.innerHeight) {
                top = e.pageY - tooltipRect.height - offsetY;
            }
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        } else {
            if (currentHoverTicker) {
                tooltip.classList.remove('active');
                currentHoverTicker = null;
            }
        }
    });
    
    // Click to show detail chart
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('sparkline')) {
            const ticker = e.target.getAttribute('data-ticker');
            showDetailChart(ticker);
        }
    });
}

// Show detailed chart modal
let detailChart = null;

function showDetailChart(ticker) {
    const holding = holdings.find(h => h.ticker === ticker);
    if (!holding) return;
    
    const modal = document.getElementById('detailChartModal');
    const data = trendData[ticker];
    
    // Update title
    document.getElementById('detailChartTitle').textContent = 
        `${ticker} - 30-Day Price History`;
    
    // Calculate statistics
    const high = Math.max(...data);
    const low = Math.min(...data);
    const first = data[0];
    const last = data[data.length - 1];
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
    const volatility = Math.sqrt(variance) / avg * 100;
    const change = ((last - first) / first) * 100;
    
    // Display stats
    const statsHtml = `
        <div class="detail-stat-card">
            <div class="detail-stat-label">High</div>
            <div class="detail-stat-value">${formatCurrency(high)}</div>
        </div>
        <div class="detail-stat-card">
            <div class="detail-stat-label">Low</div>
            <div class="detail-stat-value">${formatCurrency(low)}</div>
        </div>
        <div class="detail-stat-card">
            <div class="detail-stat-label">Average</div>
            <div class="detail-stat-value">${formatCurrency(avg)}</div>
        </div>
        <div class="detail-stat-card">
            <div class="detail-stat-label">Volatility</div>
            <div class="detail-stat-value">${volatility.toFixed(2)}%</div>
        </div>
        <div class="detail-stat-card">
            <div class="detail-stat-label">30d Change</div>
            <div class="detail-stat-value ${change >= 0 ? 'positive' : 'negative'}">${formatPercent(change)}</div>
        </div>
    `;
    document.getElementById('detailStats').innerHTML = statsHtml;
    
    // Create labels for last 30 days
    const labels = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Calculate moving averages
    function calculateMA(data, period) {
        const ma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                ma.push(null);
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                ma.push(sum / period);
            }
        }
        return ma;
    }
    
    const ma7 = calculateMA(data, 7);
    const ma14 = calculateMA(data, 14);
    
    // Generate simulated volume data
    const volumeData = data.map(() => Math.random() * 1000000 + 500000);
    
    // Destroy existing chart
    if (detailChart) {
        detailChart.destroy();
    }
    
    // Create detailed chart
    const ctx = document.getElementById('detailChart').getContext('2d');
    detailChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Price',
                    data: data,
                    borderColor: change >= 0 ? '#22A35A' : '#C0152F',
                    backgroundColor: change >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(192, 21, 47, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: '7-day MA',
                    data: ma7,
                    borderColor: '#4A90E2',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: '14-day MA',
                    data: ma14,
                    borderColor: '#F5A623',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: 'Volume',
                    data: volumeData,
                    backgroundColor: 'rgba(98, 108, 113, 0.3)',
                    borderWidth: 0,
                    type: 'bar',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.yAxisID === 'y1') {
                                label += Math.round(context.parsed.y).toLocaleString();
                            } else {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Price ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Volume'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
    
    modal.classList.add('active');
}

// Close detail chart modal
document.getElementById('closeDetailChart').addEventListener('click', () => {
    document.getElementById('detailChartModal').classList.remove('active');
});

document.getElementById('detailChartModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailChartModal') {
        document.getElementById('detailChartModal').classList.remove('active');
    }
});

// Update performance metrics
function updatePerformanceMetrics() {
    const metrics = calculateMetrics();
    
    // Calculate portfolio beta (simplified)
    const avgBeta = 1.05;
    document.getElementById('portfolioBeta').textContent = avgBeta.toFixed(2);

    // Calculate average dividend yield
    const totalDividends = dividends.reduce((sum, d) => sum + (d.amount * d.shares), 0);
    const avgYield = (totalDividends / metrics.totalValue) * 100;
    document.getElementById('avgDivYield').textContent = avgYield.toFixed(2) + '%';

    // Find best and worst performers
    let best = holdings[0];
    let worst = holdings[0];
    let bestGain = -Infinity;
    let worstGain = Infinity;

    holdings.forEach(holding => {
        const gainPercent = ((currentPrices[holding.ticker] - holding.purchase_price) / holding.purchase_price) * 100;
        if (gainPercent > bestGain) {
            bestGain = gainPercent;
            best = holding;
        }
        if (gainPercent < worstGain) {
            worstGain = gainPercent;
            worst = holding;
        }
    });

    document.getElementById('bestPerformer').textContent = `${best.ticker} (${formatPercent(bestGain)})`;
    document.getElementById('worstPerformer').textContent = `${worst.ticker} (${formatPercent(worstGain)})`;
    document.getElementById('totalCostBasis').textContent = formatCurrency(metrics.totalCostBasis);
}

// Update charts
function updateCharts() {
    // Sector allocation
    const sectorData = {};
    holdings.forEach(holding => {
        const value = holding.shares * currentPrices[holding.ticker];
        sectorData[holding.sector] = (sectorData[holding.sector] || 0) + value;
    });

    if (charts.sector) {
        charts.sector.data.labels = Object.keys(sectorData);
        charts.sector.data.datasets[0].data = Object.values(sectorData);
        charts.sector.data.datasets[0].backgroundColor = Object.keys(sectorData).map(s => sectorColors[s]);
        charts.sector.update();
    } else {
        const ctx = document.getElementById('sectorChart').getContext('2d');
        charts.sector = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(sectorData),
                datasets: [{
                    data: Object.values(sectorData),
                    backgroundColor: Object.keys(sectorData).map(s => sectorColors[s])
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }

    // Asset class allocation
    const assetData = {};
    holdings.forEach(holding => {
        const value = holding.shares * currentPrices[holding.ticker];
        assetData[holding.asset_class] = (assetData[holding.asset_class] || 0) + value;
    });

    const assetColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];

    if (charts.assetClass) {
        charts.assetClass.data.labels = Object.keys(assetData);
        charts.assetClass.data.datasets[0].data = Object.values(assetData);
        charts.assetClass.update();
    } else {
        const ctx = document.getElementById('assetClassChart').getContext('2d');
        charts.assetClass = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(assetData),
                datasets: [{
                    data: Object.values(assetData),
                    backgroundColor: assetColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }

    // Performance bar chart
    const performanceData = holdings.map(holding => {
        return {
            ticker: holding.ticker,
            percent: ((currentPrices[holding.ticker] - holding.purchase_price) / holding.purchase_price) * 100
        };
    });

    if (charts.performance) {
        charts.performance.data.labels = performanceData.map(d => d.ticker);
        charts.performance.data.datasets[0].data = performanceData.map(d => d.percent);
        charts.performance.data.datasets[0].backgroundColor = performanceData.map(d => d.percent >= 0 ? '#22A35A' : '#C0152F');
        charts.performance.update();
    } else {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: performanceData.map(d => d.ticker),
                datasets: [{
                    label: 'Gain/Loss %',
                    data: performanceData.map(d => d.percent),
                    backgroundColor: performanceData.map(d => d.percent >= 0 ? '#22A35A' : '#C0152F')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatPercent(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Dividend timeline
    const dividendsByMonth = {};
    dividends.forEach(div => {
        const date = new Date(div.date);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const amount = div.amount * div.shares;
        dividendsByMonth[monthKey] = (dividendsByMonth[monthKey] || 0) + amount;
    });

    const sortedMonths = Object.keys(dividendsByMonth).sort((a, b) => {
        return new Date(a) - new Date(b);
    });

    if (charts.dividend) {
        charts.dividend.data.labels = sortedMonths;
        charts.dividend.data.datasets[0].data = sortedMonths.map(m => dividendsByMonth[m]);
        charts.dividend.update();
    } else {
        const ctx = document.getElementById('dividendChart').getContext('2d');
        charts.dividend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedMonths,
                datasets: [{
                    label: 'Dividend Income',
                    data: sortedMonths.map(m => dividendsByMonth[m]),
                    backgroundColor: '#21808D'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Update dividend list
function updateDividendList() {
    const sortedDividends = [...dividends].sort((a, b) => new Date(b.date) - new Date(a.date));
    const dividendList = document.getElementById('dividendList');
    
    dividendList.innerHTML = sortedDividends.slice(0, 10).map(div => {
        const total = div.amount * div.shares;
        return `
            <div class="dividend-item">
                <div class="dividend-info">
                    <span class="dividend-ticker">${div.ticker}</span>
                    <span class="dividend-date">${new Date(div.date).toLocaleDateString()}</span>
                    <span>$${div.amount.toFixed(2)} × ${div.shares} shares</span>
                </div>
                <div class="dividend-amount">${formatCurrency(total)}</div>
            </div>
        `;
    }).join('');
}

// Update transactions
function updateTransactions() {
    const tbody = document.getElementById('transactionsBody');
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedTransactions.map(tx => {
        const total = tx.shares * tx.price + tx.fees;
        return `
            <tr>
                <td>${new Date(tx.date).toLocaleDateString()}</td>
                <td><span style="text-transform: uppercase; font-weight: 500;">${tx.type}</span></td>
                <td><strong style="color: var(--color-primary);">${tx.ticker}</strong></td>
                <td>${tx.shares}</td>
                <td>${formatCurrency(tx.price)}</td>
                <td>${formatCurrency(tx.fees)}</td>
                <td><strong>${formatCurrency(total)}</strong></td>
            </tr>
        `;
    }).join('');
}

// Update entire dashboard
function updateDashboard() {
    updateMetrics();
    updateHoldingsTable();
    updatePerformanceMetrics();
    updateCharts();
    updateDividendList();
    updateTransactions();
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', function() {
    const currentScheme = document.documentElement.getAttribute('data-color-scheme');
    const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-color-scheme', newScheme);
});

// Table sorting
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', function() {
        const column = this.getAttribute('data-sort');
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        updateHoldingsTable();
    });
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', updateHoldingsTable);

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeFilter = this.getAttribute('data-filter');
        updateHoldingsTable();
    });
});

// Modal handling
const addPositionModal = document.getElementById('addPositionModal');
const addPositionBtn = document.getElementById('addPositionBtn');
const closeModalBtn = document.getElementById('closeModal');

addPositionBtn.addEventListener('click', () => {
    addPositionModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    addPositionModal.classList.remove('active');
});

addPositionModal.addEventListener('click', (e) => {
    if (e.target === addPositionModal) {
        addPositionModal.classList.remove('active');
    }
});

// Add position form
document.getElementById('addPositionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPosition = {
        ticker: document.getElementById('ticker').value.toUpperCase(),
        name: document.getElementById('companyName').value,
        shares: parseFloat(document.getElementById('shares').value),
        purchase_price: parseFloat(document.getElementById('purchasePrice').value),
        purchase_date: document.getElementById('purchaseDate').value,
        sector: document.getElementById('sector').value,
        asset_class: document.getElementById('assetClass').value
    };

    holdings.push(newPosition);
    currentPrices[newPosition.ticker] = newPosition.purchase_price * (1 + (Math.random() * 0.20 - 0.05));
    previousPrices[newPosition.ticker] = currentPrices[newPosition.ticker];
    trendData[newPosition.ticker] = generateTrendData(
        newPosition.ticker,
        newPosition.purchase_price,
        currentPrices[newPosition.ticker]
    );

    // Add default insights for new position if not exists
    if (!stockInsights[newPosition.ticker]) {
        stockInsights[newPosition.ticker] = {
            recommendation: 'HOLD',
            analyst_rating: 'Hold',
            price_target: currentPrices[newPosition.ticker] * 1.15,
            analysis: `${newPosition.name} is a new position in your portfolio. Monitor its performance and research the company's fundamentals to make informed decisions.`,
            learning_points: [
                "Research: Always research a company's business model, competitive position, and financial health",
                "Diversification: Don't put all your money in one stock - spread risk across multiple holdings",
                "Time Horizon: Consider your investment timeline when evaluating performance",
                "Due Diligence: Read earnings reports, analyst coverage, and industry trends regularly"
            ],
            key_factors: [
                "Company fundamentals and earnings growth",
                "Industry trends and competitive landscape",
                "Management quality and strategy execution",
                "Market conditions and economic factors"
            ],
            risks: [
                "Lack of historical performance data in your portfolio",
                "Market volatility and sector-specific risks",
                "Company-specific operational risks",
                "Ensure proper research before making further investments"
            ]
        };
    }

    transactions.push({
        type: 'buy',
        ticker: newPosition.ticker,
        shares: newPosition.shares,
        price: newPosition.purchase_price,
        date: newPosition.purchase_date,
        fees: 5.00
    });

    updateDashboard();
    addPositionModal.classList.remove('active');
    this.reset();
});

// Export functionality
const exportModal = document.getElementById('exportModal');
const exportBtn = document.getElementById('exportBtn');
const closeExportBtn = document.getElementById('closeExportModal');

exportBtn.addEventListener('click', () => {
    const metrics = calculateMetrics();
    const exportText = `
PORTFOLIO SUMMARY
${'='.repeat(50)}

Generated: ${new Date().toLocaleString()}

OVERVIEW
${'-'.repeat(50)}
Total Portfolio Value: ${formatCurrency(metrics.totalValue)}
Total Cost Basis: ${formatCurrency(metrics.totalCostBasis)}
Total Gain/Loss: ${formatCurrency(metrics.totalGain)} (${formatPercent(metrics.totalGainPercent)})
Today's Change: ${formatCurrency(metrics.todayChange)} (${formatPercent(metrics.todayChangePercent)})
Dividend Income YTD: ${formatCurrency(metrics.dividendIncome)}
Estimated Annual: ${formatCurrency(metrics.estimatedAnnual)}

HOLDINGS
${'-'.repeat(50)}
${holdings.map(h => {
const currentValue = h.shares * currentPrices[h.ticker];
const costBasis = h.shares * h.purchase_price;
const gain = currentValue - costBasis;
const gainPercent = (gain / costBasis) * 100;
return `${h.ticker} - ${h.name}
Shares: ${h.shares}
Purchase Price: ${formatCurrency(h.purchase_price)}
Current Price: ${formatCurrency(currentPrices[h.ticker])}
Current Value: ${formatCurrency(currentValue)}
Gain/Loss: ${formatCurrency(gain)} (${formatPercent(gainPercent)})`;
}).join('\n\n')}

This summary was generated by your Portfolio Dashboard.
    `;
    
    document.getElementById('exportContent').textContent = exportText;
    exportModal.classList.add('active');
});

closeExportBtn.addEventListener('click', () => {
    exportModal.classList.remove('active');
});

exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
        exportModal.classList.remove('active');
    }
});

// Info button functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('info-btn')) {
        const ticker = e.target.getAttribute('data-ticker');
        showInsights(ticker);
    }
});

// Show insights modal
function showInsights(ticker) {
    const insights = stockInsights[ticker];
    if (!insights) return;

    const holding = holdings.find(h => h.ticker === ticker);
    const currentPrice = currentPrices[ticker];
    const gainPercent = ((currentPrice - holding.purchase_price) / holding.purchase_price) * 100;

    document.getElementById('insightsTitle').textContent = `${ticker} - ${holding.name}`;

    const insightsHtml = `
        <div class="insights-section">
            <div style="display: flex; align-items: center; margin-bottom: var(--space-16);">
                <span class="recommendation-badge recommendation-${insights.recommendation.toLowerCase()}">${insights.recommendation}</span>
                <span class="rating-badge">${insights.analyst_rating}</span>
                <span style="margin-left: var(--space-12); color: var(--color-text-secondary); font-size: var(--font-size-sm);">Price Target: ${formatCurrency(insights.price_target)}</span>
            </div>
            
            <div style="background: var(--color-background); padding: var(--space-16); border-radius: var(--radius-base); margin-bottom: var(--space-20); border-left: 4px solid var(--color-primary);">
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-4);">Your Performance</div>
                <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: ${gainPercent >= 0 ? 'var(--color-green-500)' : 'var(--color-red-500)'};">Gain of ${formatPercent(gainPercent)}</div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-4);">Purchase: ${formatCurrency(holding.purchase_price)} → Current: ${formatCurrency(currentPrice)}</div>
            </div>
        </div>

        <div class="insights-section">
            <h4 class="insights-title">Why the Price Changed</h4>
            <p class="insights-text">${insights.analysis}</p>
        </div>

        <div class="insights-section">
            <h4 class="insights-title">🎯 Key Factors Driving Performance</h4>
            <ul class="insights-list">
                ${insights.key_factors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
        </div>

        <div class="insights-section">
            <h4 class="insights-title">💡 Learning Points - Financial Concepts</h4>
            <ul class="insights-list">
                ${insights.learning_points.map(point => `<li><strong>${point.split(':')[0]}:</strong>${point.split(':')[1]}</li>`).join('')}
            </ul>
        </div>

        <div class="insights-section">
            <h4 class="insights-title">⚠️ Risks to Monitor</h4>
            <ul class="insights-list">
                ${insights.risks.map(risk => `<li>${risk}</li>`).join('')}
            </ul>
        </div>
    `;

    document.getElementById('insightsContent').innerHTML = insightsHtml;
    document.getElementById('insightsModal').classList.add('active');
}

// Close insights modal
document.getElementById('closeInsightsModal').addEventListener('click', () => {
    document.getElementById('insightsModal').classList.remove('active');
});

document.getElementById('insightsModal').addEventListener('click', (e) => {
    if (e.target.id === 'insightsModal') {
        document.getElementById('insightsModal').classList.remove('active');
    }
});

// Initialize
initializePrices();
updateDashboard();
setupSparklineInteractions();

// Update prices every 30 seconds
setInterval(updatePrices, 30000);