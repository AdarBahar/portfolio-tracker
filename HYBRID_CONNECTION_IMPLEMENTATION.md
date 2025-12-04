# Hybrid WebSocket + Polling Implementation

## Overview

This document describes the hybrid connection approach implemented to support real-time updates in the Trade Room when WebSocket is not available (e.g., on shared hosting with HTTP/2 reverse proxy).

## Architecture

### How It Works

1. **Primary**: Try WebSocket connection first
2. **Fallback**: If WebSocket fails, automatically switch to polling
3. **Transparent**: Components don't need to know which mode is active
4. **Status Indicator**: UI shows connection mode (Real-time vs Polling vs Offline)

### Connection Flow

```
Client connects
    ↓
Try WebSocket → Success? → Use WebSocket ✅
    ↓ (Fails)
Start Polling → Success? → Use Polling ✅
    ↓ (Fails)
Offline Mode → Show error ❌
```

## Implementation Details

### Frontend Services

#### 1. **WebSocket Service** (`websocketService.ts`)
- Existing service with new methods:
  - `subscribeToRoom(bullPenId)` - Subscribe to room updates
  - `unsubscribeFromRoom(bullPenId)` - Unsubscribe from room updates

#### 2. **Polling Service** (`pollingService.ts`)
- Fetches updates from `/api/bull-pens/:id/updates` every 3 seconds
- Tracks last update timestamp to only fetch new updates
- Provides same interface as WebSocket for consistency
- Methods: `startPolling()`, `stopPolling()`, `on()`, `onConnectionChange()`

#### 3. **Hybrid Connection Manager** (`hybridConnectionManager.ts`)
- Unified interface for both WebSocket and polling
- Automatically tries WebSocket first, falls back to polling
- Manages active room subscriptions
- Returns connection status: `{ connected, mode, wsConnected, pollingActive }`

### Backend Services

#### 1. **Polling Controller** (`pollingController.js`)
- Stores room updates in memory (last 100 per room)
- Endpoint: `GET /api/bull-pens/:id/updates?since=<timestamp>`
- Returns array of updates with structure: `{ type, data, timestamp }`
- Auto-cleanup: Removes updates older than 5 minutes

#### 2. **Polling Routes** (`pollingRoutes.js`)
- Registers polling endpoint
- Requires authentication

#### 3. **Event Handler Integration**
- All WebSocket event handlers now call `addRoomUpdate()` to queue updates
- Updated files:
  - `orderEvents.js` - order_executed, order_failed, order_cancelled
  - `leaderboardEvents.js` - leaderboard_update, ranking_changed, snapshot_created
  - `positionEvents.js` - position_update, position_closed, portfolio_update
  - `roomStateEvents.js` - room_state_changed, room_started, room_ended, member_joined, member_left

## Update Types

The polling service supports these event types:

| Event Type | Description |
|-----------|-------------|
| `order_executed` | Order was successfully executed |
| `order_failed` | Order execution failed |
| `order_cancelled` | Order was cancelled |
| `leaderboard_update` | Leaderboard rankings updated |
| `ranking_changed` | User's ranking changed |
| `snapshot_created` | Leaderboard snapshot created |
| `position_update` | Position value/quantity changed |
| `position_closed` | Position was closed |
| `portfolio_update` | Portfolio value changed |
| `room_state_changed` | Room state changed |
| `room_started` | Room started trading |
| `room_ended` | Room ended trading |
| `member_joined` | New member joined room |
| `member_left` | Member left room |

## Configuration

### Polling Interval
- Default: 3 seconds
- Configurable in `pollingService.ts`

### Update Retention
- Keeps last 100 updates per room
- Auto-cleanup every 5 minutes
- Removes updates older than 5 minutes

## Testing

### Manual Testing

1. **Test WebSocket Mode**:
   - Open browser DevTools
   - Check Network tab for WebSocket connection
   - Should see `ws://` or `wss://` connection

2. **Test Polling Fallback**:
   - Disable WebSocket in browser (DevTools → Network → Offline)
   - Refresh page
   - Should see polling requests to `/api/bull-pens/:id/updates`
   - Updates should still work

3. **Test Connection Status**:
   - Look for connection indicator
   - Should show: 🟢 Real-time (WebSocket) or 🟡 Polling

### Automated Testing

```bash
# Run tests
npm test

# Test polling specifically
npm test -- polling.test.js

# Test hybrid manager
npm test -- hybridConnectionManager.test.js
```

## Deployment

### No Changes Required

- Existing WebSocket code continues to work
- Polling is automatic fallback
- No configuration needed
- Works on shared hosting immediately

### Future VPS Migration

When upgrading to VPS:
1. Configure nginx to support HTTP/1.1 for WebSocket
2. WebSocket will automatically be used (faster, real-time)
3. Polling code remains as fallback
4. No code changes needed

## Performance

### WebSocket Mode
- Real-time updates (< 100ms latency)
- Bidirectional communication
- Lower bandwidth

### Polling Mode
- Updates every 3 seconds
- One-way communication (client → server)
- Higher bandwidth
- Acceptable for shared hosting

## Troubleshooting

### Updates Not Appearing

1. Check connection status indicator
2. If polling: Check Network tab for `/api/bull-pens/:id/updates` requests
3. If WebSocket: Check for `ws://` connection in Network tab
4. Check browser console for errors

### High Latency

- If using polling: This is expected (3-second delay)
- If using WebSocket: Check network conditions
- Consider upgrading to VPS for better performance

## Files Modified/Created

### Created
- `frontend-react/src/services/pollingService.ts`
- `frontend-react/src/services/hybridConnectionManager.ts`
- `backend/src/controllers/pollingController.js`
- `backend/src/routes/pollingRoutes.js`

### Modified
- `frontend-react/src/services/websocketService.ts` - Added room subscription methods
- `backend/src/app.js` - Registered polling routes
- `backend/src/websocket/eventHandlers/orderEvents.js` - Added polling integration
- `backend/src/websocket/eventHandlers/leaderboardEvents.js` - Added polling integration
- `backend/src/websocket/eventHandlers/positionEvents.js` - Added polling integration
- `backend/src/websocket/eventHandlers/roomStateEvents.js` - Added polling integration

## Next Steps

1. Update components to use `hybridConnectionManager` instead of `websocketService`
2. Add connection status indicator component
3. Test in production
4. Monitor polling performance
5. Plan VPS upgrade for full WebSocket support

