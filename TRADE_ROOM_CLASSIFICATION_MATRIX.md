# Trade Room - Requirements Classification Matrix

## FRONTEND REQUIREMENTS CLASSIFICATION

### NEW FEATURES (15 items)

#### UI Components (8)
| # | Component | Type | Complexity | Dependencies |
|---|-----------|------|-----------|--------------|
| 1 | TradeRoomView | Container | High | App state |
| 2 | TradeRoomSummary | Display | Medium | Trade room data |
| 3 | Portfolio | Display + Action | High | Holdings data, modals |
| 4 | AIRecommendations | Display + Action | High | AI API, market data |
| 5 | Leaderboard | Display | Medium | Leaderboard data |
| 6 | BuyAssetsModal | Form + Modal | High | Asset search, order API |
| 7 | StockInfoModal | Display + Modal | Medium | Asset data |
| 8 | TradeRoomSummary Stats | Display | Low | Calculations |

#### Features (7)
| # | Feature | Type | Complexity | Dependencies |
|---|---------|------|-----------|--------------|
| 9 | Back Navigation | Navigation | Low | App state |
| 10 | Responsive Layout | CSS/Layout | Medium | Tailwind CSS |
| 11 | Real-time Updates | Data Flow | High | WebSocket/API |
| 12 | Daily P&L Display | Calculation | Low | Portfolio data |
| 13 | Time Countdown | Calculation | Low | End date |
| 14 | Player Count | Display | Low | Room data |
| 15 | Reward Stars | Display | Low | Room data |

### CHANGES TO EXISTING (3 items)

| # | Component | Change | Impact | Complexity |
|---|-----------|--------|--------|-----------|
| 1 | Dashboard | Add "View Trade Room" button | Medium | Low |
| 2 | App.tsx | Add selectedTradeRoom state | Medium | Low |
| 3 | TopBar | Persist across views | Low | Low |

---

## BACKEND REQUIREMENTS CLASSIFICATION

### NEW DATABASE TABLES (6 items)

| # | Table | Purpose | Complexity | Dependencies |
|---|-------|---------|-----------|--------------|
| 1 | bull_pens | Trade rooms | Medium | None |
| 2 | bull_pen_memberships | Player participation | Medium | bull_pens, profiles |
| 3 | positions | Stock holdings | Medium | bull_pens, memberships |
| 4 | orders | Trading activity | High | bull_pens, positions |
| 5 | leaderboard_snapshots | Rankings | Medium | bull_pens, memberships |
| 6 | market_data | Price cache | Low | External API |

### NEW EDGE FUNCTIONS (4 items)

| # | Function | Purpose | Complexity | Dependencies |
|---|----------|---------|-----------|--------------|
| 1 | execute-order | Process trades | High | Finnhub API, DB |
| 2 | get-stock-recommendations | AI suggestions | High | Lovable AI, market data |
| 3 | fetch-stock-prices | Update prices | Medium | Finnhub API |
| 4 | fetch-historical-prices | Historical data | Medium | Finnhub API |

### NEW SCHEDULED JOBS (3 items)

| # | Job | Frequency | Complexity | Dependencies |
|---|-----|-----------|-----------|--------------|
| 1 | Room State Manager | Every 1 min | Low | bull_pens table |
| 2 | Leaderboard Updater | Every 5 min | Medium | positions, memberships |
| 3 | Market Data Refresher | Every 15 min | Medium | Finnhub API |

### NEW RLS POLICIES (6 sets)

| # | Table | Policy | Complexity |
|---|-------|--------|-----------|
| 1 | bull_pens | View/edit by host | Low |
| 2 | bull_pen_memberships | Member access | Medium |
| 3 | positions | User/member access | Medium |
| 4 | orders | User/member access | Medium |
| 5 | leaderboard_snapshots | Member access | Low |
| 6 | market_data | Public read | Low |

---

## REQUIREMENTS SUMMARY

### By Type
- **New Components**: 8
- **New Features**: 7
- **Changes to Existing**: 3
- **New Tables**: 6
- **New Functions**: 4
- **New Jobs**: 3
- **New Policies**: 6 sets

### By Complexity
- **Low**: 12 items (32%)
- **Medium**: 18 items (49%)
- **High**: 7 items (19%)

### By Priority
- **P0 (Critical)**: 18 items
- **P1 (Important)**: 12 items
- **P2 (Nice-to-have)**: 7 items

---

## IMPLEMENTATION DEPENDENCIES

### Phase 1: Foundation (Week 1)
- Database schema
- RLS policies
- Market data table
- Basic components

### Phase 2: Core Trading (Week 2)
- execute-order function
- Portfolio component
- Buy/Sell modals
- Order execution

### Phase 3: Competition (Week 3)
- Leaderboard
- Ranking calculations
- AI recommendations
- Real-time updates

### Phase 4: Polish (Week 4)
- Error handling
- Mobile optimization
- Testing
- Performance tuning

---

## RISK ASSESSMENT

### High Risk
- Real-time WebSocket implementation
- Order execution atomicity
- Market data synchronization

### Medium Risk
- AI recommendation accuracy
- Leaderboard calculation performance
- Mobile responsiveness

### Low Risk
- UI components
- Navigation
- Display calculations


