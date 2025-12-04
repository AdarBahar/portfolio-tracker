# Trade Room - Quick Reference Guide

## 📋 WHAT IS TRADE ROOM?

A **competitive stock trading game** where users trade virtual stocks, compete on leaderboards, and earn rewards.

---

## 🎯 KEY STATISTICS

| Metric | Value |
|--------|-------|
| Total Requirements | 37 items |
| Frontend Items | 18 |
| Backend Items | 19 |
| Suggested Improvements | 15 |
| **Total Scope** | **52 items** |
| Estimated Timeline | 4-6 weeks |
| Team Size | 4 people |

---

## 📊 REQUIREMENTS BREAKDOWN

### Frontend: 18 Items
- **15 New**: 8 components + 7 features
- **3 Changes**: Dashboard, App.tsx, TopBar

### Backend: 19 Items
- **6 Tables**: bull_pens, memberships, positions, orders, snapshots, market_data
- **4 Functions**: execute-order, recommendations, fetch-prices, historical
- **3 Jobs**: State manager, leaderboard, market data
- **6 Policies**: RLS access control

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
✅ Database schema  
✅ RLS policies  
✅ Basic components  

### Phase 2: Core Trading (Week 2)
✅ Order execution  
✅ Portfolio management  
✅ Buy/Sell modals  

### Phase 3: Competition (Week 3)
✅ Leaderboard  
✅ AI recommendations  
✅ Real-time updates  

### Phase 4: Polish (Week 4)
✅ Error handling  
✅ Mobile optimization  
✅ Testing  

---

## 🎨 MAIN COMPONENTS

| Component | Purpose | Complexity |
|-----------|---------|-----------|
| TradeRoomView | Main container | High |
| TradeRoomSummary | 6 stat cards | Medium |
| Portfolio | Holdings display | High |
| AIRecommendations | Trading suggestions | High |
| Leaderboard | Rankings | Medium |
| BuyAssetsModal | Purchase stocks | High |
| StockInfoModal | Education | Medium |

---

## 🗄️ DATABASE TABLES

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| bull_pens | Trade rooms | id, name, state, start_time |
| bull_pen_memberships | Players | bull_pen_id, user_id, status, cash |
| positions | Holdings | bull_pen_id, user_id, symbol, qty |
| orders | Trades | bull_pen_id, user_id, symbol, side |
| leaderboard_snapshots | Rankings | bull_pen_id, rank, portfolio_value |
| market_data | Prices | symbol, current_price, last_updated |

---

## ⚙️ EDGE FUNCTIONS

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| execute-order | Process trades | symbol, qty, side | order_id, status |
| get-stock-recommendations | AI suggestions | bull_pen_id | recommendations[] |
| fetch-stock-prices | Update prices | symbols[] | prices{} |
| fetch-historical-prices | Historical data | symbol, days | prices[] |

---

## 🔴 TOP 5 IMPROVEMENTS

1. **Real-time WebSocket** - Live price/leaderboard updates
2. **Error Handling** - Comprehensive error management
3. **Order Confirmation** - User confirmation before trades
4. **Rate Limiting** - Prevent abuse
5. **Audit Logging** - Compliance & debugging

---

## 📱 RESPONSIVE DESIGN

| Device | Layout | Summary | Portfolio |
|--------|--------|---------|-----------|
| Desktop (1024+) | 2-column | 6 cols | Table |
| Tablet (768-1023) | 1-column | 3 cols | Cards |
| Mobile (<768) | 1-column | 2 cols | Cards |

---

## 🎯 FEATURE CHECKLIST

### Core Features
- [ ] Trade Room View
- [ ] Portfolio Management
- [ ] Buy/Sell Orders
- [ ] Leaderboard
- [ ] AI Recommendations
- [ ] Real-time Updates

### UI Components
- [ ] Summary Stats
- [ ] Holdings Table
- [ ] Modals (Buy, Info)
- [ ] Responsive Layout
- [ ] Navigation

### Backend
- [ ] Database Schema
- [ ] Order Execution
- [ ] Leaderboard Calc
- [ ] Price Updates
- [ ] RLS Policies

---

## 📚 DOCUMENTATION FILES

| File | Purpose | Lines |
|------|---------|-------|
| TRADE_ROOM_SUMMARY.md | Overview | 512 |
| trade-room_UI_requirements.md | UI flows | 685 |
| trade-room-view-style-guide.md | UI specs | 682 |
| trade-room-view-architecture.md | Architecture | 758 |
| trade-room-view-flow-diagram.md | Diagrams | 607 |
| trade-room_backend_requirements.md | Backend | 377 |

**Total**: 3,621 lines of documentation

---

## 🎓 KEY CONCEPTS

**Trade Room**: Competitive trading environment  
**Bull Pen**: Alternative name for Trade Room  
**Position**: Stock holding in a room  
**Order**: Buy/sell transaction  
**Leaderboard**: Player rankings by portfolio value  
**P&L**: Profit and Loss calculation  
**Snapshot**: Periodic ranking capture  

---

## 💡 QUICK TIPS

1. Start with database schema
2. Implement order execution first
3. Build UI components in parallel
4. Add real-time updates last
5. Test thoroughly before launch

---

## 📞 CONTACT

For questions or clarifications, refer to:
- TRADE_ROOM_EXECUTIVE_SUMMARY.md
- TRADE_ROOM_IMPROVEMENTS.md
- TRADE_ROOM_REQUIREMENTS_CHECKLIST.md


