# Stars System - Quick Start Guide

**Status**: Phase 1 & 2 Complete ✅ | Phase 3 In Progress 🔄

---

## 🚀 Quick Setup

### 1. Run Database Migration
```bash
mysql -u root -p portfolio_tracker < backend/migrations/add-stars-system.sql
```

### 2. Load Initial Achievement Rules
```bash
mysql -u root -p portfolio_tracker < backend/scripts/load-achievement-rules.sql
```

### 3. Verify Tables Created
```sql
SHOW TABLES LIKE '%star%';
-- Should show: user_star_events, achievement_rules, season_user_stats
```

---

## 📚 Service Usage Examples

### Award Stars
```javascript
const achievementsService = require('./services/achievementsService');

// Award stars for first room join
const result = await achievementsService.awardStars(
  userId,
  'first_room_join',
  10,
  { source: 'achievement', bullPenId: null, seasonId: null }
);
```

### Evaluate Achievement
```javascript
const ruleEvaluator = require('./services/ruleEvaluator');

// Check if user qualifies for 3 straight wins
const qualifies = await ruleEvaluator.evaluateThreeStraightWins(userId);
if (qualifies) {
  await achievementsService.awardStars(userId, 'three_straight_wins', 40, {...});
}
```

### Calculate Ranking Scores
```javascript
const rankingService = require('./services/rankingService');

// Get scores for all room members
const scores = await rankingService.calculateRoomScores(bullPenId);

// Apply tie-breakers and get ranked leaderboard
const ranked = rankingService.applyTieBreakers(scores);
```

### Get Season Leaderboard
```javascript
const seasonRankingService = require('./services/seasonRankingService');

// Update season stats and get leaderboard
await seasonRankingService.updateSeasonUserStats(seasonId);
const leaderboard = await seasonRankingService.getSeasonLeaderboard(seasonId);
```

---

## 🔗 Integration Checklist

### Phase 3 Tasks
- [ ] Update `bullPenMembershipsController.joinBullPen()` to award first_room_join stars
- [ ] Update `settlementService` to evaluate and award room achievements
- [ ] Update `leaderboard job` to compute composite scores
- [ ] Create season-end event handler
- [ ] Update `leaderboardController` to include stars in response

### Phase 4 Tasks
- [ ] Create admin star grant endpoint
- [ ] Create achievement rules management endpoints

### Phase 5 Tasks
- [ ] Write unit tests for all services
- [ ] Write integration tests
- [ ] Manual testing checklist

---

## 📊 Database Schema

### user_star_events
```sql
- id (PK)
- user_id (FK)
- bull_pen_id (FK, nullable)
- season_id (nullable)
- source (achievement, prize, quest, admin_grant, campaign)
- reason_code (e.g., 'three_straight_wins')
- stars_delta (always positive)
- meta (JSON context)
- deleted_at (soft delete)
- created_at
```

### achievement_rules
```sql
- id (PK)
- code (UNIQUE, e.g., 'three_straight_wins')
- name, description
- category (performance, engagement, seasonal, admin, campaign)
- source (achievement, prize, quest, campaign, admin)
- stars_reward
- is_repeatable (0 or 1)
- max_times (nullable)
- scope_type (room, season, lifetime, campaign)
- is_active (0 or 1)
- conditions_json (rule-specific config)
- ui_badge_code
```

### season_user_stats
```sql
- id (PK)
- user_id (FK)
- season_id
- total_initial_equity
- total_portfolio_value
- pnl_abs, pnl_pct
- stars
- score (composite ranking score)
- updated_at
```

---

## 🎯 Key Concepts

### Idempotency
Stars are awarded only once per (user, reason_code, bull_pen_id, season_id) combination.
Uses COALESCE for NULL handling in unique constraint.

### Composite Scoring
```
score = 0.5 * norm_return + 0.2 * norm_pnl + 0.3 * norm_stars
```
Where each metric is normalized to [0, 1] using min-max normalization.

### Tie-Breaking (5 levels)
1. Composite score (DESC)
2. P&L percentage (DESC)
3. P&L absolute (DESC)
4. Stars (DESC)
5. Trade count (DESC)
6. Account age (ASC)

### Scopes
- **lifetime**: User's total stars across all time
- **room**: Stars earned in specific room
- **season**: Stars earned in specific season
- **campaign**: Stars earned in specific campaign

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test -- achievementsService.test.js
npm test -- ruleEvaluator.test.js
npm test -- rankingService.test.js
npm test -- seasonRankingService.test.js
```

### Manual Testing
1. Join a room → Check first_room_join stars awarded
2. Finish 1st in room → Check room_first_place stars awarded
3. Win 3 rooms → Check three_straight_wins stars awarded
4. Check leaderboard → Verify stars and score displayed
5. Check season leaderboard → Verify season stats aggregated

---

## 📝 Files Reference

| File | Purpose |
|------|---------|
| `backend/migrations/add-stars-system.sql` | Create tables |
| `backend/migrations/rollback-stars-system.sql` | Rollback tables |
| `backend/scripts/load-achievement-rules.sql` | Load initial rules |
| `backend/src/services/achievementsService.js` | Star awards |
| `backend/src/services/ruleEvaluator.js` | Rule evaluation |
| `backend/src/services/rankingService.js` | Scoring & ranking |
| `backend/src/services/seasonRankingService.js` | Season ranking |

---

## 🆘 Troubleshooting

### Stars not awarded?
1. Check achievement_rules table - is rule active?
2. Check user_star_events - was it already awarded?
3. Check audit log - was event triggered?

### Leaderboard scores wrong?
1. Verify leaderboard_snapshots has stars and score columns
2. Check rankingService.calculateRoomScores() output
3. Verify normalization logic with test data

### Season leaderboard empty?
1. Check season_user_stats table populated
2. Run seasonRankingService.updateSeasonUserStats(seasonId)
3. Verify season_id in bull_pens table

---

**Need Help?** See STARS_IMPLEMENTATION_PROGRESS.md for detailed status.

