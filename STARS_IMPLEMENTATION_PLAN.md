# Stars System - Detailed Implementation Plan

## Phase 1: Database Foundation

### 1.1 Create Migration File
**File**: `backend/migrations/add-stars-system.sql`

Tasks:
- [ ] Create `user_star_events` table with proper indexes
- [ ] Create `achievement_rules` table with JSON support
- [ ] Add `stars` INT DEFAULT 0 to `leaderboard_snapshots`
- [ ] Add `score` DECIMAL(10,4) DEFAULT 0 to `leaderboard_snapshots`
- [ ] Add `season_id` INT NULL to `bull_pens` (for future use)
- [ ] Create indexes on all foreign keys and frequently queried columns
- [ ] Add rollback script

**Estimated Time**: 2 hours

### 1.2 Load Initial Achievement Rules
**File**: `backend/scripts/load-achievement-rules.sql`

Tasks:
- [ ] Insert 9 initial achievement rules (see spec section 3)
- [ ] Set all to `is_active = 1`
- [ ] Define conditions_json for each rule
- [ ] Create idempotent script (use INSERT IGNORE or ON DUPLICATE KEY)

**Estimated Time**: 1 hour

---

## Phase 2: Core Services

### 2.1 Create AchievementsService
**File**: `backend/src/services/achievementsService.js`

Methods:
- [ ] `awardStars(userId, reasonCode, starsDelta, context)` - Main award method
- [ ] `checkIdempotency(userId, reasonCode, bullPenId, seasonId)` - Prevent duplicates
- [ ] `evaluateRule(rule, context)` - Evaluate if rule conditions met
- [ ] `getAggregatedStars(userId, scope)` - Get total stars (room/season/lifetime)
- [ ] `logStarEvent(userId, reasonCode, starsDelta, meta)` - Write to user_star_events

**Estimated Time**: 4 hours

### 2.2 Create RuleEvaluator
**File**: `backend/src/services/ruleEvaluator.js`

Methods:
- [ ] `evaluateFirstRoomJoin(userId, bullPenId)` - Check if first room
- [ ] `evaluateRoomFirstPlace(userId, bullPenId, rank)` - Check if rank = 1
- [ ] `evaluateThreeStraightWins(userId)` - Check win streak
- [ ] `evaluateRoomsPlayedMilestone(userId, totalRooms)` - Check milestone
- [ ] `evaluateSeasonTopPercentile(userId, seasonId, percentile)` - Check ranking
- [ ] `createRuleContext(event)` - Build context from domain event

**Estimated Time**: 5 hours

### 2.3 Create Normalization & Scoring Service
**File**: `backend/src/services/rankingService.js`

Methods:
- [ ] `normalizeMetric(value, min, max)` - Min-max normalization
- [ ] `computeCompositeScore(normReturn, normPnl, normStars, weights)` - Weighted sum
- [ ] `calculateRoomScores(bullPenId)` - Compute scores for all room members
- [ ] `applyTieBreakers(leaderboard)` - Sort with tie-breaking logic
- [ ] `getDefaultWeights()` - Return w_return=0.5, w_pnl=0.2, w_stars=0.3

**Estimated Time**: 3 hours

---

## Phase 3: Integration Points

### 3.1 Update Room Join Flow
**File**: `backend/src/controllers/bullPenMembershipsController.js`

