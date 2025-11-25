# Trade Room UI Test Checklist

## Prerequisites
- [ ] Backend server is running
- [ ] Database is set up with schema
- [ ] At least one BullPen exists in the database (or ability to create one)

## Landing Page (index.html)
- [ ] "Join the game" banner is visible
- [ ] Banner has gradient background and proper styling
- [ ] Clicking "Enter Trade Room" navigates to trade-room.html
- [ ] Banner is responsive on mobile devices

## Authentication
- [ ] Redirects to login if not authenticated
- [ ] User name displays in header after login
- [ ] Logout button works correctly
- [ ] Theme toggle works (light/dark mode)

## Dashboard View
- [ ] Dashboard loads and displays user's BullPens
- [ ] BullPen cards show correct information:
  - [ ] Name and description
  - [ ] Status badge with correct color
  - [ ] Start time formatted correctly
  - [ ] Starting cash and max players
- [ ] Filter buttons work (All, Active, Scheduled, Completed)
- [ ] Empty state shows when no BullPens match filter
- [ ] Clicking a BullPen card navigates to detail view
- [ ] Create BullPen button shows placeholder message
- [ ] Join BullPen button shows placeholder message
- [ ] "Back to Portfolio" button returns to index.html

## BullPen Detail View - Header
- [ ] BullPen name displays correctly
- [ ] Status badge shows with correct color
- [ ] Time remaining updates for active tournaments
- [ ] Participant count displays
- [ ] Invite code shows for host users
- [ ] Copy invite code button works
- [ ] "Back to Dashboard" button returns to dashboard

## Portfolio Summary Cards
- [ ] Cash balance displays correctly
- [ ] Portfolio value displays correctly
- [ ] Total return shows in dollars
- [ ] Total return percentage shows with color coding (green/red)
- [ ] Current rank displays
- [ ] Summary updates after placing trades
- [ ] Summary auto-refreshes every 30 seconds

## Trading Panel
- [ ] Instrument tabs work (Stock, Option, ETF)
- [ ] Symbol input accepts text
- [ ] Symbol lookup fetches current price
- [ ] Current price displays after lookup
- [ ] Quantity input accepts numbers
- [ ] Order type dropdown works (Market, Limit)
- [ ] Limit price field shows/hides based on order type
- [ ] Option fields show/hide based on instrument type
- [ ] Estimated total calculates correctly
- [ ] Buy button is styled green
- [ ] Sell button is styled red
- [ ] Validation shows errors for:
  - [ ] Empty symbol
  - [ ] Invalid quantity
  - [ ] Missing limit price (when limit order)
- [ ] Successful trade shows success toast
- [ ] Failed trade shows error toast
- [ ] Form resets after successful trade
- [ ] Trade execution triggers portfolio/leaderboard refresh

## Portfolio Component
- [ ] Positions list displays correctly
- [ ] Position cards show:
  - [ ] Symbol
  - [ ] Quantity
  - [ ] Average cost
  - [ ] Current price
  - [ ] Cost basis
  - [ ] Market value
  - [ ] P&L in dollars
  - [ ] P&L in percentage
- [ ] P&L color coding works (green for profit, red for loss)
- [ ] Option positions show additional details
- [ ] Empty state shows when no positions
- [ ] Positions update after placing trades

## Leaderboard Component
- [ ] Leaderboard table displays correctly
- [ ] Columns show:
  - [ ] Rank with medal badges (gold, silver, bronze)
  - [ ] Player name
  - [ ] Portfolio value
  - [ ] Return percentage
  - [ ] P&L amount
  - [ ] Last trade timestamp
- [ ] Current user row is highlighted
- [ ] Return values are color-coded (green/red)
- [ ] Leaderboard updates after trades
- [ ] Leaderboard auto-refreshes every 30 seconds
- [ ] Empty state shows when no participants

## Responsive Design
- [ ] Desktop (1024px+): Full layout with side-by-side panels
- [ ] Tablet (768px-1023px): Stacked panels
- [ ] Mobile (< 768px): Single column layout
- [ ] All buttons are touch-friendly on mobile
- [ ] Text is readable on all screen sizes
- [ ] No horizontal scrolling on any device

## Error Handling
- [ ] Network errors show error toast
- [ ] API errors show error toast with message
- [ ] Invalid form inputs show validation messages
- [ ] Failed trades show error toast
- [ ] Loading states show while fetching data

## Performance
- [ ] Page loads quickly
- [ ] No console errors
- [ ] No console warnings
- [ ] API calls are efficient (no unnecessary requests)
- [ ] Auto-refresh doesn't cause performance issues
- [ ] Smooth animations and transitions

## Accessibility
- [ ] Skip link works
- [ ] All buttons have proper labels
- [ ] Form inputs have labels
- [ ] Toast notifications have proper ARIA roles
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Screen reader friendly

## Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Known Limitations (Future Work)
- Create BullPen modal not implemented (placeholder)
- Join BullPen modal not implemented (placeholder)
- Approve/reject membership not implemented
- Leave BullPen not implemented
- Real-time WebSocket updates not implemented
- Advanced charting not implemented
- Order history view not implemented

