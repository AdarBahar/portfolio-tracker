# Budget and Trading Room Integration Guide

## Overview

This document describes how to integrate the Budget Service with Trading Room (Bull Pen) operations. The Budget Service manages global virtual currency, while Trading Rooms manage local room-specific cash and positions.

## Integration Points

### 1. Room Join Flow (Buy-in)

**Current Flow:**
```
User joins room → Create membership with starting_cash
```

**New Flow with Budget:**
```
User joins room
  ↓
Validate user has sufficient budget (available_balance >= buy_in_amount)
  ↓
Call Budget Service: POST /internal/v1/budget/debit
  - user_id: user.id
  - amount: room.starting_cash
  - operation_type: "ROOM_BUY_IN"
  - bull_pen_id: room.id
  - correlation_id: "room-{room.id}-join-{uuid}"
  ↓
If debit succeeds:
  - Create membership with starting_cash
  - Return success to user
  ↓
If debit fails (INSUFFICIENT_FUNDS):
  - Return 400 error to user
  - Do NOT create membership
```

**Implementation Location:**
- File: `backend/src/controllers/bullPenMembershipsController.js`
- Function: `joinBullPen()`
- Add budget debit call before membership creation

**Code Pattern:**
```javascript
const budgetService = require('../services/budgetService');

// In joinBullPen():
const debitResult = await budgetService.debitBudget(userId, room.starting_cash, {
  operation_type: 'ROOM_BUY_IN',
  bull_pen_id: room.id,
  correlation_id: `room-${room.id}-join-${uuid()}`,
  idempotency_key: `join-${userId}-${room.id}-${timestamp}`
});

if (debitResult.error) {
  return res.status(debitResult.status).json({ error: debitResult.error });
}

// Proceed with membership creation
```

### 2. Room Settlement Flow (Payouts)

**Current Flow:**
```
Room ends → Calculate final rankings → Update leaderboard
```

**New Flow with Budget:**
```
Room ends
  ↓
Calculate final rankings and payouts
  ↓
For each player:
  - Calculate payout (winner gets prize pool, others get refund or loss)
  - Call Budget Service: POST /internal/v1/budget/credit or /debit
    - operation_type: "ROOM_SETTLEMENT_WIN" or "ROOM_SETTLEMENT_LOSS"
    - correlation_id: "room-{room.id}-settlement-{uuid}"
    - idempotency_key: "settlement-{user.id}-{room.id}-{timestamp}"
  ↓
Update leaderboard snapshots
```

**Implementation Location:**
- File: `backend/src/jobs/index.js` (background job for room settlement)
- Or: Create new settlement endpoint in `bullPensController.js`

**Code Pattern:**
```javascript
// For winners:
await budgetService.creditBudget(userId, winnings, {
  operation_type: 'ROOM_SETTLEMENT_WIN',
  bull_pen_id: room.id,
  correlation_id: settlementId,
  idempotency_key: `settlement-${userId}-${room.id}`
});

// For losers (if applicable):
await budgetService.debitBudget(userId, losses, {
  operation_type: 'ROOM_SETTLEMENT_LOSS',
  bull_pen_id: room.id,
  correlation_id: settlementId,
  idempotency_key: `settlement-${userId}-${room.id}`
});
```

### 3. Room Cancellation (Refund)

**Current Flow:**
```
Host cancels room → Delete memberships
```

**New Flow with Budget:**
```
Host cancels room
  ↓
For each active member:
  - Call Budget Service: POST /internal/v1/budget/credit
    - amount: member.starting_cash (refund buy-in)
    - operation_type: "ROOM_REFUND"
    - correlation_id: "room-{room.id}-cancel-{uuid}"
    - idempotency_key: "refund-{user.id}-{room.id}"
  ↓
Delete memberships
```

**Implementation Location:**
- File: `backend/src/controllers/bullPensController.js`
- Function: `deleteBullPen()` or new `cancelBullPen()`

### 4. Member Removal (Kick/Leave)

**Current Flow:**
```
Host kicks member or member leaves → Update membership status
```

**New Flow with Budget:**
```
Member leaves/kicked before room starts
  ↓
Call Budget Service: POST /internal/v1/budget/credit
  - amount: member.starting_cash (refund)
  - operation_type: "ROOM_LEAVE_REFUND"
  - correlation_id: "room-{room.id}-leave-{uuid}"
  ↓
Update membership status to 'left'
```

## Error Handling

### Insufficient Funds
- User tries to join room but has insufficient budget
- Response: 400 Bad Request with `{ error: "INSUFFICIENT_FUNDS" }`
- User sees: "Insufficient funds to join this room"

### Budget Frozen
- User's budget is frozen (admin action)
- Response: 400 Bad Request with `{ error: "BUDGET_FROZEN" }`
- User sees: "Your account is temporarily frozen"

### Idempotency
- All budget operations use `Idempotency-Key` header
- If network fails and user retries, same operation won't double-charge
- Safe to retry without side effects

## Correlation IDs

Use correlation IDs to link budget operations to room events:

```
room-{room.id}-join-{uuid}           # Room join
room-{room.id}-settlement-{uuid}     # Room settlement
room-{room.id}-cancel-{uuid}         # Room cancellation
room-{room.id}-leave-{uuid}          # Member leave/kick
```

This enables:
- Audit trail linking budget changes to room events
- Reconciliation between room financials and budget logs
- Debugging transaction issues

## Testing

### Manual Testing
```bash
# 1. Create test users with budgets
# 2. Create test room with buy-in amount
# 3. Join room (should debit budget)
# 4. Check budget logs for ROOM_BUY_IN entry
# 5. End room and settle (should credit budget)
# 6. Check budget logs for ROOM_SETTLEMENT_WIN entry
```

### Integration Tests
- See `backend/test-budget-integration.js`
- Add tests for room join/settlement flows
- Test idempotency with concurrent requests
- Test error cases (insufficient funds, frozen budget)

## Deployment Checklist

- [ ] Update `bullPenMembershipsController.js` to call budget debit on join
- [ ] Update room settlement logic to call budget credit/debit
- [ ] Update room cancellation to refund budgets
- [ ] Update member leave/kick to refund budgets
- [ ] Add correlation_id tracking to all budget operations
- [ ] Test all flows with real database
- [ ] Update OpenAPI spec with new error responses
- [ ] Add monitoring/alerts for budget operation failures
- [ ] Document user-facing error messages
- [ ] Train support team on budget-related issues

## Future Enhancements

- [ ] Rake/house fee deduction from room payouts
- [ ] Bonus/promotion credit system
- [ ] Budget transfer between users (gift)
- [ ] Subscription/VIP tier with budget bonuses
- [ ] Reconciliation job comparing room financials with budget logs
- [ ] Admin dashboard for budget management

