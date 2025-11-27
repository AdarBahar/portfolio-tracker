# Stars System - Data Flow Diagrams

## 1. Room Join Flow

```
User joins room
    ↓
bullPenMembershipsController.joinBullPen()
    ↓
✅ Membership created
    ↓
achievementsService.awardStars(
  userId: 4,
  reasonCode: 'first_room_join',
  context: { bullPenId: 1 }
)
    ↓
Check idempotency:
  SELECT * FROM user_star_events
  WHERE user_id = 4
    AND reason_code = 'first_room_join'
    AND bull_pen_id IS NULL
    AND season_id IS NULL
    ↓
    If exists: SKIP (already awarded)
    If not exists: CONTINUE
    ↓
INSERT INTO user_star_events (
  user_id: 4,
  reason_code: 'first_room_join',
  source: 'achievement',
  stars_delta: 10,
  meta: { bullPenId: 1, bullPenName: 'Tech Stocks' }
)
    ↓
Log to user_audit_log:
  event_type: 'star_awarded'
  description: 'Earned 10 stars for first room join'
    ↓
✅ User has 10 lifetime stars
```

---

## 2. Room Settlement Flow

```
Room settlement triggered
    ↓
settlementService.settleRoom(bullPenId: 1)
    ↓
Get final leaderboard:
  SELECT rank, user_id, pnl_abs, pnl_pct
  FROM leaderboard_snapshots
  WHERE bull_pen_id = 1
  ORDER BY rank ASC
    ↓
For each user in leaderboard:
    ↓
    ┌─ User 1 (rank 1, +150% P&L)
    │   ↓
    │   achievementsService.awardStars(
    │     reasonCode: 'room_first_place',
    │     context: { bullPenId: 1, rank: 1 }
    │   )
    │   ↓
    │   INSERT INTO user_star_events (stars_delta: 100)
    │
    ├─ User 2 (rank 2, +50% P&L)
    │   ↓
    │   Check three_straight_wins:
    │     SELECT COUNT(*) FROM bull_pen_memberships
    │     WHERE user_id = 2
    │       AND status = 'completed'
    │       AND pnl_pct > 0
    │       AND created_at > NOW() - INTERVAL 3 ROOM_DURATIONS
    │   ↓
    │   If count >= 3: Award 40 stars
    │
    └─ User 3 (rank 3, -20% P&L)
        ↓
        No achievements (lost)
    ↓
✅ All star awards recorded
```

---

## 3. Leaderboard Snapshot Creation

```
Background job: createLeaderboardSnapshot(bullPenId: 1)
    ↓
Get bull pen info:
  SELECT starting_cash FROM bull_pens WHERE id = 1
    ↓
Get all active members:
  SELECT user_id FROM bull_pen_memberships
  WHERE bull_pen_id = 1 AND status = 'active'
    ↓
For each member:
    ↓
    1. Calculate portfolio value
       - Get cash from bull_pen_memberships
       - Get positions from bull_pen_positions
       - Get prices from market_data
       - totalValue = cash + positionsValue
    ↓
    2. Calculate P&L
       - pnlAbs = totalValue - startingCash
       - pnlPct = (pnlAbs / startingCash) * 100
    ↓
    3. Get room stars
       - SELECT SUM(stars_delta) FROM user_star_events
         WHERE user_id = ? AND bull_pen_id = 1
       - roomStars = sum (or 0 if null)
    ↓
    4. Get last trade timestamp
       - SELECT MAX(placed_at) FROM bull_pen_orders
         WHERE user_id = ? AND bull_pen_id = 1
    ↓
    Store in array: {
      userId, portfolioValue, pnlAbs, pnlPct,
      roomStars, lastTradeAt
    }
    ↓
Normalize metrics:
    ↓
    For each metric (return%, pnl, stars):
      - Find min and max across all users
      - If max == min: normalized = 0.5
      - Else: normalized = (value - min) / (max - min)
    ↓
Compute composite scores:
    ↓
    For each user:
      score = 0.5 * normReturn
            + 0.2 * normPnl
            + 0.3 * normStars
    ↓
Apply tie-breakers:
    ↓
    Sort by: score DESC
           → return% DESC
           → pnl DESC
           → stars DESC
           → tradeCount DESC
           → accountAge ASC
    ↓
Assign ranks (1, 2, 3, ...)
    ↓
INSERT INTO leaderboard_snapshots (
  bull_pen_id: 1,
  user_id: ?,
  snapshot_at: NOW(),
  rank: ?,
  portfolio_value: ?,
  pnl_abs: ?,
  pnl_pct: ?,
  stars: ?,
  score: ?,
  last_trade_at: ?
)
    ↓
✅ Snapshot created with stars and scores
```

