# Stars System - Updated Data Flows (v2)

## 1. Season-End Event Flow (NEW)

```
Season end triggered (scheduled job or manual)
    ↓
seasonRankingService.aggregateSeasonStats(seasonId)
    ↓
For each user in season:
    ↓
    1. Get all rooms completed in season
       SELECT SUM(pnl_abs), SUM(pnl_pct), COUNT(*)
       FROM leaderboard_snapshots
       WHERE season_id = ? AND user_id = ?
    ↓
    2. Get season stars
       SELECT SUM(stars_delta) FROM user_star_events
       WHERE user_id = ? AND season_id = ?
    ↓
    3. Normalize metrics
       - norm_return = (pnl_pct - min_pnl_pct) / (max_pnl_pct - min_pnl_pct)
       - norm_pnl = (pnl_abs - min_pnl_abs) / (max_pnl_abs - min_pnl_abs)
       - norm_stars = (stars - min_stars) / (max_stars - min_stars)
    ↓
    4. Compute season score
       score = 0.5*norm_return + 0.2*norm_pnl + 0.3*norm_stars
    ↓
    5. Update season_user_stats
       INSERT/UPDATE season_user_stats (
         user_id, season_id, pnl_abs, pnl_pct, stars, score
       )
    ↓
Award season achievements:
    ↓
    For each user:
      - Get rank in season
      - If rank <= top_10_percent: Award season_top_10_percent (200 stars)
      - If rank <= 100: Award season_top_100 (300 stars)
    ↓
✅ Season stats computed and achievements awarded
```

---

## 2. Activity Streak Evaluation (NEW)

```
Room settlement or daily job
    ↓
ruleEvaluator.evaluateActivityStreak(userId, days)
    ↓
Query user activity:
    SELECT COUNT(DISTINCT DATE(created_at)) as activity_days
    FROM user_audit_log
    WHERE user_id = ?
      AND event_type IN ('trade_executed', 'login')
      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    ↓
Check if consecutive:
    - Get last N days of activity
    - Verify no gaps (all N days have activity)
    ↓
If streak complete:
    achievementsService.awardStars(
      reasonCode: 'activity_streak_N',
      starsDelta: rule.stars_reward
    )
    ↓
✅ Activity streak achievement awarded
```

---

## 3. Campaign Achievement Evaluation (NEW)

```
Campaign action triggered (e.g., user completes task)
    ↓
ruleEvaluator.evaluateCampaignAction(userId, campaignCode, action)
    ↓
Query achievement_rules:
    SELECT * FROM achievement_rules
    WHERE code = 'campaign_<campaignCode>'
      AND is_active = 1
    ↓
Parse conditions_json:
    {
      "campaign_code": "summer_2025",
      "required_action": "complete_tutorial",
      "action_count": 1
    }
    ↓
Check if user completed action:
    SELECT COUNT(*) FROM user_audit_log
    WHERE user_id = ?
      AND event_type = 'campaign_action'
      AND meta->>'$.campaign_code' = ?
      AND meta->>'$.action' = ?
    ↓
If action completed:
    achievementsService.awardStars(
      reasonCode: 'campaign_<campaignCode>',
      starsDelta: rule.stars_reward
    )
    ↓
✅ Campaign achievement awarded
```

---

## 4. Season Leaderboard API Response (NEW)

```
GET /api/seasons/:id/leaderboard
    ↓
seasonRankingService.getSeasonLeaderboard(seasonId)
    ↓
Query season_user_stats:
    SELECT user_id, pnl_abs, pnl_pct, stars, score
    FROM season_user_stats
    WHERE season_id = ?
    ORDER BY score DESC, pnl_pct DESC, pnl_abs DESC, stars DESC
    ↓
Assign ranks (1, 2, 3, ...)
    ↓
Get user details:
    SELECT id, name, email FROM users WHERE id IN (...)
    ↓
Return JSON:
{
  "seasonId": 1,
  "seasonName": "Summer 2025",
  "leaderboard": [
    {
      "userId": 1,
      "userName": "Alice",
      "rank": 1,
      "pnlAbs": 5000,
      "pnlPct": 50,
      "stars": 450,
      "score": 0.92
    },
    ...
  ]
}
    ↓
✅ Season leaderboard returned
```

---

## 5. Updated Room Settlement Flow

```
Room settlement triggered
    ↓
settlementService.settleRoom(bullPenId)
    ↓
Get final leaderboard
    ↓
For each user:
    ↓
    1. Award room_first_place if rank = 1
    ↓
    2. Check three_straight_wins
       - Get last 3 completed rooms
       - If all 3 have positive P&L: Award 40 stars
    ↓
    3. **NEW**: Check activity streaks
       - Call ruleEvaluator.evaluateActivityStreak()
       - Award if streak complete
    ↓
    4. Check rooms_played milestones
       - Count total rooms completed
       - Award if milestone reached (10, 50, 100)
    ↓
✅ All room settlement achievements awarded
```

---

## 6. Updated Leaderboard Snapshot Creation

```
Background job: createLeaderboardSnapshot(bullPenId)
    ↓
Get all active members
    ↓
For each member:
    ↓
    1. Calculate portfolio value
    2. Calculate P&L
    3. Get room stars
    4. Get last trade timestamp
    ↓
Normalize metrics:
    - norm_return = (return - min_return) / (max_return - min_return)
    - norm_pnl = (pnl - min_pnl) / (max_pnl - min_pnl)
    - norm_stars = (stars - min_stars) / (max_stars - min_stars)
    ↓
Compute composite scores:
    score = 0.5*norm_return + 0.2*norm_pnl + 0.3*norm_stars
    ↓
Apply tie-breakers:
    Sort by: score DESC → return% DESC → pnl DESC → stars DESC
    ↓
Assign ranks
    ↓
INSERT INTO leaderboard_snapshots (
  stars, score, rank, ...
)
    ↓
✅ Snapshot created with stars and scores
```

---

## 7. Key Aggregation Queries (UPDATED)

### Get Season Stars
```sql
SELECT SUM(stars_delta) as season_stars
FROM user_star_events
WHERE user_id = ?
  AND season_id = ?
  AND deleted_at IS NULL;
```

### Get Season User Stats
```sql
SELECT pnl_abs, pnl_pct, stars, score
FROM season_user_stats
WHERE user_id = ? AND season_id = ?;
```

### Get Season Leaderboard
```sql
SELECT user_id, pnl_abs, pnl_pct, stars, score,
       ROW_NUMBER() OVER (ORDER BY score DESC) as rank
FROM season_user_stats
WHERE season_id = ?
ORDER BY score DESC;
```


