# Budget API and Trading Room Integration Specification

**Document Status:** LOCKED v1.0 — This spec is the implementation baseline for the Budget API and Trading Room integration. Any changes must be versioned and reviewed before code is updated.



This document defines:

* Backend API endpoints for budget operations
* Integration flows between Budget Management and Trading Rooms

The APIs assume the `user_budgets` and `budget_logs` tables described in the Budget Management spec.

---

## 1. General API Requirements

* All requests must be authenticated (user or service-level token).
* All write operations must be idempotent using `Idempotency-Key` header.
* All balance changes must:

  1. Run inside a DB transaction
  2. Lock the budget row (`SELECT ... FOR UPDATE`)

**Idempotency policy:**

* All write endpoints that accept `Idempotency-Key` must:
  * Treat the key as unique for that logical business action (for example per user + endpoint + room join/settlement).
  * On first successful execution: perform the mutation and persist the key in `budget_logs.idempotency_key`.
  * On retry with the same key: avoid re-running the mutation and instead return a response built from the existing log entry.
* The platform must define an operational retention period for idempotency keys (for example, at least 24–72 hours for room-related operations) so that retries and batch restarts are safe.


  3. Update `user_budgets`
  4. Insert a row into `budget_logs`

Error responses should include a stable error code and message.

```jsonc
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Not enough available balance"
  }
}
```

---

## 2. Public Budget API (User Facing)

### 2.1 Get current budget

**GET** `/api/v1/budget`

Returns the current user budget for the authenticated user.

**Auth:** User token

**Response 200**

```json
{
  "user_id": 123,
  "currency": "VUSD",
  "available_balance": 1200.50,
  "locked_balance": 100.00,
  "total_balance": 1300.50,
  "status": "active"
}
```

---

### 2.2 Get budget history

**GET** `/api/v1/budget/logs`

Returns paginated history of budget changes for the authenticated user.

**Query params**

* `limit` (default 50, max 200)
* `offset` (default 0)
* `from` (optional, ISO datetime)
* `to` (optional, ISO datetime)
* `operation_type` (optional, filter by type)
* `bull_pen_id` (optional)
* `season_id` (optional)

**Response 200**

```json
{
  "items": [
    {
      "id": 1,
      "direction": "IN",
      "operation_type": "INITIAL_GRANT",
      "amount": 1000.00,
      "currency": "VUSD",
      "balance_before": 0.00,
      "balance_after": 1000.00,
      "bull_pen_id": null,
      "season_id": null,
      "created_at": "2025-01-01T10:00:00Z",
      "meta": {
        "note": "Welcome bonus"
      }
    }
  ],
  "limit": 50,
  "offset": 0,
  "total": 123
}
```

---

## 3. Internal / Service Budget API

These endpoints are used by internal services (Trading Rooms, Admin, Promotions). They are not called directly from the client.

All write endpoints:

* Accept `Idempotency-Key` header
* Return the same result if called again with the same key

### 3.1 Credit user budget

Credits the user budget (money in). Used for initial grants, bonuses, payouts, positive adjustments.

**POST** `/internal/v1/budget/credit`

**Auth:** Service token

**Headers**

* `Idempotency-Key` (string, required)

**Body**

```json
{
  "user_id": 123,
  "amount": 500.00,
  "currency": "VUSD",
  "operation_type": "ROOM_WIN_PAYOUT",
  "bull_pen_id": 45,
  "season_id": 3,
  "moved_from": "room_pot",
  "correlation_id": "room-45-settlement-uuid",
  "meta": {
    "placement": 1,
    "room_payout_structure_version": "v2"
  }
}
```

**Response 200**

```json
{
  "user_id": 123,
  "amount": 500.00,
  "currency": "VUSD",
  "balance_before": 700.00,
  "balance_after": 1200.00,
  "log_id": 9876
}
```

**Error codes**

* `USER_NOT_FOUND`
* `BUDGET_FROZEN`

---

### 3.2 Debit user budget

Debits the user budget (money out). Used for buy-ins, fees, negative adjustments.

**POST** `/internal/v1/budget/debit`

**Auth:** Service token

**Headers**

