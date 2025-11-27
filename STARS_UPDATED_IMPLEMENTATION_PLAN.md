# Stars System - Updated Implementation Plan (v2)

## 📋 UPDATED TIMELINE

### Phase 1: Database Foundation (4 hours - +1 hour)

#### 1.1 Create Migration File
- Create `user_star_events` table (append-only log)
- Create `achievement_rules` table (configurable rules)
- **NEW**: Create `season_user_stats` table (per-user, per-season aggregates)
- Add `stars` and `score` columns to `leaderboard_snapshots`
- Add `season_id` to `bull_pens`
- Create rollback script

#### 1.2 Load Initial Achievement Rules
- Insert 9 initial rules (existing)
- **NEW**: Add activity_streak rules (1, 7, 30 day streaks)
- **NEW**: Add campaign rule template
- Make script idempotent

**Time**: 4 hours (was 3)

---

### Phase 2: Core Services (15 hours - +3 hours)

#### 2.1 AchievementsService (Existing)
- awardStars(userId, reasonCode, starsDelta, context)
- checkIdempotency(userId, reasonCode, bullPenId, seasonId)
- evaluateRule(rule, context)
- getAggregatedStars(userId, scope)
- logStarEvent(userId, reasonCode, starsDelta, meta)

#### 2.2 RuleEvaluator (Existing)
- evaluateFirstRoomJoin(userId, bullPenId)
- evaluateRoomFirstPlace(userId, bullPenId, rank)
- evaluateThreeStraightWins(userId)
- evaluateRoomsPlayedMilestone(userId, totalRooms)
- evaluateSeasonTopPercentile(userId, seasonId, percentile)
- **NEW**: evaluateActivityStreak(userId, days)
- **NEW**: evaluateCampaignAction(userId, campaignCode, action)

#### 2.3 RankingService (Existing)
- normalizeMetric(value, min, max)
- computeCompositeScore(normReturn, normPnl, normStars, weights)
- calculateRoomScores(bullPenId)
- applyTieBreakers(leaderboard)

#### 2.4 SeasonRankingService (NEW)
- aggregateSeasonStats(seasonId)
- normalizeSeasonMetrics(seasonId)
- computeSeasonScores(seasonId)
- updateSeasonUserStats(seasonId)
- getSeasonLeaderboard(seasonId)

**Time**: 15 hours (was 12)

---

### Phase 3: Integration (8 hours - +2 hours)

#### 3.1 Room Join Flow
- Call achievementsService.awardStars() for first_room_join

#### 3.2 Room Settlement Flow
- Award room_first_place, three_straight_wins
- **NEW**: Check activity streak achievements

#### 3.3 Leaderboard Snapshot Creation
- Get room_stars for each user
- Normalize stars alongside pnl_abs and pnl_pct
- Compute composite score
- Store stars and score in leaderboard_snapshots
- Apply tie-breakers

#### 3.4 Season-End Event (NEW)
- Trigger season.ended event
- Call SeasonRankingService.aggregateSeasonStats()
- Compute season-level scores
- Update season_user_stats
- Award season_top_10_percent, season_top_100 achievements

#### 3.5 Leaderboard API Response
- Include stars and score in response
- Add season-level leaderboard endpoint

**Time**: 8 hours (was 6)

---

### Phase 4: Admin Endpoints (3 hours - No change)

#### 4.1 Star Grant Endpoint
- POST /api/admin/users/:id/grant-stars

#### 4.2 Achievement Rules Management
- GET /api/admin/achievement-rules
- POST /api/admin/achievement-rules
- PATCH /api/admin/achievement-rules/:id
- DELETE /api/admin/achievement-rules/:id

**Time**: 3 hours

---

### Phase 5: Testing & Validation (11 hours - +2 hours)

#### 5.1 Unit Tests
- AchievementsService tests
- RuleEvaluator tests (including new activity streak)
- RankingService tests
- **NEW**: SeasonRankingService tests

#### 5.2 Integration Tests
- Room join → star award
- Room settlement → multiple star awards
- **NEW**: Season-end → season stats update
- **NEW**: Season-level ranking computation
- Leaderboard snapshot with stars
- Admin grant endpoint
- Idempotency with duplicate requests

#### 5.3 Manual Testing
- Create user, join room → verify first_room_join star
- Finish room in 1st place → verify room_first_place star
- Win 3 rooms in a row → verify three_straight_wins star
- **NEW**: Complete season → verify season_user_stats updated
- **NEW**: Check season leaderboard → verify scores displayed
- View leaderboard → verify stars and scores displayed
- Admin grant stars → verify stars added
- Verify no duplicate stars on retry
- Test edge cases

**Time**: 11 hours (was 9)

---

### Phase 6: Documentation & Deployment (3 hours - No change)

#### 6.1 Documentation
- Update DATABASE_SCHEMA.md
- Update README.md
- Create STARS_SYSTEM_GUIDE.md
- Update OpenAPI spec
- Create STARS_IMPLEMENTATION_NOTES.md

#### 6.2 Deployment
- Run migration on staging
- Load achievement rules on staging
- Run integration tests on staging
- Manual testing on staging
- Deploy to production
- Verify migration success
- Monitor logs for errors

**Time**: 3 hours

---

## 📊 UPDATED TIMELINE SUMMARY

| Phase | Focus | Hours | Change |
|-------|-------|-------|--------|
| 1 | Database foundation | 4 | +1 |
| 2 | Core services | 15 | +3 |
| 3 | Integration | 8 | +2 |
| 4 | Admin endpoints | 3 | - |
| 5 | Testing | 11 | +2 |
| 6 | Docs & deployment | 3 | - |

**Total: 44 hours (was 36 hours)**  
**Increase: +8 hours for season-level ranking and activity streaks**

---

## 🔄 KEY CHANGES FROM ORIGINAL PLAN

1. **season_user_stats table** - New database table for season-level aggregates
2. **SeasonRankingService** - New service for season-level scoring
3. **Season-end event handling** - New integration point
4. **Activity streak evaluation** - New rule evaluator
5. **Campaign achievement support** - New rule type
6. **Season leaderboard endpoint** - New API endpoint

---

## ⚠️ CRITICAL BLOCKERS (UNCHANGED)

1. **Season system must exist** - Need seasons table with id, name, start_date, end_date, status
2. **Season-end event system** - Need way to trigger season.ended event
3. **Activity tracking** - Need to track user login/trade activity for streaks

---

## ✅ READY FOR IMPLEMENTATION

All changes from updated spec have been incorporated:
- [x] season_user_stats table added
- [x] Season-level ranking flow defined
- [x] Activity streak support added
- [x] Campaign achievement support added
- [x] Updated timeline (44 hours)
- [x] Updated task list (see STARS_UPDATED_TASK_CHECKLIST.md)


