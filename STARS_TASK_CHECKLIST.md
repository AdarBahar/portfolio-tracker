# Stars System - Detailed Task Checklist

## PRE-IMPLEMENTATION CHECKLIST

### Product Clarifications
- [ ] Confirm season system requirements (or defer seasonal achievements to Phase 2)
- [ ] Define exact thresholds for each achievement (what is a "win"?)
- [ ] Confirm weight values (0.5, 0.2, 0.3 or different?)
- [ ] Confirm tie-breaker order
- [ ] Decide on retroactive star backfill
- [ ] Define notification requirements
- [ ] Clarify admin grant workflow

### Technical Preparation
- [ ] Create feature branch: `feature/stars-system`
- [ ] Set up development database
- [ ] Review existing leaderboard code
- [ ] Review existing settlement code
- [ ] Plan testing strategy

---

## PHASE 1: DATABASE FOUNDATION (3 hours)

### 1.1 Create Migration File
- [ ] Create `backend/migrations/add-stars-system.sql`
- [ ] Create `user_star_events` table
  - [ ] id, user_id, bull_pen_id, season_id, source, reason_code, stars_delta, meta, deleted_at, created_at
  - [ ] Foreign keys to users, bull_pens
  - [ ] Unique constraint on (user_id, reason_code, bull_pen_id, season_id) with COALESCE
  - [ ] Indexes on user_id, bull_pen_id, season_id
- [ ] Create `achievement_rules` table
  - [ ] id, code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code, created_at, updated_at, deleted_at
  - [ ] Unique constraint on code
  - [ ] Index on (is_active, deleted_at)
- [ ] Alter `leaderboard_snapshots`
  - [ ] Add `stars INT DEFAULT 0`
  - [ ] Add `score DECIMAL(10,4) DEFAULT 0`
- [ ] Alter `bull_pens`
  - [ ] Add `season_id INT NULL` (for future use)
- [ ] Create rollback script

### 1.2 Load Initial Achievement Rules
- [ ] Create `backend/scripts/load-achievement-rules.sql`
- [ ] Insert 9 initial rules:
  - [ ] three_straight_wins (40 stars, repeatable)
  - [ ] room_first_place (100 stars, repeatable)
  - [ ] first_room_join (10 stars, one-time)
  - [ ] season_top_10_percent (200 stars, repeatable)
  - [ ] season_top_100 (300 stars, repeatable)
  - [ ] rooms_played_milestone_10 (20 stars, one-time)
  - [ ] rooms_played_milestone_50 (60 stars, one-time)
  - [ ] rooms_played_milestone_100 (150 stars, one-time)
  - [ ] admin_grant (variable, repeatable)
- [ ] Set all to is_active = 1
- [ ] Define conditions_json for each rule
- [ ] Make script idempotent

### 1.3 Testing
- [ ] Run migration on local database
- [ ] Verify tables created correctly
- [ ] Verify indexes created
- [ ] Verify unique constraints work
- [ ] Load achievement rules
- [ ] Verify rules loaded correctly

---

## PHASE 2: CORE SERVICES (12 hours)

### 2.1 Create AchievementsService
- [ ] Create `backend/src/services/achievementsService.js`
- [ ] Implement `awardStars(userId, reasonCode, starsDelta, context)`
  - [ ] Check idempotency
  - [ ] Insert into user_star_events
  - [ ] Log to audit trail
  - [ ] Return success/error
- [ ] Implement `checkIdempotency(userId, reasonCode, bullPenId, seasonId)`
  - [ ] Query user_star_events for existing award
  - [ ] Return true if exists, false if new
- [ ] Implement `evaluateRule(rule, context)`
  - [ ] Parse conditions_json
  - [ ] Call appropriate evaluator
  - [ ] Return true/false
- [ ] Implement `getAggregatedStars(userId, scope)`
  - [ ] scope = 'lifetime' | 'room' | 'season'
  - [ ] Query user_star_events with appropriate filters
  - [ ] Return total stars
- [ ] Implement `logStarEvent(userId, reasonCode, starsDelta, meta)`
  - [ ] Insert into user_star_events
  - [ ] Handle errors gracefully

### 2.2 Create RuleEvaluator
- [ ] Create `backend/src/services/ruleEvaluator.js`
- [ ] Implement `evaluateFirstRoomJoin(userId, bullPenId)`
  - [ ] Check if user has any other room memberships
  - [ ] Return true if first room
- [ ] Implement `evaluateRoomFirstPlace(userId, bullPenId, rank)`
  - [ ] Check if rank === 1
  - [ ] Return true if first place
- [ ] Implement `evaluateThreeStraightWins(userId)`
  - [ ] Query last 3 completed rooms for user
  - [ ] Check if all 3 have positive P&L or top ranking
  - [ ] Return true if all 3 are wins
- [ ] Implement `evaluateRoomsPlayedMilestone(userId, totalRooms)`
  - [ ] Check if totalRooms matches milestone (10, 50, 100)
  - [ ] Return true if milestone reached
- [ ] Implement `evaluateSeasonTopPercentile(userId, seasonId, percentile)`
  - [ ] Query season rankings
  - [ ] Calculate user's percentile
  - [ ] Return true if in top percentile
- [ ] Implement `createRuleContext(event)`
  - [ ] Build context object from domain event
  - [ ] Include userId, bullPenId, seasonId, rank, pnl, etc.

### 2.3 Create Normalization & Scoring Service
- [ ] Create `backend/src/services/rankingService.js`
- [ ] Implement `normalizeMetric(value, min, max)`
  - [ ] Handle edge case: max === min → return 0.5
  - [ ] Return (value - min) / (max - min)