* `Idempotency-Key` (string, required)

**Body**

```json
{
  "user_id": 123,
  "amount": 100.00,
  "currency": "VUSD",
  "operation_type": "ROOM_BUY_IN",
  "bull_pen_id": 45,
  "season_id": 3,
  "moved_to": "room_pot",
  "correlation_id": "room-45-join-uuid",
  "meta": {
    "entry_type": "standard"
  }
}
```

**Response 200**

```json
{
  "user_id": 123,
  "amount": 100.00,
  "currency": "VUSD",
  "balance_before": 1200.00,
  "balance_after": 1100.00,
  "log_id": 9988
}
```

**Error codes**

* `INSUFFICIENT_FUNDS`
* `BUDGET_FROZEN`

---

### 3.3 Lock and unlock funds (optional)

If you use locked balance for pending room entries.

#### 3.3.1 Lock funds

**POST** `/internal/v1/budget/lock`

Moves money from `available_balance` to `locked_balance`.

Body is similar to `debit`, but semantics are different.

```json
{
  "user_id": 123,
  "amount": 100.00,
  "currency": "VUSD",
  "operation_type": "ROOM_BUY_IN_LOCK",
  "bull_pen_id": 45,
  "season_id": 3,
  "correlation_id": "room-45-join-uuid",
  "meta": {}
}
```

#### 3.3.2 Unlock funds

**POST** `/internal/v1/budget/unlock`

Moves money from `locked_balance` back to `available_balance`.

Used on room cancel, join failure, or room start depending on your design.

```json
{
  "user_id": 123,
  "amount": 100.00,
  "currency": "VUSD",
  "operation_type": "ROOM_BUY_IN_UNLOCK",
  "bull_pen_id": 45,
  "season_id": 3,
  "correlation_id": "room-45-join-uuid",
  "meta": {}
}
```

---

### 3.4 User-to-user transfer

**POST** `/internal/v1/budget/transfer`

Atomically transfers budget from one user to another.

**Headers**

* `Idempotency-Key` (required)

**Body**

```json
{
  "from_user_id": 123,
  "to_user_id": 456,
  "amount": 50.00,
  "currency": "VUSD",
  "operation_type_out": "TRANSFER_OUT",
  "operation_type_in": "TRANSFER_IN",
  "meta": {
    "reason": "Friendly stake"
  }
}
```

**Behavior**

* Locks both budgets in a deterministic order (for example ascending user id)
* Debits `from_user_id`
* Credits `to_user_id`
* Writes two `budget_logs` entries under same `correlation_id`

**Response 200**

```json
{
  "from_user": {
    "user_id": 123,
    "balance_before": 500.00,
    "balance_after": 450.00,
    "log_id": 111
  },
  "to_user": {
    "user_id": 456,
    "balance_before": 200.00,
    "balance_after": 250.00,
    "log_id": 112
  },
  "correlation_id": "transfer-uuid"
}
```

---

### 3.5 Admin adjustments

**POST** `/internal/v1/budget/adjust`

Admin-only endpoint for manual corrections.

Body includes admin id and comment.

```json
{
  "user_id": 123,
  "amount": 20.00,
  "currency": "VUSD",
  "direction": "IN",
  "operation_type": "ADJUSTMENT_CREDIT",
  "created_by": "admin:42",
  "meta": {
    "ticket_id": "SUP-12345",
    "reason": "Manual correction"
  }
}
```

---

### 4.0 Accounting Model Between Budget and Trading Rooms

* `user_budgets` and `budget_logs` model **global virtual money** for each user.
* Bull Pens keep their own internal cash and P&L using `bull_pen_memberships` and `bull_pen_positions` for gameplay and rankings.
* For the MVP integration, only the following flows affect `user_budgets`:
  * **Room entry** (buy-in): a debit (or lock) when the user successfully joins a room.
  * **Room settlement**: credits (and optional debits for losses) when the room ends, based on final payouts.
* Intra-room trades and mark-to-market value changes **do not** directly change `user_budgets`; they remain internal to the Trading Room domain and are reflected only in room-level rankings.
* Any future design that makes per-trade P&L impact the global budget must be treated as a major design change and go through a new version of this document.

