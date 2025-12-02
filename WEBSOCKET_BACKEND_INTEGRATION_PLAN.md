# WebSocket Backend Integration - Phase 3 Plan

## Overview

Implement WebSocket server for Trade Room real-time updates. The frontend already has WebSocket client support; this phase implements the backend server.

## Architecture

### Technology Stack
- **Library**: `ws` (lightweight, production-ready)
- **Port**: 4001 (separate from REST API on 4000)
- **Authentication**: JWT token validation
- **Message Format**: JSON with `{ type, data }` structure

### Key Components

1. **WebSocket Server** (`src/websocket/server.js`)
   - Connection management
   - Authentication
   - Message routing

2. **Room Manager** (`src/websocket/roomManager.js`)
   - Room subscriptions
   - User tracking
   - Broadcast management

3. **Event Handlers** (`src/websocket/eventHandlers/`)
   - Order events
   - Leaderboard events
   - Position events
   - Room state events

4. **Integration Layer** (`src/websocket/integration.js`)
   - Connect to Trade Room services
   - Trigger broadcasts on data changes

## Implementation Steps

### Phase 3.1: Setup & Infrastructure
1. Install `ws` package
2. Create WebSocket server
3. Implement authentication
4. Create room subscription system

### Phase 3.2: Event Broadcasting
1. Implement order event broadcasting
2. Implement leaderboard event broadcasting
3. Implement position event broadcasting
4. Implement room state event broadcasting

### Phase 3.3: Integration & Testing
1. Integrate with Trade Room services
2. Create integration tests
3. Test end-to-end flow
4. Document implementation

## Event Types

**Incoming (Client → Server):**
- `auth` - Authenticate connection
- `subscribe_room` - Subscribe to room updates
- `unsubscribe_room` - Unsubscribe from room

**Outgoing (Server → Client):**
- `leaderboard_update` - Leaderboard changed
- `position_update` - Position changed
- `order_executed` - Order executed
- `order_failed` - Order failed
- `room_state_changed` - Room state changed
- `position_closed` - Position closed

## Success Criteria

✅ WebSocket server running on port 4001
✅ Authentication working with JWT tokens
✅ Room subscriptions working
✅ Real-time events broadcasting to clients
✅ Integration tests passing
✅ Frontend receiving real-time updates
✅ No memory leaks or connection issues
✅ Proper error handling and logging

## Timeline

- Phase 3.1: 2-3 hours
- Phase 3.2: 2-3 hours
- Phase 3.3: 1-2 hours
- **Total**: ~5-8 hours

## Next Steps

1. Start with Phase 3.1 setup
2. Implement WebSocket server
3. Add authentication
4. Create room manager
5. Implement event handlers
6. Add integration tests
7. Test with frontend
8. Document and deploy

