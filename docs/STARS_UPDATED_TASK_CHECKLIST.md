# Stars System - Updated Task Checklist (v2)

## PHASE 1: DATABASE FOUNDATION (4 hours)

### 1.1 Create Migration File
- [ ] Create `backend/migrations/add-stars-system.sql`
- [ ] Create `user_star_events` table with indexes
- [ ] Create `achievement_rules` table with indexes
- [ ] **NEW**: Create `season_user_stats` table with indexes
- [ ] Add `stars INT DEFAULT 0` to leaderboard_snapshots
- [ ] Add `score DECIMAL(10,4) DEFAULT 0` to leaderboard_snapshots
- [ ] Add `season_id INT NULL` to bull_pens
- [ ] Create rollback script

### 1.2 Load Initial Achievement Rules
- [ ] Create `backend/scripts/load-achievement-rules.sql`
- [ ] Insert 9 initial rules (existing)
- [ ] **NEW**: Insert activity_streak_1 rule (1 day)
- [ ] **NEW**: Insert activity_streak_7 rule (7 days)
- [ ] **NEW**: Insert activity_streak_30 rule (30 days)
- [ ] **NEW**: Insert campaign rule template
- [ ] Make script idempotent

### 1.3 Testing
- [ ] Run migration on local database
- [ ] Verify all tables created correctly
- [ ] Verify indexes created
- [ ] Verify unique constraints work
- [ ] Load achievement rules
- [ ] Verify rules loaded correctly

---

## PHASE 2: CORE SERVICES (15 hours)

### 2.1 AchievementsService (Existing)
- [ ] Create `backend/src/services/achievementsService.js`
- [ ] Implement awardStars()
- [ ] Implement checkIdempotency()
- [ ] Implement evaluateRule()
- [ ] Implement getAggregatedStars()
- [ ] Implement logStarEvent()

### 2.2 RuleEvaluator (Existing)
- [ ] Create `backend/src/services/ruleEvaluator.js`
- [ ] Implement evaluateFirstRoomJoin()
- [ ] Implement evaluateRoomFirstPlace()
- [ ] Implement evaluateThreeStraightWins()
- [ ] Implement evaluateRoomsPlayedMilestone()
- [ ] Implement evaluateSeasonTopPercentile()
- [ ] **NEW**: Implement evaluateActivityStreak()
- [ ] **NEW**: Implement evaluateCampaignAction()

### 2.3 RankingService (Existing)
- [ ] Create `backend/src/services/rankingService.js`
- [ ] Implement normalizeMetric()
- [ ] Implement computeCompositeScore()
- [ ] Implement calculateRoomScores()
- [ ] Implement applyTieBreakers()

### 2.4 SeasonRankingService (NEW)
- [ ] Create `backend/src/services/seasonRankingService.js`
- [ ] Implement aggregateSeasonStats()
- [ ] Implement normalizeSeasonMetrics()
- [ ] Implement computeSeasonScores()
- [ ] Implement updateSeasonUserStats()
- [ ] Implement getSeasonLeaderboard()

---

## PHASE 3: INTEGRATION (8 hours)

### 3.1 Room Join Flow
- [ ] Update `bullPenMembershipsController.joinBullPen()`
- [ ] Call achievementsService.awardStars() for first_room_join

### 3.2 Room Settlement Flow
- [ ] Update `settlementService.settleRoom()`
- [ ] Award room_first_place achievement
- [ ] Award three_straight_wins achievement
- [ ] **NEW**: Check activity streak achievements

### 3.3 Leaderboard Snapshot Creation
- [ ] Update `jobs/index.js` - createLeaderboardSnapshot()
- [ ] Get room_stars for each user
- [ ] Normalize stars alongside pnl_abs and pnl_pct
- [ ] Compute composite score
- [ ] Store stars and score in leaderboard_snapshots
- [ ] Apply tie-breakers before assigning ranks

### 3.4 Season-End Event (NEW)
- [ ] Create season-end event handler
- [ ] Call seasonRankingService.aggregateSeasonStats()
- [ ] Compute season-level scores
- [ ] Update season_user_stats
- [ ] Award season_top_10_percent achievements
- [ ] Award season_top_100 achievements

### 3.5 Leaderboard API Response
- [ ] Update `leaderboardController.getLeaderboard()`
- [ ] Include `stars` in response
- [ ] Include `score` in response
- [ ] Sort by score with tie-breakers
- [ ] **NEW**: Add season leaderboard endpoint
- [ ] Update OpenAPI spec

---

## PHASE 4: ADMIN ENDPOINTS (3 hours)

### 4.1 Star Grant Endpoint
- [ ] Add POST `/api/admin/users/:id/grant-stars`
- [ ] Validate request
- [ ] Call achievementsService.awardStars()
- [ ] Return success response

### 4.2 Achievement Rules Management
- [ ] Add GET `/api/admin/achievement-rules`
- [ ] Add POST `/api/admin/achievement-rules`
- [ ] Add PATCH `/api/admin/achievement-rules/:id`
- [ ] Add DELETE `/api/admin/achievement-rules/:id`
- [ ] Add validation for each endpoint
- [ ] Update OpenAPI spec

---

## PHASE 5: TESTING & VALIDATION (11 hours)

### 5.1 Unit Tests
- [ ] Create `backend/test/achievementsService.test.js`
- [ ] Create `backend/test/ruleEvaluator.test.js`
- [ ] Create `backend/test/rankingService.test.js`
- [ ] **NEW**: Create `backend/test/seasonRankingService.test.js`
- [ ] Test all evaluators including activity streak
- [ ] Test normalization edge cases
- [ ] Test composite score calculation
- [ ] Test tie-breaking logic

### 5.2 Integration Tests
- [ ] Create `backend/test/stars-integration.test.js`
- [ ] Test room join → star award
- [ ] Test room settlement → multiple star awards
- [ ] **NEW**: Test season-end → season stats update
- [ ] **NEW**: Test season-level ranking computation
- [ ] Test leaderboard snapshot with stars
- [ ] Test admin grant endpoint
- [ ] Test idempotency with duplicate requests

### 5.3 Manual Testing
- [ ] User joins room → verify first_room_join star
- [ ] User finishes 1st place → verify room_first_place star
- [ ] User wins 3 rooms in a row → verify three_straight_wins star
- [ ] **NEW**: Season ends → verify season_user_stats updated
- [ ] **NEW**: Check season leaderboard → verify scores displayed
- [ ] View room leaderboard → verify stars and scores
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

## TOTAL CHECKLIST ITEMS: 95 (was 87)

**Estimated Time**: 44 hours (was 36 hours)

---

## Sign-Off

- [ ] Product team approves updated analysis
- [ ] Technical team approves updated implementation plan
- [ ] All open questions clarified
- [ ] Season system requirements confirmed
- [ ] Activity streak requirements confirmed
- [ ] Campaign achievement requirements confirmed
- [ ] Ready to begin Phase 1


