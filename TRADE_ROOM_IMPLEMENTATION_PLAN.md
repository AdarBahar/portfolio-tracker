# Trade Room Implementation Plan & Requirements Analysis

**Date**: December 2, 2025
**Status**: Planning Phase
**Reviewed Documents**: 6 comprehensive specification files
**Project Context**: Portfolio Tracker (React + Node.js + MySQL)

---

## Executive Summary

The Trade Room feature is a **competitive stock trading game** where users manage virtual portfolios, receive AI recommendations, and compete on leaderboards. This document provides a comprehensive implementation plan with all requirements classified as **New** or **Change to Existing**, plus improvement recommendations.

### Current Project Status
- ✅ React frontend deployed to production (www.bahar.co.il/fantasybroker/react/)
- ✅ Node.js backend running with API endpoints
- ✅ MySQL/MariaDB database with schema
- ✅ Google OAuth authentication working
- ✅ Admin panel implemented
- ✅ Dashboard with charts and visualizations
- ✅ Theme toggle (light/dark mode)
- ✅ User profile display with admin features

---

## 📋 FRONTEND REQUIREMENTS

### NEW FEATURES (15 items)

| # | Feature | Component | Priority | Complexity |
|---|---------|-----------|----------|-----------|
| 1 | Trade Room View | TradeRoomView.tsx | P0 | High |
| 2 | Summary Stats (6 cards) | TradeRoomSummary.tsx | P0 | Medium |
| 3 | Portfolio Holdings | Portfolio.tsx | P0 | High |
| 4 | Buy/Sell Buttons | Portfolio.tsx | P0 | Medium |
| 5 | AI Recommendations | AIRecommendations.tsx | P0 | High |
| 6 | Leaderboard (sticky) | Leaderboard.tsx | P0 | Medium |
| 7 | Buy Assets Modal | BuyAssetsModal.tsx | P0 | High |
| 8 | Stock Info Modal | StockInfoModal.tsx | P1 | Medium |
| 9 | Back Navigation | TradeRoomView.tsx | P0 | Low |
| 10 | Responsive Layout | All | P0 | Medium |
| 11 | Real-time Updates | All | P1 | High |
| 12 | Daily P&L Display | TradeRoomSummary.tsx | P0 | Low |
| 13 | Time Countdown | TradeRoomSummary.tsx | P0 | Low |
| 14 | Player Count | TradeRoomSummary.tsx | P0 | Low |
| 15 | Reward Stars | TradeRoomSummary.tsx | P0 | Low |

### CHANGES TO EXISTING (3 items)

| # | Component | Change | Impact |
|---|-----------|--------|--------|
| 1 | Dashboard | Add "View Trade Room" button to GameCard | Medium |
| 2 | App.tsx | Add selectedTradeRoom state management | Medium |
| 3 | TopBar | Persist across Trade Room view | Low |

---

## 🗄️ BACKEND REQUIREMENTS

### NEW DATABASE TABLES (6 items)

| Table | Purpose | Key Fields | Status |
|-------|---------|-----------|--------|
| bull_pens | Trade rooms | id, name, state, start_time, duration_sec | New |
| bull_pen_memberships | Player participation | bull_pen_id, user_id, status, cash | New |
| positions | Stock holdings | bull_pen_id, user_id, symbol, qty, avg_cost | New |
| orders | Trading activity | bull_pen_id, user_id, symbol, side, status | New |
| leaderboard_snapshots | Rankings | bull_pen_id, rank, portfolio_value, pnl | New |
| market_data | Price cache | symbol, current_price, last_updated | New |

### NEW EDGE FUNCTIONS (4 items)

| Function | Purpose | Complexity |
|----------|---------|-----------|
| execute-order | Process buy/sell orders | High |
| get-stock-recommendations | AI trading suggestions | High |
| fetch-stock-prices | Update market data | Medium |
| fetch-historical-prices | Historical data for charts | Medium |

### NEW SCHEDULED JOBS (3 items)

| Job | Frequency | Purpose |
|-----|-----------|---------|
| Room State Manager | Every 1 minute | Transition room states |
| Leaderboard Updater | Every 5 minutes | Calculate rankings |
| Market Data Refresher | Every 15 minutes | Update prices |

### NEW RLS POLICIES (6 sets)

- bull_pens: View/edit permissions
- bull_pen_memberships: Member access control
- positions: User/room member access
- orders: User/room member access
- leaderboard_snapshots: Room member access
- market_data: Public read access

---

## 🚀 IMPROVEMENT RECOMMENDATIONS

### High Priority

1. **Real-time WebSocket Updates** - Replace 5-min polling with live price/leaderboard updates
2. **Comprehensive Error Handling** - Add retry logic, user-friendly messages, network failure handling
3. **Order Confirmation UI** - Visual feedback before executing trades
4. **Rate Limiting** - Prevent order spam and API abuse
5. **Audit Logging** - Track all trades for compliance and debugging

### Medium Priority

6. **Leaderboard Pagination** - Show all players, not just top 6
7. **Trade History View** - Timeline of all trades
8. **Performance Charts** - Portfolio value over time
9. **Debounced Search** - Optimize Buy Assets modal search
10. **Mobile Touch Optimization** - Better mobile UX

### Nice-to-Have

11. **Undo/Cancel Orders** - Within time window
12. **Portfolio Export** - PDF/CSV reports
13. **Advanced Orders** - Stop-loss, limit orders
14. **Achievement Notifications** - Gamification
15. **Social Features** - Chat, sharing

---

## 📊 IMPLEMENTATION PHASES

### Phase 1: Core Trading (Weeks 1-2)
- Trade Room View layout
- Portfolio component
- Buy/Sell modals
- Order execution

### Phase 2: Competition (Weeks 3-4)
- Leaderboard
- AI Recommendations
- Real-time updates
- Ranking calculations

### Phase 3: Polish (Week 5)
- Mobile optimization
- Error handling
- Performance tuning
- Testing

---

## ✅ NEXT STEPS

1. Review this plan with team
2. Prioritize improvements
3. Create detailed task breakdown
4. Set up database schema
5. Begin Phase 1 implementation