- [ ] Implement `computeCompositeScore(normReturn, normPnl, normStars, weights)`
  - [ ] Return w_return*normReturn + w_pnl*normPnl + w_stars*normStars
- [ ] Implement `calculateRoomScores(bullPenId)`
  - [ ] Get all members in room
  - [ ] Get metrics for each member (return%, pnl, stars)
  - [ ] Normalize each metric
  - [ ] Compute composite score
  - [ ] Return array of {userId, score}
- [ ] Implement `applyTieBreakers(leaderboard)`
  - [ ] Sort by: score → return% → pnl → stars → trade_count → account_age
  - [ ] Return sorted leaderboard
- [ ] Implement `getDefaultWeights()`
  - [ ] Return {w_return: 0.5, w_pnl: 0.2, w_stars: 0.3}

### 2.4 Testing
- [ ] Unit test AchievementsService
- [ ] Unit test RuleEvaluator
- [ ] Unit test RankingService
- [ ] Test idempotency
- [ ] Test edge cases

---

## PHASE 3: INTEGRATION (6 hours)

### 3.1 Update Room Join Flow
- [ ] Edit `backend/src/controllers/bullPenMembershipsController.js`
- [ ] After successful join, call achievementsService.awardStars()
- [ ] Pass context: {userId, bullPenId, eventType: 'room_joined'}
- [ ] Handle errors gracefully (don't fail join if star award fails)
- [ ] Add logging

### 3.2 Update Room Settlement Flow
- [ ] Edit `backend/src/services/settlementService.js`
- [ ] After settlement, evaluate achievements
- [ ] Award `room_first_place` for rank 1
- [ ] Award `three_straight_wins` if applicable
- [ ] Log all star awards
- [ ] Handle errors gracefully

### 3.3 Update Leaderboard Snapshot Creation
- [ ] Edit `backend/src/jobs/index.js` - `createLeaderboardSnapshot()`
- [ ] Get room_stars for each user
- [ ] Normalize stars alongside pnl_abs and pnl_pct
- [ ] Compute composite score
- [ ] Store stars and score in leaderboard_snapshots
- [ ] Apply tie-breakers before assigning ranks

### 3.4 Update Leaderboard API Response
- [ ] Edit `backend/src/controllers/leaderboardController.js`
- [ ] Include `stars` in response
- [ ] Include `score` in response
- [ ] Sort by score (with tie-breakers)
- [ ] Update response schema

### 3.5 Testing
- [ ] Integration test: room join → star award
- [ ] Integration test: room settlement → star awards
- [ ] Integration test: leaderboard snapshot with stars
- [ ] Verify no duplicate stars on retry

---

## PHASE 4: ADMIN ENDPOINTS (3 hours)

### 4.1 Create Admin Star Grant Endpoint
- [ ] Edit `backend/src/routes/adminRoutes.js`
- [ ] Add POST `/api/admin/users/:id/grant-stars`
- [ ] Validate request (stars > 0, reason provided)
- [ ] Call achievementsService.awardStars()
- [ ] Return success response with new total
- [ ] Add to OpenAPI spec

### 4.2 Create Achievement Rules Management
- [ ] Add GET `/api/admin/achievement-rules` - List all rules
- [ ] Add POST `/api/admin/achievement-rules` - Create new rule
- [ ] Add PATCH `/api/admin/achievement-rules/:id` - Update rule
- [ ] Add DELETE `/api/admin/achievement-rules/:id` - Soft delete rule
- [ ] Add validation for each endpoint
- [ ] Add to OpenAPI spec

### 4.3 Testing
- [ ] Test admin grant endpoint
- [ ] Test rules management endpoints
- [ ] Verify audit logging

---

## PHASE 5: TESTING (9 hours)

### 5.1 Unit Tests
- [ ] Create `backend/test/achievementsService.test.js`
- [ ] Test star award idempotency
- [ ] Test rule evaluation for each achievement
- [ ] Test normalization edge cases
- [ ] Test composite score calculation
- [ ] Test tie-breaking logic

### 5.2 Integration Tests
- [ ] Create `backend/test/stars-integration.test.js`
- [ ] Test full room join → star award flow
- [ ] Test room settlement → multiple star awards
- [ ] Test leaderboard snapshot with stars
- [ ] Test admin grant endpoint
- [ ] Test idempotency with duplicate requests

### 5.3 Manual Testing
- [ ] Create new user, join room → verify first_room_join star
- [ ] Finish room in 1st place → verify room_first_place star
- [ ] Win 3 rooms in a row → verify three_straight_wins star
- [ ] View leaderboard → verify stars and scores displayed
- [ ] Admin grant stars → verify stars added
- [ ] Verify no duplicate stars on retry
- [ ] Test edge cases (all users same score, negative P&L, etc.)

---

## PHASE 6: DOCUMENTATION & DEPLOYMENT (3 hours)

### 6.1 Documentation
- [ ] Update `docs/DATABASE_SCHEMA.md`
- [ ] Update `docs/README.md`
- [ ] Create `docs/STARS_SYSTEM_GUIDE.md`
- [ ] Update OpenAPI spec
- [ ] Create `backend/STARS_IMPLEMENTATION_NOTES.md`

### 6.2 Deployment
- [ ] Run migration on staging
- [ ] Load achievement rules on staging
- [ ] Run integration tests on staging
- [ ] Manual testing on staging
- [ ] Deploy to production
- [ ] Verify migration success
- [ ] Monitor logs for errors
- [ ] Verify stars appearing in leaderboard

---

## TOTAL CHECKLIST ITEMS: 87

**Estimated Time**: 36 hours (4.5 days)

---

## Sign-Off

- [ ] Product team approves analysis
- [ ] Technical team approves implementation plan
- [ ] All open questions clarified
- [ ] Ready to begin Phase 1