Changes:
- [ ] After successful join, call `achievementsService.awardStars()` for `first_room_join`
- [ ] Pass context: `{ userId, bullPenId, eventType: 'room_joined' }`
- [ ] Handle errors gracefully (star award failure shouldn't fail join)

**Estimated Time**: 1 hour

### 3.2 Update Room Settlement Flow
**File**: `backend/src/services/settlementService.js`

Changes:
- [ ] After settlement, evaluate `room_first_place` achievement
- [ ] Evaluate `three_straight_wins` achievement
- [ ] Call `achievementsService.awardStars()` for each qualified user
- [ ] Log all star awards to audit trail

**Estimated Time**: 2 hours

### 3.3 Update Leaderboard Snapshot Creation
**File**: `backend/src/jobs/index.js` - `createLeaderboardSnapshot()`

Changes:
- [ ] Get room_stars for each user from `user_star_events`
- [ ] Normalize stars alongside pnl_abs and pnl_pct
- [ ] Compute composite score using rankingService
- [ ] Store stars and score in leaderboard_snapshots
- [ ] Apply tie-breakers before assigning ranks

**Estimated Time**: 2 hours

### 3.4 Update Leaderboard API Response
**File**: `backend/src/controllers/leaderboardController.js`

Changes:
- [ ] Include `stars` in leaderboard response
- [ ] Include `score` in leaderboard response
- [ ] Update response schema in OpenAPI spec
- [ ] Add sorting by score (with tie-breakers)

**Estimated Time**: 1 hour

---

## Phase 4: Admin Endpoints

### 4.1 Create Admin Star Grant Endpoint
**File**: `backend/src/routes/adminRoutes.js`

Endpoint: `POST /api/admin/users/:id/grant-stars`

Request:
```json
{
  "stars": 100,
  "reason": "Manual grant",
  "reason_code": "admin_grant"
}
```

Response:
```json
{
  "success": true,
  "user_id": 4,
  "stars_awarded": 100,
  "total_lifetime_stars": 500
}
```

**Estimated Time**: 1 hour

### 4.2 Create Achievement Rules Management Endpoint
**File**: `backend/src/routes/adminRoutes.js`

Endpoints:
- [ ] `GET /api/admin/achievement-rules` - List all rules
- [ ] `POST /api/admin/achievement-rules` - Create new rule
- [ ] `PATCH /api/admin/achievement-rules/:id` - Update rule
- [ ] `DELETE /api/admin/achievement-rules/:id` - Soft delete rule

**Estimated Time**: 2 hours

---

## Phase 5: Testing & Validation

### 5.1 Unit Tests
**File**: `backend/test/achievementsService.test.js`

Tests:
- [ ] Test star award idempotency
- [ ] Test rule evaluation for each achievement type
- [ ] Test normalization edge cases (all zeros, single value)
- [ ] Test composite score calculation
- [ ] Test tie-breaking logic

**Estimated Time**: 4 hours

### 5.2 Integration Tests
**File**: `backend/test/stars-integration.test.js`

Tests:
- [ ] Test full room join → star award flow
- [ ] Test room settlement → multiple star awards
- [ ] Test leaderboard snapshot with stars
- [ ] Test admin grant endpoint
- [ ] Test idempotency with duplicate requests

**Estimated Time**: 3 hours

### 5.3 Manual Testing Checklist
- [ ] Create new user, join room → verify `first_room_join` star awarded
- [ ] Finish room in 1st place → verify `room_first_place` star awarded
- [ ] Win 3 rooms in a row → verify `three_straight_wins` star awarded
- [ ] View leaderboard → verify stars and scores displayed
- [ ] Admin grant stars → verify stars added and audit logged
- [ ] Verify no duplicate stars on retry

**Estimated Time**: 2 hours

---

## Phase 6: Documentation & Deployment

### 6.1 Update Documentation
- [ ] Update `docs/DATABASE_SCHEMA.md` with new tables
- [ ] Update `docs/README.md` with stars system overview
- [ ] Create `docs/STARS_SYSTEM_GUIDE.md` with implementation details
- [ ] Update OpenAPI spec with new endpoints and schemas
- [ ] Create `backend/STARS_IMPLEMENTATION_NOTES.md` for developers

**Estimated Time**: 2 hours

### 6.2 Deployment Checklist
- [ ] Run migration on staging database
- [ ] Load initial achievement rules
- [ ] Run integration tests against staging
- [ ] Manual testing on staging
- [ ] Deploy to production
- [ ] Verify migration success
- [ ] Monitor logs for errors
- [ ] Backfill historical stars (optional)

**Estimated Time**: 1 hour

---

## Timeline Summary

| Phase | Tasks | Est. Hours | Cumulative |
|-------|-------|-----------|-----------|
| 1: Database | 2 tasks | 3 | 3 |
| 2: Services | 3 tasks | 12 | 15 |
| 3: Integration | 4 tasks | 6 | 21 |
| 4: Admin | 2 tasks | 3 | 24 |
| 5: Testing | 3 tasks | 9 | 33 |
| 6: Docs | 2 tasks | 3 | 36 |

**Total Estimated Time**: 36 hours (4.5 days of focused development)

---

## Dependencies & Blockers

### Must Complete First
1. ✅ Database schema finalized
2. ✅ Achievement rules defined
3. ⚠️ Season system (if implementing seasonal achievements)

### Can Proceed In Parallel
- Frontend UI for stars display
- Analytics dashboard
- Notification system

### Future Dependencies
- Season system (for seasonal achievements)
- Streak tracking optimization
- Star marketplace/redemption

---

## Rollback Plan

If issues discovered in production:

1. **Immediate**: Disable all achievement rule evaluations
   - Set all rules to `is_active = 0`
   - Prevents new star awards

2. **Short-term**: Revert leaderboard to portfolio_value sorting
   - Temporarily ignore `score` column
   - Use existing ranking logic

3. **Full Rollback**: Run migration rollback script
   - Removes `user_star_events` and `achievement_rules` tables
   - Removes `stars` and `score` columns from `leaderboard_snapshots`
   - Restores previous schema

**Estimated Rollback Time**: 15 minutes


