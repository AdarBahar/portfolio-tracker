# Trade Room API Implementation Guide

## Overview

The Trade Room (Bull Pen) API provides a comprehensive platform for competitive stock trading simulations. This document describes the implementation of Trade Room API route handlers and services.

## Architecture

### Services Layer

#### 1. **Trade Room Service** (`tradeRoomService.js`)
Core business logic for room management:
- **State Machine**: Manages room lifecycle (draft → scheduled → active → completed/cancelled)
- **State Transitions**: Validates and enforces valid state transitions
- **Room Status**: Calculates room status based on start time and duration
- **Member Management**: Checks if users can join rooms

**Key Functions:**
- `isValidStateTransition(currentState, newState)` - Validates state transitions
- `getRoomState(bullPenId)` - Gets current room state
- `calculateRoomStatus(startTime, durationSec)` - Calculates room status based on time
- `updateRoomStateIfNeeded(bullPenId)` - Auto-updates room state if time-based
- `canUserJoinRoom(bullPenId, userId)` - Checks join eligibility

#### 2. **Position Tracking Service** (`positionTrackingService.js`)
Manages user positions and P&L calculations:
- **Position Management**: Create, read, update positions
- **P&L Calculation**: Calculates unrealized P&L and percentages
- **Market Value**: Integrates with market data for current valuations

**Key Functions:**
- `getPosition(bullPenId, userId, symbol)` - Gets user position
- `getUserPositions(bullPenId, userId)` - Gets all user positions
- `calculatePositionPnL(position, currentPrice)` - Calculates P&L
- `updatePosition(bullPenId, userId, symbol, qty, fillPrice)` - Updates position after order

#### 3. **Leaderboard Snapshot Service** (`leaderboardSnapshotService.js`)
Creates and manages leaderboard snapshots:
- **Snapshot Creation**: Captures current rankings and P&L
- **Ranking Calculation**: Assigns ranks based on portfolio value
- **History Tracking**: Maintains snapshot history for analysis

**Key Functions:**
- `createLeaderboardSnapshot(bullPenId)` - Creates new snapshot
- `getLatestSnapshot(bullPenId)` - Gets most recent snapshot
- `getSnapshotHistory(bullPenId, limit)` - Gets snapshot history

#### 4. **Payout Service** (`payoutService.js`)
Calculates and validates payout distributions:
- **Multiple Models**: Supports winner-take-all, proportional, and tiered payouts
- **Validation**: Ensures payout totals match pool
- **Rounding Adjustment**: Handles floating-point rounding

**Key Functions:**
- `calculatePayouts(leaderboard, totalPool, model)` - Calculates payouts
- `validatePayouts(payouts, totalPool)` - Validates payout distribution
- `adjustPayoutsForRounding(payouts, totalPool)` - Adjusts for rounding errors
- `getPayoutSummary(payouts)` - Gets payout statistics

#### 5. **Trade Room Event Logger** (`tradeRoomEventLogger.js`)
Comprehensive audit logging:
- **Event Logging**: Logs all Trade Room events
- **Audit Trail**: Creates immutable audit trail
- **Event Types**: Room creation, joins, orders, settlements

**Key Functions:**
- `logEvent(event)` - Logs generic event
- `logRoomCreated(bullPenId, userId, roomData)` - Logs room creation
- `logUserJoined(bullPenId, userId, buyIn)` - Logs user join
- `logOrderPlaced(bullPenId, userId, orderData)` - Logs order placement
- `logRoomSettled(bullPenId, settlementData)` - Logs settlement

### Controllers Layer

#### 1. **Bull Pens Controller** (`bullPensController.js`)
Handles room CRUD operations:
- **Create**: Creates new room with validation
- **List**: Lists rooms with filtering
- **Get**: Gets room details
- **Update**: Updates room (host only)
- **Delete**: Soft deletes room

**Enhancements:**
- Added `validateRoomCreation()` for input validation
- Integrated `tradeRoomService` for state management
- Comprehensive error handling

#### 2. **Bull Pen Orders Controller** (`bullPenOrdersController.js`)
Handles order placement and management:
- **Place Order**: Places buy/sell orders with validation
- **List Orders**: Lists orders for room or user
- **List Positions**: Lists user positions

**Enhancements:**
- Added `validateOrderParams()` for order validation
- Integrated `positionTrackingService` for position updates
- Enhanced error handling and validation

#### 3. **Leaderboard Controller** (`leaderboardController.js`)
Handles leaderboard operations:
- **Get Leaderboard**: Gets current leaderboard
- **Create Snapshot**: Creates new snapshot (host/admin only)
- **Get Latest Snapshot**: Gets most recent snapshot
- **Get History**: Gets snapshot history

**New Endpoints:**
- `POST /api/bull-pens/:id/leaderboard/snapshot` - Create snapshot
- `GET /api/bull-pens/:id/leaderboard/snapshot` - Get latest snapshot
- `GET /api/bull-pens/:id/leaderboard/history` - Get snapshot history

### Validation Layer

#### Trade Room Validation (`tradeRoomValidation.js`)
Comprehensive input validation:
- **Room Creation**: Validates name, duration, cash, max players
- **Order Parameters**: Validates symbol, side, type, quantity, price
- **Room Updates**: Validates update parameters

**Validation Rules:**
- Room name: 1-255 characters
- Duration: 60-86400 seconds (1 minute to 24 hours)
- Starting cash: $1-$1,000,000
- Max players: 2-100
- Order quantity: 1-1,000,000 shares
- Limit price: $0.01-$1,000,000

## API Endpoints

### Room Management
- `POST /api/bull-pens` - Create room
- `GET /api/bull-pens` - List rooms
- `GET /api/bull-pens/:id` - Get room details
- `PATCH /api/bull-pens/:id` - Update room
- `DELETE /api/bull-pens/:id` - Delete room

### Membership
- `POST /api/bull-pens/:id/join` - Join room
- `POST /api/bull-pens/:id/leave` - Leave room
- `GET /api/bull-pens/:id/members` - List members

### Orders & Positions
- `POST /api/bull-pens/:id/orders` - Place order
- `GET /api/bull-pens/:id/orders` - List orders
- `GET /api/bull-pens/:id/positions` - List positions

### Leaderboard
- `GET /api/bull-pens/:id/leaderboard` - Get leaderboard
- `POST /api/bull-pens/:id/leaderboard/snapshot` - Create snapshot
- `GET /api/bull-pens/:id/leaderboard/snapshot` - Get latest snapshot
- `GET /api/bull-pens/:id/leaderboard/history` - Get history

## Testing

Run integration tests:
```bash
npm test -- tradeRoom.integration.test.js
```

Tests cover:
- State machine transitions
- Position P&L calculations
- Payout calculations and validation
- Input validation
- Error handling

## Error Handling

All endpoints return standardized error responses:
```json
{
  "error": "Error message",
  "status": 400
}
```

Common error codes:
- 400: Bad request (validation error)
- 403: Forbidden (permission denied)
- 404: Not found
- 500: Internal server error

## Next Steps

1. **Frontend Integration**: Implement React components for Trade Room UI
2. **Real-time Updates**: Add WebSocket support for live leaderboard updates
3. **Performance Optimization**: Add caching for frequently accessed data
4. **Advanced Features**: Implement AI recommendations, achievements, seasons

