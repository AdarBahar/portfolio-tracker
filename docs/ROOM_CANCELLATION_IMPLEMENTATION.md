# Room Cancellation & Member Removal Implementation

## Overview

This implementation handles two scenarios:
1. **Room Cancellation**: Cancel an entire room and refund all members
2. **Member Removal**: Kick a member from a room and optionally refund

Both operations are only allowed before the room starts (draft/scheduled states).

## Architecture

### Room Cancellation Flow

```
Host cancels room (state = draft or scheduled)
  ↓
Call cancellationService.cancelRoom()
  ↓
For each active/pending member:
  - Call budgetService.creditBudget()
  - Record operation with correlation_id
  ↓
Mark all memberships as 'cancelled'
  ↓
Mark room as 'cancelled'
```

### Member Removal Flow

```
Host kicks member (room state = draft or scheduled)
  ↓
Call cancellationService.kickMember()
  ↓
If room hasn't started:
  - Call budgetService.creditBudget()
  - Record operation with correlation_id
  ↓
Mark membership as 'kicked'
```

## Implementation Details

### 1. Cancellation Service (`backend/src/services/cancellationService.js`)

**Function: `cancelRoom(bullPenId)`**

Cancels a room and refunds all members:
1. Validates room is in draft or scheduled state
2. Fetches all active/pending members
3. Credits each member with buy-in amount
4. Marks all memberships as 'cancelled'
5. Marks room as 'cancelled'

**Idempotency:**
- Uses `idempotency_key = cancellation-{userId}-{roomId}`
- Uses `correlation_id = room-{roomId}-cancellation-{uuid}`
- Safe to retry without duplicate refunds

**Function: `kickMember(bullPenId, userId)`**

Kicks a member from a room:
1. Validates member exists
2. If room hasn't started: refunds buy-in
3. Marks membership as 'kicked'

**Idempotency:**
- Uses `idempotency_key = kick-{userId}-{roomId}`
- Uses `correlation_id = room-{roomId}-kick-{uuid}`

### 2. Cancellation Controller (`backend/src/controllers/cancellationController.js`)

**Endpoint: `POST /internal/v1/cancellation/rooms/:id`**

Cancel a room and refund all members.

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer <internal-service-token>" \
  http://localhost:4000/internal/v1/cancellation/rooms/123
```

**Response (Success):**
```json
{
  "success": true,
  "room_id": 123,
  "refunded_count": 5,
  "message": "Room 123 cancelled. 5 members refunded."
}
```

**Response (Error):**
```json
{
  "error": "ROOM_ALREADY_STARTED",
  "message": "Cancellation failed: ROOM_ALREADY_STARTED"
}
```

**Endpoint: `POST /internal/v1/cancellation/rooms/:id/members/:userId`**

Kick a member from a room.

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer <internal-service-token>" \
  http://localhost:4000/internal/v1/cancellation/rooms/123/members/456
```

**Response (Success):**
```json
{
  "success": true,
  "room_id": 123,
  "user_id": 456,
  "refunded": true,
  "message": "User 456 kicked from room 123. Refunded: true"
}
```

## Budget Log Entries

### Room Cancellation

```json
{
  "user_id": 123,
  "direction": "IN",
  "operation_type": "ROOM_CANCELLATION_REFUND",
  "amount": 500.00,
  "currency": "VUSD",
  "balance_before": 4250.00,
  "balance_after": 4750.00,
  "bull_pen_id": 45,
  "correlation_id": "room-45-cancellation-uuid",
  "idempotency_key": "cancellation-123-45",
  "created_at": "2025-11-27T10:30:00Z"
}
```

### Member Kick

```json
{
  "user_id": 123,
  "direction": "IN",
  "operation_type": "ROOM_MEMBER_KICK_REFUND",
  "amount": 500.00,
  "currency": "VUSD",
  "balance_before": 4250.00,
  "balance_after": 4750.00,
  "bull_pen_id": 45,
  "correlation_id": "room-45-kick-uuid",
  "idempotency_key": "kick-123-45",
  "created_at": "2025-11-27T10:30:00Z"
}
```

## Database Schema Updates

### New States

**bull_pens.state:**
- Added: 'cancelled'
- Valid values: 'draft', 'scheduled', 'active', 'completed', 'cancelled', 'archived'

**bull_pen_memberships.status:**
- Added: 'cancelled'
- Valid values: 'pending', 'active', 'kicked', 'left', 'cancelled'

## Error Handling

### Scenarios

1. **Room not found**: Returns ROOM_NOT_FOUND
2. **Room already started**: Returns ROOM_ALREADY_STARTED
3. **Member not found**: Returns MEMBER_NOT_FOUND
4. **Budget credit fails**: Logs warning, continues
5. **Database error**: Rolls back transaction, returns error

### Recovery

If cancellation fails:
1. Room remains in original state
2. Manual retry via POST endpoint
3. Idempotency ensures no duplicate refunds

## Testing

### Cancel Room

```bash
# Cancel room 123
curl -X POST \
  -H "Authorization: Bearer <internal-service-token>" \
  http://localhost:4000/internal/v1/cancellation/rooms/123
```

### Kick Member

```bash
# Kick user 456 from room 123
curl -X POST \
  -H "Authorization: Bearer <internal-service-token>" \
  http://localhost:4000/internal/v1/cancellation/rooms/123/members/456
```

### Verify Cancellation

```bash
# Check room state
mysql -e "SELECT id, state FROM bull_pens WHERE id = 123;"

# Check membership status
mysql -e "SELECT user_id, status FROM bull_pen_memberships WHERE bull_pen_id = 123;"

# Check budget logs
mysql -e "SELECT * FROM budget_logs WHERE bull_pen_id = 123 AND operation_type LIKE '%CANCEL%' OR operation_type LIKE '%KICK%';"
```

## Files Modified/Created

### Created
- `backend/src/services/cancellationService.js` - Cancellation logic
- `backend/src/controllers/cancellationController.js` - Cancellation endpoints
- `backend/src/routes/cancellationRoutes.js` - Cancellation routes
- `docs/ROOM_CANCELLATION_IMPLEMENTATION.md` - This documentation

### Modified
- `schema.mysql.sql` - Added 'cancelled' state and status
- `backend/src/app.js` - Registered cancellation routes

## Next Steps

1. Apply schema migration
2. Test cancellation with fake data
3. Implement rake/house fee system
4. Create reconciliation job

