# Trade Room Requirements Checklist

## FRONTEND COMPONENTS

### Core Components
- [ ] **TradeRoomView** - Main container component
  - [ ] Back button with navigation
  - [ ] Page header (title + type)
  - [ ] Conditional rendering logic
  
- [ ] **TradeRoomSummary** - 6 stat cards
  - [ ] Position ranking (#3)
  - [ ] Portfolio value ($24.7k)
  - [ ] Daily change (+5.2%)
  - [ ] Player count (45/50)
  - [ ] Reward stars (5000)
  - [ ] Time remaining (5d 14h)

- [ ] **Portfolio** - Holdings management
  - [ ] Holdings table/cards
  - [ ] Summary stats (Invested, Cash, Day P&L)
  - [ ] Buy Assets button
  - [ ] Sell Assets button
  - [ ] Stock info icons

- [ ] **AIRecommendations** - Trading suggestions
  - [ ] Buy/Sell/Hold cards
  - [ ] Confidence scores
  - [ ] Target prices
  - [ ] Market insights (3 stats)
  - [ ] Execute buttons

- [ ] **Leaderboard** - Rankings display
  - [ ] Top 6 players
  - [ ] Medal icons (top 3)
  - [ ] Current user highlight
  - [ ] Sticky positioning (desktop)
  - [ ] View Full button

### Modal Components
- [ ] **BuyAssetsModal**
  - [ ] Asset search with autocomplete
  - [ ] Quantity input
  - [ ] Price display
  - [ ] Fee calculation
  - [ ] Buy confirmation

- [ ] **StockInfoModal**
  - [ ] Current price movement
  - [ ] Sector information
  - [ ] Key price drivers
  - [ ] Recent market factors
  - [ ] Investment tips

## BACKEND INFRASTRUCTURE

### Database Tables
- [ ] bull_pens (Trade rooms)
- [ ] bull_pen_memberships (Players)
- [ ] positions (Holdings)
- [ ] orders (Trades)
- [ ] leaderboard_snapshots (Rankings)
- [ ] market_data (Prices)

### Edge Functions
- [ ] execute-order
- [ ] get-stock-recommendations
- [ ] fetch-stock-prices
- [ ] fetch-historical-prices

### Scheduled Jobs
- [ ] Room State Manager
- [ ] Leaderboard Updater
- [ ] Market Data Refresher

### RLS Policies
- [ ] bull_pens access control
- [ ] bull_pen_memberships access control
- [ ] positions access control
- [ ] orders access control
- [ ] leaderboard_snapshots access control
- [ ] market_data access control

## RESPONSIVE DESIGN

### Desktop (1024px+)
- [ ] 2-column layout (2/3 left, 1/3 right)
- [ ] 6 summary stats in one row
- [ ] Sticky leaderboard
- [ ] Table view for portfolio

### Tablet (768-1023px)
- [ ] Single column stack
- [ ] 3 summary stats per row
- [ ] Card view for portfolio
- [ ] No sticky positioning

### Mobile (<768px)
- [ ] Single column stack
- [ ] 2 summary stats per row
- [ ] Card view for portfolio
- [ ] Touch-friendly controls

## ACCESSIBILITY

- [ ] Keyboard navigation
- [ ] Focus states on all interactive elements
- [ ] WCAG AA color contrast
- [ ] Semantic HTML structure
- [ ] Screen reader labels
- [ ] Touch targets ≥ 44×44px

## PERFORMANCE

- [ ] Lazy loading of modals
- [ ] Conditional rendering
- [ ] Minimal re-renders
- [ ] Image optimization
- [ ] Caching strategy

## TESTING

- [ ] Unit tests for components
- [ ] Integration tests for order flow
- [ ] E2E tests for user journeys
- [ ] Mobile responsiveness tests
- [ ] Accessibility tests

## DOCUMENTATION

- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] User guide


