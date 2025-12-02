# WebSocket Backend Implementation - Phase 3

## Overview

WebSocket server for Trade Room real-time updates. Provides real-time leaderboard, position, order, and room state updates to connected clients.

## Architecture

### Components

1. **WebSocket Server** (`src/websocket/server.js`)
   - Connection management
   - JWT authentication
   - Message routing
   - Broadcasting

2. **Room Manager** (`src/websocket/roomManager.js`)
   - Room subscriptions
   - User tracking
   - Subscriber management

3. **Event Handlers** (`src/websocket/eventHandlers/`)
   - Order events
   - Leaderboard events
   - Position events
   - Room state events

4. **Integration Layer** (`src/websocket/integration.js`)
   - Connects to Trade Room services
   - Triggers broadcasts on data changes

## Configuration

### Environment Variables

```env
# WebSocket server port (default: 4001)
WS_PORT=4001

# JWT secret for authentication
JWT_SECRET=your-secret-here
```

### Ports

- **REST API**: 4000 (Express)
- **WebSocket**: 4001 (ws)

## Message Format

All messages use JSON format:

```json
{
  "type": "message_type",
  "data": { /* message data */ }
}
```

## Client → Server Events

### Authentication

```json
{
  "type": "auth",
  "data": { "token": "jwt-token" }
}
```

### Room Subscription

```json
{
  "type": "subscribe_room",
  "data": { "bullPenId": "room-id" }
}
```

### Room Unsubscription

```json
{
  "type": "unsubscribe_room",
  "data": { "bullPenId": "room-id" }
}
```

## Server → Client Events

### Authentication Success

```json
{
  "type": "auth_success",
  "data": { "userId": "user-id" }
}
```

### Order Events

- `order_executed` - Order executed
- `order_failed` - Order failed
- `order_cancelled` - Order cancelled

### Leaderboard Events

- `leaderboard_update` - Leaderboard changed
- `ranking_changed` - User ranking changed
- `snapshot_created` - Snapshot created

### Position Events

- `position_update` - Position changed
- `position_closed` - Position closed
- `portfolio_update` - Portfolio changed

### Room State Events

- `room_state_changed` - Room state changed
- `room_started` - Room started
- `room_ended` - Room ended
- `member_joined` - Member joined
- `member_left` - Member left

## Integration with Trade Room Services

The WebSocket integration layer connects to Trade Room services:

```javascript
const wsIntegration = require('./websocket/integration');

// Broadcast order execution
wsIntegration.onOrderExecuted(bullPenId, order);

// Broadcast leaderboard update
wsIntegration.onLeaderboardUpdated(bullPenId, snapshot);

// Broadcast position update
wsIntegration.onPositionUpdated(bullPenId, position);
```

## Testing

Run WebSocket integration tests:

```bash
npm test -- websocket.integration.test.js
```

## Deployment

### Prerequisites

- Node.js 14+
- Port 4001 available (or configure WS_PORT)
- JWT_SECRET configured

### Start Server

```bash
npm start
```

Both REST API (4000) and WebSocket (4001) servers will start.

### Verify

```bash
# Check REST API
curl http://localhost:4000/api/health

# Check WebSocket (requires WebSocket client)
# Frontend will connect automatically
```

## Performance Considerations

- **Connection Limit**: Depends on server resources
- **Message Rate**: Optimized for ~100 messages/second
- **Memory**: ~1MB per active connection
- **CPU**: Minimal overhead for message routing

## Troubleshooting

### WebSocket Connection Fails

1. Check port 4001 is available
2. Verify JWT_SECRET is set
3. Check firewall rules
4. Review server logs

### Messages Not Received

1. Verify authentication succeeded
2. Check room subscription
3. Verify message format
4. Check browser console for errors

### High Memory Usage

1. Check for connection leaks
2. Monitor subscriber count
3. Review room cleanup logic
4. Check for message queue buildup

## Next Steps

1. Integrate with Trade Room order controller
2. Integrate with leaderboard snapshot service
3. Integrate with position tracking service
4. Add heartbeat/ping-pong for connection health
5. Add connection pooling for scalability