---

## 4. Leaderboard API Response

```
GET /api/bull-pens/1/leaderboard
    ↓
leaderboardController.getLeaderboard(bullPenId: 1)
    ↓
Get bull pen info
    ↓
Get all active members
    ↓
For each member:
    ↓
    1. Calculate portfolio value (same as snapshot)
    2. Calculate P&L (same as snapshot)
    3. Get room stars (same as snapshot)
    4. Get last trade timestamp
    ↓
Normalize metrics
    ↓
Compute composite scores
    ↓
Apply tie-breakers
    ↓
Assign ranks
    ↓
Return JSON:
{
  "bullPenId": 1,
  "bullPenName": "Tech Stocks",
  "startingCash": 1000,
  "leaderboard": [
    {
      "userId": 1,
      "userName": "Alice",
      "rank": 1,
      "portfolioValue": 1500,
      "cash": 500,
      "positionsValue": 1000,
      "pnlAbs": 500,
      "pnlPct": 50,
      "stars": 100,
      "score": 0.85,
      "lastTradeAt": "2025-11-27T10:30:00Z"
    },
    ...
  ]
}
    ↓
✅ Response includes stars and scores
```

---

## 5. Admin Grant Stars Flow

```
Admin clicks "Grant Stars" button
    ↓
POST /api/admin/users/4/grant-stars
{
  "stars": 50,
  "reason": "Referral bonus",
  "reason_code": "admin_grant"
}
    ↓
adminController.grantStars()
    ↓
Validate:
  - User exists
  - Stars > 0
  - Reason provided
    ↓
achievementsService.awardStars(
  userId: 4,
  reasonCode: 'admin_grant',
  starsDelta: 50,
  context: { adminId: 1, reason: 'Referral bonus' }
)
    ↓
Check idempotency:
  SELECT * FROM user_star_events
  WHERE user_id = 4
    AND reason_code = 'admin_grant'
    AND meta->>'$.adminId' = '1'
    AND meta->>'$.reason' = 'Referral bonus'
    ↓
    If exists: SKIP
    If not exists: CONTINUE
    ↓
INSERT INTO user_star_events (
  user_id: 4,
  reason_code: 'admin_grant',
  source: 'admin',
  stars_delta: 50,
  meta: { adminId: 1, reason: 'Referral bonus' }
)
    ↓
Log to user_audit_log:
  event_type: 'admin_grant_stars'
  event_category: 'admin'
  description: 'Admin granted 50 stars'
  new_values: { stars_awarded: 50, reason: 'Referral bonus' }
    ↓
Return response:
{
  "success": true,
  "user_id": 4,
  "stars_awarded": 50,
  "total_lifetime_stars": 560
}
    ↓
✅ Stars granted and logged
```

---

## 6. Aggregation Queries

### Get Lifetime Stars
```sql
SELECT SUM(stars_delta) as lifetime_stars
FROM user_star_events
WHERE user_id = 4
  AND deleted_at IS NULL;
```

### Get Room Stars
```sql
SELECT SUM(stars_delta) as room_stars
FROM user_star_events
WHERE user_id = 4
  AND bull_pen_id = 1
  AND deleted_at IS NULL;
```

### Get Season Stars
```sql
SELECT SUM(stars_delta) as season_stars
FROM user_star_events
WHERE user_id = 4
  AND season_id = 1
  AND deleted_at IS NULL;
```

### Get Star Awards History
```sql
SELECT reason_code, stars_delta, created_at, meta
FROM user_star_events
WHERE user_id = 4
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```