---

## 4. Trading Room Integration Flows

This section describes how the Trading Room service should interact with the Budget service.

### 4.1 User joining a trading room (buy-in)

**Goal:** Deduct buy-in from user budget only if join succeeds.

#### Steps

1. Client calls Trading Room API:

   * `POST /api/v1/rooms/{bull_pen_id}/join`

2. Trading Room service:

   1. Validates room state and permissions
   2. Calls Budget service to debit or lock funds:

      * `POST /internal/v1/budget/debit` or `/lock` with `operation_type = ROOM_BUY_IN`
      * Include `bull_pen_id`, `season_id`, and `correlation_id = room-join-uuid`
   3. If Budget responds `INSUFFICIENT_FUNDS`:

      * Return 400 to client (`INSUFFICIENT_FUNDS`)
   4. If Budget succeeds:

      * Create room membership record
      * Return success to client

3. If any later step fails after debit/lock:

   * Trading Room must call Budget to refund or unlock:

     * `POST /internal/v1/budget/credit` or `/unlock` with the same `correlation_id`

---

### 4.2 Room cancellation before start

If a room is canceled before any trading happens:

1. Trading Room marks room as `canceled`.
2. For each joined user:

   * Call Budget service:

     * If funds were debited: `credit` with `operation_type = ROOM_REFUND`
     * If funds were locked: `unlock` with `operation_type = ROOM_BUY_IN_UNLOCK`
   * Use same `correlation_id` pattern for traceability.

---

### 4.3 Room settlement at end

**Goal:** Apply winnings and possibly fees to user budgets.

#### Inputs

* Final leaderboard (ranking, payouts) from Trading logic
* Rake / fee rules

#### Steps

1. Trading Room calculates final standings and payouts per user.
2. For each user with payout > 0:

   * Call Budget `credit` with:

     * `operation_type = ROOM_WIN_PAYOUT`
     * `bull_pen_id`

In addition to using idempotency keys:

* Trading Room should persist a per-user `settlement_status` (for example `pending`, `complete`, `failed`) for each room or settlement batch.
* On restart or retry of a settlement job:
  * Only users in `pending` or `failed` status should be re-processed.
  * The same `Idempotency-Key` and `correlation_id` must be reused so Budget can detect and short-circuit already-completed operations.
* Reconciliation jobs must correlate Trading Room expectations (payout amounts, buy-ins, and fees per user) with aggregated amounts from `budget_logs` using `bull_pen_id`, `season_id`, and `correlation_id`.


     * `season_id`
     * `moved_from = "room_pot"` or `"house"`
     * `correlation_id = room-{bull_pen_id}-settlement-uuid`
3. If you also model direct losses to budget (Model B):

   * For each user with net loss < 0:

     * Call Budget `debit` with `operation_type = ROOM_LOSS_SETTLEMENT`
4. If you apply rake:

   * Debit room pot or winner payouts and credit house account using internal transfer logic.

All operations for a room settlement can be processed in a batch job. Each individual credit/debit uses its own `Idempotency-Key` so settlement jobs can be retried safely.

---

### 4.4 Handling partial failures

Because Budget operations are idempotent:

* Trading Room can safely retry calls that fail due to network issues.
* If a room settlement batch fails mid-way:

  * Store state per user (for example `settlement_status = pending/complete/failed`).
  * On retry, call Budget again with the same `Idempotency-Key` for each user.
  * Budget will return the original result if the operation already succeeded.

A periodic reconciliation job should:

* Compare Trading Room expected balances vs Budget logs
* Alert if mismatches are found

---

### 4.5 Derived stats for ranking

Budget logs can feed ranking and analytics:

* Total wins and losses per user can be derived from `operation_type`:

  * Wins: sum of amounts where `operation_type = ROOM_WIN_PAYOUT`
  * Losses: sum of amounts where `operation_type = ROOM_BUY_IN` or `ROOM_LOSS_SETTLEMENT`
* Stars or achievements can be granted based on thresholds (for example total winnings, number of profitable rooms) and written into `user_star_events`.

These stats connect Budget Management with the Ranking Mechanism without duplicating financial logic.
