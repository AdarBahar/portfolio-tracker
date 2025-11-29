# React Dashboard Migration Plan - Phase 2

## Overview

Migrate the comprehensive dashboard from vanilla HTML/JS to React with full functionality including metrics, holdings table, charts, and modals.

## Current Dashboard Structure

### Key Sections
1. **Header** - Title, theme toggle, export button, add position button
2. **Metrics Grid** - 4 metric cards (total value, gain/loss, dividend income, today's change)
3. **Holdings Table** - Searchable, filterable, sortable table with 13 columns
4. **Charts** - Sector allocation, asset class, performance, dividend charts
5. **Performance Metrics** - Portfolio beta, dividend yield, best/worst performers
6. **Dividend Income** - Chart and list of dividends
7. **Transaction History** - Table of all transactions
8. **Modals** - Add position, export, insights, detail chart

### Key Features
- Real-time price updates (every 30 seconds)
- Search and filter functionality
- Sortable columns
- Sparkline charts (30-day trends)
- Theme toggle (light/dark)
- Export portfolio summary
- Add new positions
- Ticker autocomplete

## Component Architecture

```
Dashboard/
├── Dashboard.tsx (main container)
├── components/
│   ├── Header.tsx
│   ├── MetricsGrid.tsx
│   │   └── MetricCard.tsx
│   ├── HoldingsSection.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterButtons.tsx
│   │   └── HoldingsTable.tsx
│   ├── ChartsSection.tsx
│   │   ├── SectorChart.tsx
│   │   ├── AssetClassChart.tsx
│   │   ├── PerformanceChart.tsx
│   │   └── DividendChart.tsx
│   ├── PerformanceMetrics.tsx
│   ├── DividendSection.tsx
│   ├── TransactionHistory.tsx
│   └── Modals/
│       ├── AddPositionModal.tsx
│       ├── ExportModal.tsx
│       ├── InsightsModal.tsx
│       └── DetailChartModal.tsx
├── hooks/
│   ├── usePortfolioData.ts
│   ├── usePriceUpdates.ts
│   └── useCharts.ts
└── utils/
    ├── calculations.ts
    ├── formatting.ts
    └── chartConfig.ts
```

## Implementation Steps

### Step 1: Create Dashboard Container
- Main Dashboard.tsx component
- Layout structure with sections
- State management for holdings, prices, modals

### Step 2: Create Metrics Components
- MetricsGrid component
- MetricCard component
- Calculate and display metrics

### Step 3: Create Holdings Table
- HoldingsTable component
- Search functionality
- Filter buttons
- Sort functionality
- Action buttons (edit, delete, info)

### Step 4: Create Chart Components
- Use Chart.js or Recharts
- Sector allocation chart
- Asset class chart
- Performance chart
- Dividend chart

### Step 5: Create Modals
- AddPositionModal with form
- ExportModal for portfolio summary
- InsightsModal for educational content
- DetailChartModal for 30-day price history

### Step 6: Create Custom Hooks
- usePortfolioData - Fetch and manage portfolio data
- usePriceUpdates - Handle real-time price updates
- useCharts - Manage chart instances

### Step 7: API Integration
- Connect to /api/portfolio/all endpoint
- Connect to /api/holdings endpoint
- Connect to /api/transactions endpoint
- Connect to /api/dividends endpoint
- Handle real-time updates

### Step 8: Testing
- Test all features locally
- Test API integration
- Test responsive design
- Test performance

## API Endpoints Required

```
GET /api/portfolio/all
  - Returns: { holdings, transactions, dividends, metrics }

GET /api/holdings
  - Returns: Array of holdings with current prices

POST /api/holdings
  - Create new holding
  - Body: { ticker, shares, purchase_price, purchase_date, sector, asset_class }

PUT /api/holdings/:id
  - Update holding

DELETE /api/holdings/:id
  - Delete holding

GET /api/transactions
  - Returns: Array of transactions

GET /api/dividends
  - Returns: Array of dividends

GET /api/prices/:ticker
  - Returns: Current price and 30-day history
```

## Data Structure

### Holding
```typescript
{
  id: string;
  ticker: string;
  name: string;
  shares: number;
  purchase_price: number;
  purchase_date: string;
  current_price: number;
  sector: string;
  asset_class: string;
  recommendation?: string;
  analyst_rating?: string;
}
```

### Portfolio Metrics
```typescript
{
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  dividendIncome: number;
  todayChange: number;
  todayChangePercent: number;
  portfolioBeta: number;
  avgDividendYield: number;
  bestPerformer: string;
  worstPerformer: string;
  totalCostBasis: number;
}
```

## Timeline

- **Step 1-2**: 2 hours (Dashboard container + metrics)
- **Step 3**: 3 hours (Holdings table with search/filter/sort)
- **Step 4**: 3 hours (Chart components)
- **Step 5**: 2 hours (Modals)
- **Step 6**: 2 hours (Custom hooks)
- **Step 7**: 2 hours (API integration)
- **Step 8**: 2 hours (Testing)

**Total Estimated Time**: 16 hours

## Dependencies

- React 19
- React Router v6
- React Query v5
- Chart.js or Recharts
- Axios
- Tailwind CSS
- Lucide React (icons)

## Success Criteria

✅ All metrics display correctly
✅ Holdings table fully functional (search, filter, sort)
✅ Charts render correctly
✅ Add position modal works
✅ Export functionality works
✅ Real-time price updates work
✅ Responsive design on all devices
✅ No console errors
✅ API integration complete
✅ Performance acceptable (<3s load time)

## Next Phase

After dashboard is complete:
- Phase 3: Trade Room migration
- Phase 4: Admin panel migration
- Phase 5: Testing and deployment

