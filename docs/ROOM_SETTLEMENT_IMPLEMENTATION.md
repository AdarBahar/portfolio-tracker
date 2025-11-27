# Room Settlement Implementation

## Overview

Room settlement is the process of calculating final payouts and updating user budgets when a trading room completes. This implementation is fully integrated with the Budget Service for atomic, idempotent operations.

## Architecture

### Settlement Flow

```
Room completes (state = 'completed')
  ↓
Background job triggers (roomStateManager)
  ↓
Create final leaderboard snapshot
  ↓
Call settlementService.settleRoom()
  ↓
For each player:
  - Calculate payout based on rank and P&L
  - Call budgetService.creditBudget()
  - Record operation with correlation_id
  ↓
Mark room as settled (settlement_status = 'completed')
```

## Implementation Details

### 1. Settlement Service (`backend/src/services/settlementService.js`)

**Function: `settleRoom(bullPenId)`**

Settles a completed room by:
1. Fetching room info and final leaderboard
2. Calculating payouts for each player:
   - **Rank 1 (Winner)**: Gets all buy-ins (total pool)
   - **Positive P&L**: Gets profit amount
   - **Break-even**: Gets refund of buy-in
   - **Negative P&L**: No additional credit (already debited on join)
3. Crediting each user's budget with idempotency
4. Marking room as settled

**Idempotency:**
- Uses `idempotency_key = settlement-{userId}-{roomId}`
- Uses `correlation_id = room-{roomId}-settlement-{uuid}`
- Safe to retry without duplicate credits

### 2. Background Job Integration (`backend/src/jobs/index.js`)

**Modified: `roomStateManager()`**

When transitioning rooms from active → completed:
1. Updates room state to 'completed'
2. Creates final leaderboard snapshot
3. Calls `settlementService.settleRoom()`
4. Logs settlement results

Runs every minute via cron job.

### 3. Settlement Controller (`backend/src/controllers/settlementController.js`)

**Endpoint: `POST /internal/v1/settlement/rooms/:id`**

Allows manual settlement triggering for testing/recovery.

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer <internal-service-token>" \
  http://localhost:4000/internal/v1/settlement/rooms/123
```

**Response (Success):**
```json
{
  "success": true,
  "room_id": 123,
  "settled_count": 5,
  "message": "Room 123 settled successfully. 5 users processed."
}
```

**Response (Error):**
```json
{
  "error": "ROOM_NOT_COMPLETED",
  "message": "Settlement failed: ROOM_NOT_COMPLETED"
}
```

### 4. Database Schema Updates

**New Column: `bull_pens.settlement_status`**
- Type: VARCHAR(20)
- Values: 'pending', 'completed', 'failed'
- Default: 'pending'
- Tracks settlement state for recovery/retry logic

## Payout Calculation

### Algorithm

```javascript
For each player in final leaderboard (ordered by rank):
  
  payout = 0
  operationType = 'ROOM_SETTLEMENT_LOSS'
  
  if (rank === 1) {
    // Winner gets all buy-ins
    payout = totalBuyIn
    operationType = 'ROOM_SETTLEMENT_WIN'
  } else if (pnlAbs > 0) {
    // Positive P&L: credit the profit
    payout = pnlAbs
    operationType = 'ROOM_SETTLEMENT_WIN'
  } else if (pnlAbs < 0) {
    // Negative P&L: no additional debit (already debited on join)
    payout = 0
    operationType = 'ROOM_SETTLEMENT_LOSS'
  } else {
    // Break-even: refund buy-in
    payout = startingCash
    operationType = 'ROOM_SETTLEMENT_BREAKEVEN'
  }
  
  if (payout > 0) {
    creditBudget(userId, payout, {
      operation_type: operationType,
      bull_pen_id: roomId,
      correlation_id: settlementId,
      idempotency_key: `settlement-${userId}-${roomId}`,
      meta: { rank, pnl_abs: pnlAbs }
    })
  }
```

## Budget Log Entries

Each settlement creates budget log entries:

```json
{
  "user_id": 123,
  "direction": "IN",
  "operation_type": "ROOM_SETTLEMENT_WIN",
  "amount": 1500.00,
  "currency": "VUSD",
  "balance_before": 4750.00,
  "balance_after": 6250.00,
  "bull_pen_id": 45,
  "correlation_id": "room-45-settlement-uuid-123",
  "idempotency_key": "settlement-123-45",
  "meta": {
    "rank": 1,
    "pnl_abs": 1500.00
  },
  "created_at": "2025-11-27T10:30:00Z"
}
```

## Error Handling

### Scenarios

1. **Room not found**: Returns ROOM_NOT_FOUND
2. **Room not completed**: Returns ROOM_NOT_COMPLETED
3. **No leaderboard**: Returns NO_LEADERBOARD
4. **Budget credit fails**: Logs warning, continues with other users
5. **Database error**: Rolls back transaction, returns error

### Recovery

If settlement fails:
1. Room remains in 'completed' state
2. `settlement_status` remains 'pending' or 'failed'
3. Manual retry via POST endpoint
4. Idempotency ensures no duplicate credits

## Testing

### Manual Settlement

```bash
# Trigger settlement for room 123
curl -X POST \
  -H "Authorization: Bearer <internal-service-token>" \
  http://localhost:4000/internal/v1/settlement/rooms/123
```

### Verify Settlement

```bash
# Check room settlement status
mysql -e "SELECT id, state, settlement_status FROM bull_pens WHERE id = 123;"

# Check budget logs for room
mysql -e "SELECT * FROM budget_logs WHERE bull_pen_id = 123 ORDER BY created_at DESC LIMIT 10;"

# Check user budget after settlement
mysql -e "SELECT * FROM user_budgets WHERE user_id = 123;"
```

## Files Modified/Created

### Created
- `backend/src/services/settlementService.js` - Settlement logic
- `backend/src/controllers/settlementController.js` - Settlement endpoints
- `backend/src/routes/settlementRoutes.js` - Settlement routes
- `docs/ROOM_SETTLEMENT_IMPLEMENTATION.md` - This documentation

### Modified
- `schema.mysql.sql` - Added settlement_status column
- `backend/src/jobs/index.js` - Integrated settlement into room state manager
- `backend/src/app.js` - Registered settlement routes

## Next Steps

1. Apply schema migration to add settlement_status column
2. Test settlement with fake data
3. Implement room cancellation refunds
4. Implement rake/house fee system
5. Create reconciliation job

