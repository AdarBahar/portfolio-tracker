# Stars System - Quick Reference Guide

## 📌 Key Concepts

| Concept | Definition | Example |
|---------|-----------|---------|
| **Star Event** | Single reason why user earned stars | "Won room in 1st place" |
| **Achievement Rule** | Condition + reward pair | "Rank 1st → +100 stars" |
| **Idempotency** | Same rule + context = same award (no duplicates) | User can't get +10 stars twice for first room |
| **Aggregation** | Sum of stars in a scope | Lifetime stars = sum of all star events |
| **Normalization** | Scale metric to [0,1] range | (value - min) / (max - min) |
| **Composite Score** | Weighted sum of normalized metrics | 0.5×return% + 0.2×P&L + 0.3×stars |

---

## 🗄️ Database Schema

### user_star_events (NEW)
```sql
id, user_id, bull_pen_id, season_id, source, reason_code, 
stars_delta, meta, deleted_at, created_at
```
**Purpose**: Append-only log of all star awards  
**Unique**: (user_id, reason_code, bull_pen_id, season_id)

### achievement_rules (NEW)
```sql
id, code, name, description, category, source, stars_reward,
is_repeatable, max_times, scope_type, is_active, conditions_json,
ui_badge_code, created_at, updated_at, deleted_at
```
**Purpose**: Configurable achievement rules  
**Unique**: code

### leaderboard_snapshots (MODIFIED)
```sql
-- ADD COLUMNS:
stars INT DEFAULT 0
score DECIMAL(10,4) DEFAULT 0
```

---

## 🎯 Initial Achievements (9 Total)

| Code | Name | Stars | Repeatable | Scope | Trigger |
|------|------|-------|-----------|-------|---------|
| `first_room_join` | First Room Join | 10 | No | Lifetime | Room join |
| `room_first_place` | Room First Place | 100 | Yes | Room | Settlement |
| `three_straight_wins` | 3 Straight Wins | 40 | Yes | Room | Settlement |
| `rooms_played_10` | 10 Rooms Played | 20 | No | Lifetime | Milestone |
| `rooms_played_50` | 50 Rooms Played | 60 | No | Lifetime | Milestone |
| `rooms_played_100` | 100 Rooms Played | 150 | No | Lifetime | Milestone |
| `season_top_10_percent` | Season Top 10% | 200 | Yes | Season | Season end |
| `season_top_100` | Season Top 100 | 300 | Yes | Season | Season end |
| `admin_grant` | Admin Grant | Variable | Yes | Any | Manual |

---

## 📊 Composite Score Formula

```
score = w_return × norm_return_pct
       + w_pnl × norm_pnl
       + w_stars × norm_stars

Default weights:
  w_return = 0.5 (performance efficiency)
  w_pnl = 0.2 (absolute profit/size)
  w_stars = 0.3 (engagement/achievements)
```

---

## 🔗 Integration Points

| Component | Change | Impact |
|-----------|--------|--------|
| `bullPenMembershipsController.joinBullPen()` | Call `achievementsService.awardStars()` | Award `first_room_join` |
| `settlementService.settleRoom()` | Call `achievementsService.awardStars()` | Award `room_first_place`, `three_straight_wins` |
| `jobs/index.js.createLeaderboardSnapshot()` | Call `rankingService.calculateRoomScores()` | Compute composite scores |
| `leaderboardController.getLeaderboard()` | Include `stars` and `score` in response | Display to users |
| `adminRoutes` | Add `POST /api/admin/users/:id/grant-stars` | Manual star grants |

---

## 🚀 Implementation Phases

### Phase 1: Database (3 hours)
- Create `user_star_events` table
- Create `achievement_rules` table
- Add columns to `leaderboard_snapshots`
- Load initial achievement rules

### Phase 2: Services (12 hours)
- Create `AchievementsService`
- Create `RuleEvaluator`
- Create `RankingService`

### Phase 3: Integration (6 hours)
- Update room join flow
- Update room settlement flow
- Update leaderboard snapshot creation
- Update leaderboard API response

### Phase 4: Admin (3 hours)
- Create admin star grant endpoint
- Create achievement rules management endpoints

### Phase 5: Testing (9 hours)
- Unit tests
- Integration tests
- Manual testing

### Phase 6: Docs & Deployment (3 hours)
- Update documentation
- Deploy to production

**Total: 36 hours (4.5 days)**

---

## ⚠️ Critical Blockers

1. **Season System Not Implemented**
   - Spec references seasons but no seasons table exists
   - **Action**: Create seasons table first OR defer seasonal achievements to Phase 2

2. **Leaderboard Ranking Overhaul Needed**
   - Current code sorts by portfolio_value only
   - **Action**: Implement composite scoring service

3. **No Event-Driven Architecture**
   - Spec requires event-driven but no event system exists
   - **Action**: Use direct service calls initially

4. **Idempotency Key Design Flaw**
   - NULL values in unique constraints allow duplicates
   - **Action**: Use COALESCE in unique constraint

5. **Leaderboard Schema Incomplete**
   - Missing `stars` and `score` columns
   - **Action**: Add columns to leaderboard_snapshots

---

## 📋 Pre-Implementation Checklist

- [ ] Clarify season system requirements
- [ ] Confirm achievement thresholds
- [ ] Confirm weight values (0.5, 0.2, 0.3)
- [ ] Confirm tie-breaker order
- [ ] Decide on retroactive backfill
- [ ] Define notification requirements
- [ ] Clarify admin grant workflow

---

## 🔍 Key Queries

### Get Lifetime Stars
```sql
SELECT SUM(stars_delta) as lifetime_stars
FROM user_star_events
WHERE user_id = ?
  AND deleted_at IS NULL;
```

### Get Room Stars
```sql
SELECT SUM(stars_delta) as room_stars
FROM user_star_events
WHERE user_id = ?
  AND bull_pen_id = ?
  AND deleted_at IS NULL;
```

### Check Idempotency
```sql
SELECT * FROM user_star_events
WHERE user_id = ?
  AND reason_code = ?
  AND COALESCE(bull_pen_id, 0) = COALESCE(?, 0)
  AND COALESCE(season_id, 0) = COALESCE(?, 0);
```

---

## 📚 Related Documents

- `STARS_SYSTEM_ANALYSIS.md` - Detailed analysis
- `STARS_IMPLEMENTATION_PLAN.md` - Step-by-step roadmap
- `STARS_OPEN_QUESTIONS.md` - Blockers and clarifications
- `STARS_TASK_CHECKLIST.md` - 87 actionable tasks
- `STARS_DATA_FLOW.md` - Visual data flows

---

## 🎓 Learning Resources

### Normalization
- Min-max normalization: (value - min) / (max - min)
- Handles edge case: if max == min, return 0.5

### Composite Scoring
- Weighted sum of normalized metrics
- Allows balancing multiple objectives
- Enables tie-breaking with secondary metrics

### Idempotency
- Same input → same output (no side effects)
- Prevents duplicate star awards
- Use unique constraints + application-level checks

### Event-Driven Architecture
- Decouples components
- Enables extensibility
- Can use pub/sub or direct service calls


