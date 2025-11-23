/**
 * Sample Data
 * Initial data for demo purposes
 * In production, this will be loaded from the database per user
 */

export const sampleHoldings = [
    {ticker: 'AAPL', name: 'Apple Inc.', shares: 50, purchase_price: 150.00, purchase_date: '2024-01-15', sector: 'Technology', asset_class: 'US Stocks'},
    {ticker: 'MSFT', name: 'Microsoft Corporation', shares: 30, purchase_price: 320.00, purchase_date: '2024-02-20', sector: 'Technology', asset_class: 'US Stocks'},
    {ticker: 'JNJ', name: 'Johnson & Johnson', shares: 40, purchase_price: 160.00, purchase_date: '2024-03-10', sector: 'Healthcare', asset_class: 'US Stocks'},
    {ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 100, purchase_price: 210.00, purchase_date: '2024-01-05', sector: 'Diversified', asset_class: 'ETF'},
    {ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 25, purchase_price: 140.00, purchase_date: '2024-04-12', sector: 'Technology', asset_class: 'US Stocks'}
];

export const sampleDividends = [
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

export const sampleTransactions = [
    {type: 'buy', ticker: 'AAPL', shares: 50, price: 150.00, date: '2024-01-15', fees: 5.00},
    {type: 'buy', ticker: 'MSFT', shares: 30, price: 320.00, date: '2024-02-20', fees: 5.00},
    {type: 'buy', ticker: 'JNJ', shares: 40, price: 160.00, date: '2024-03-10', fees: 5.00},
    {type: 'buy', ticker: 'VTI', shares: 100, price: 210.00, date: '2024-01-05', fees: 7.00},
    {type: 'buy', ticker: 'GOOGL', shares: 25, price: 140.00, date: '2024-04-12', fees: 4.00}
];

// Stock insights data - in production, this would come from an API or database
export const stockInsights = {
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

/**
 * Get recommendation for a ticker
 * @param {string} ticker - Stock ticker
 * @returns {string} Recommendation (BUY, HOLD, SELL)
 */
export function getRecommendation(ticker) {
    return stockInsights[ticker]?.recommendation || 'HOLD';
}

/**
 * Get insights for a ticker
 * @param {string} ticker - Stock ticker
 * @returns {Object|null} Stock insights or null
 */
export function getInsights(ticker) {
    return stockInsights[ticker] || null;
}

