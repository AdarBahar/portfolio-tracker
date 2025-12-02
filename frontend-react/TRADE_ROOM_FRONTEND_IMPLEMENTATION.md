# Trade Room Frontend Implementation - Phase 2

## Overview

This document describes the Trade Room frontend implementation for the Portfolio Tracker application. The frontend provides a complete user interface for competitive stock trading simulations with real-time updates, position tracking, and leaderboard management.

## Architecture

### Services

#### WebSocket Service (`src/services/websocketService.ts`)
- Real-time connection management
- Event subscription system
- Automatic reconnection with exponential backoff
- Connection status tracking

**Key Methods:**
- `connect(token)` - Establish WebSocket connection
- `disconnect()` - Close connection
- `send(type, data)` - Send message to server
- `on(type, callback)` - Subscribe to events
- `onConnectionChange(callback)` - Monitor connection status

### Hooks

#### `useLeaderboardSnapshot`
- Fetch latest leaderboard snapshot
- Fetch snapshot history
- Create new snapshots (admin only)
- Calculate payout distributions

#### `usePositionTracking`
- Fetch user positions
- Calculate portfolio value
- Calculate total P&L
- Get position statistics
- Format positions for display

### Components

#### LeaderboardView
- Display ranked players with P&L
- Real-time updates via WebSocket
- Create snapshots (host only)
- Auto-refresh toggle

#### PortfolioView
- Portfolio summary (cash, positions value, total value, P&L)
- Position table with market values
- Real-time position updates
- Auto-refresh toggle

#### PositionTracker
- List of open positions
- Position statistics (winners, losers, breakeven)
- Sort by symbol, P&L, or value
- Close position functionality

#### TradingPanel
- Place buy/sell orders
- Market and limit order types
- Input validation
- Available cash display
- Order execution feedback

#### OrderHistory
- Display order history
- Filter by side (buy/sell) and status
- Expandable order details
- Execution details and P&L

#### SnapshotHistory
- Timeline of leaderboard snapshots
- Snapshot details view
- Trend indicators

#### NotificationCenter
- Real-time notifications
- Toast notifications
- Notification bell with unread count
- Event types: order_executed, order_failed, room_state_changed, leaderboard_updated, position_closed

### Pages

#### BullPenDetail
- Main Trade Room page
- Tab navigation (Trading, Portfolio, Positions, Orders, Leaderboard, History)
- WebSocket connection management
- Notification center integration
- Connection status indicator

## Real-time Features

### WebSocket Events

**Incoming Events:**
- `leaderboard_update` - Leaderboard changed
- `position_update` - Position changed
- `order_executed` - Order executed
- `order_failed` - Order failed
- `room_state_changed` - Room state changed
- `position_closed` - Position closed

**Outgoing Events:**
- `auth` - Authenticate connection
- `subscribe_room` - Subscribe to room updates
- `unsubscribe_room` - Unsubscribe from room

## Data Flow

1. **User opens Trade Room** → BullPenDetail page loads
2. **WebSocket connects** → Authenticated with JWT token
3. **Components fetch data** → React Query caches results
4. **Real-time updates** → WebSocket events trigger refetches
5. **User actions** → Orders placed, positions managed
6. **Notifications** → Toast and bell notifications

## Validation

### Order Validation
- Symbol required and valid
- Quantity > 0
- Limit price > 0 (for limit orders)
- Sufficient cash for buy orders
- Position exists for sell orders

### Form Validation
- Real-time error display
- Field-level validation
- Success/error messages

## Styling

- Tailwind CSS for styling
- Dark/light theme support
- Responsive design (mobile, tablet, desktop)
- Color coding: green (success), red (destructive), blue (primary)

## Testing

### Test Coverage
- Component rendering
- Hook functionality
- WebSocket integration
- Form validation
- Real-time updates

### Running Tests
```bash
npm test -- tradeRoom.test.tsx
```

## Performance Optimizations

1. **React Query Caching**
   - 5-30 second stale time
   - 10-60 second refetch intervals
   - Automatic cache invalidation

2. **WebSocket Optimization**
   - Event batching
   - Selective subscriptions
   - Connection pooling

3. **Component Optimization**
   - Memoization of expensive components
   - Lazy loading of tabs
   - Virtual scrolling for large lists

## Error Handling

- Network error recovery
- WebSocket reconnection
- Graceful degradation
- User-friendly error messages
- Automatic retry logic

## Future Enhancements

1. **Advanced Features**
   - AI recommendations integration
   - Advanced charting
   - Portfolio analytics
   - Performance metrics

2. **Performance**
   - Server-side pagination
   - Infinite scroll
   - Data compression
   - CDN integration

3. **UX Improvements**
   - Keyboard shortcuts
   - Drag-and-drop
   - Customizable layouts
   - Dark mode toggle

## Deployment

### Environment Variables
```
VITE_API_URL=http://localhost:4000/api
```

### Build
```bash
npm run build
```

### Development
```bash
npm run dev
```

## Troubleshooting

### WebSocket Connection Issues
- Check token validity
- Verify server is running
- Check browser console for errors
- Verify CORS settings

### Real-time Updates Not Working
- Check WebSocket connection status
- Verify event subscriptions
- Check server logs
- Verify event payload format

### Performance Issues
- Check React Query cache settings
- Monitor network requests
- Profile component rendering
- Check for memory leaks

## Support

For issues or questions, contact the development team or check the project documentation.

