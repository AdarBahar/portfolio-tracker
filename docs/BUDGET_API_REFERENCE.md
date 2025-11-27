# Budget API Reference

## Public Endpoints (User)

### GET /api/v1/budget
Get current user's budget status.

**Authentication**: Bearer token (user)

**Response**:
```json
{
  "id": 1,
  "userId": 4,
  "availableBalance": 4750.00,
  "lockedBalance": 0.00,
  "totalBalance": 4750.00,
  "currency": "VUSD",
  "status": "active"
}
```

### GET /api/v1/budget/logs
Get user's budget transaction logs with pagination.

**Authentication**: Bearer token (user)

**Query Parameters**:
- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `operationType` (optional filter)
- `direction` (optional: IN, OUT, LOCK, UNLOCK)

**Response**:
```json
{
  "logs": [
    {
      "id": 10,
      "direction": "IN",
      "operationType": "ADJUSTMENT_CREDIT",
      "amount": 200.00,
      "balanceBefore": 4550.00,
      "balanceAfter": 4750.00,
      "createdAt": "2025-11-21T10:00:00Z"
    }
  ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

## Internal Endpoints (Service-to-Service)

### POST /internal/v1/budget/credit
Credit user's budget (add money).

**Authentication**: Bearer token (INTERNAL_SERVICE_TOKEN)

**Headers**: `Idempotency-Key: <unique-key>`

**Request**:
```json
{
  "user_id": 4,
  "amount": 100.00,
  "operation_type": "ROOM_SETTLEMENT_WIN",
  "bull_pen_id": 1,
  "correlation_id": "room-1-settlement-uuid"
}
```

**Response**:
```json
{
  "user_id": 4,
  "balance_before": 4650.00,
  "balance_after": 4750.00,
  "log_id": 10,
  "idempotent": false
}
```

### POST /internal/v1/budget/debit
Debit user's budget (remove money).

**Authentication**: Bearer token (INTERNAL_SERVICE_TOKEN)

**Headers**: `Idempotency-Key: <unique-key>`

**Request**:
```json
{
  "user_id": 4,
  "amount": 500.00,
  "operation_type": "ROOM_BUY_IN",
  "bull_pen_id": 1,
  "correlation_id": "room-1-join-uuid"
}
```

**Response**:
```json
{
  "user_id": 4,
  "balance_before": 5250.00,
  "balance_after": 4750.00,
  "log_id": 9,
  "idempotent": false
}
```

### POST /internal/v1/budget/lock
Lock funds (move from available to locked).

**Authentication**: Bearer token (INTERNAL_SERVICE_TOKEN)

**Headers**: `Idempotency-Key: <unique-key>`

**Request**:
```json
{
  "user_id": 4,
  "amount": 500.00,
  "operation_type": "ROOM_BUY_IN_LOCK",
  "bull_pen_id": 1
}
```

**Response**:
```json
{
  "user_id": 4,
  "balance_before": 4750.00,
  "balance_after": 4250.00,
  "locked_balance": 500.00,
  "log_id": 11,
  "idempotent": false
}
```

### POST /internal/v1/budget/unlock
Unlock funds (move from locked to available).

**Authentication**: Bearer token (INTERNAL_SERVICE_TOKEN)

**Headers**: `Idempotency-Key: <unique-key>`

**Request**:
```json
{
  "user_id": 4,
  "amount": 500.00,
  "operation_type": "ROOM_BUY_IN_UNLOCK",
  "bull_pen_id": 1
}
```

**Response**:
```json
{
  "user_id": 4,
  "balance_before": 500.00,
  "balance_after": 0.00,
  "available_balance": 4750.00,
  "log_id": 12,
  "idempotent": false
}
```

### POST /internal/v1/budget/transfer
Transfer budget between users.

**Authentication**: Bearer token (INTERNAL_SERVICE_TOKEN)

**Headers**: `Idempotency-Key: <unique-key>`

**Request**:
```json
{
  "from_user_id": 4,
  "to_user_id": 5,
  "amount": 100.00,
  "operation_type_out": "TRANSFER_OUT",
  "operation_type_in": "TRANSFER_IN"
}
```

**Response**:
```json
{
  "from_user_id": 4,
  "to_user_id": 5,
  "amount": 100.00,
  "from_balance_before": 4750.00,
  "from_balance_after": 4650.00,
  "to_balance_before": 1000.00,
  "to_balance_after": 1100.00,
  "from_log_id": 13,
  "to_log_id": 14,
  "correlation_id": "transfer-uuid-001",
  "idempotent": false
}
```

### POST /internal/v1/budget/adjust
Admin adjustment (credit or debit).

**Authentication**: Bearer token (INTERNAL_SERVICE_TOKEN)

**Headers**: `Idempotency-Key: <unique-key>`

**Request**:
```json
{
  "user_id": 4,
  "amount": 200.00,
  "direction": "IN",
  "operation_type": "ADJUSTMENT_CREDIT",
  "created_by": "admin:1"
}
```

**Response**:
```json
{
  "user_id": 4,
  "balance_before": 4550.00,
  "balance_after": 4750.00,
  "log_id": 15,
  "idempotent": false
}
```

## Admin Endpoints

### GET /api/admin/users/:id/detail
Get comprehensive user information.

**Authentication**: Bearer token (admin)

**Response**:
```json
{
  "user": { /* user profile */ },
  "budget": { /* budget status */ },
  "budgetLogs": [ /* last 10 transactions */ ],
  "tradingRooms": [ /* all rooms user is member of */ ],
  "standings": [ /* leaderboard standings */ ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "User does not have sufficient available balance"
}
```

### 400 Bad Request (Frozen Budget)
```json
{
  "error": "BUDGET_FROZEN",
  "message": "User's budget is frozen"
}
```

### 404 Not Found
```json
{
  "error": "BUDGET_NOT_FOUND",
  "message": "User's budget not found"
}
```

### 403 Forbidden
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid service token"
}
```

## Idempotency

All write operations support idempotency via `Idempotency-Key` header:
- Same key returns cached result
- Safe to retry without side effects
- Key format: `<operation>-<user>-<timestamp>-<uuid>`

## Correlation IDs

Use correlation IDs to link related operations:
- `room-{room_id}-join-{uuid}` - Room join
- `room-{room_id}-settlement-{uuid}` - Room settlement
- `room-{room_id}-leave-{uuid}` - Room leave
- `transfer-{uuid}` - User transfer
- `admin-adjust-{uuid}` - Admin adjustment

## Rate Limits

- Public endpoints: 100 requests/minute per user
- Internal endpoints: 1000 requests/minute per service
- Admin endpoints: 100 requests/minute per admin

## Monetary Precision

All amounts use DECIMAL(18,2) precision:
- 2 decimal places (cents)
- Rounding: ROUND_HALF_UP
- Currency: VUSD (virtual USD)

