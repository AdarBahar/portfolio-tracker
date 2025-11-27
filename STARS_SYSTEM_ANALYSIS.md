# Stars System - Comprehensive Analysis & Implementation Plan

## Executive Summary

The Stars system is a **meta-progression and engagement layer** that rewards user achievements and feeds into composite ranking scores. This document analyzes the requirements, identifies integration points, highlights problems, and proposes a phased implementation plan.

---

## 1. REQUIREMENTS OVERVIEW

### Core Principles
- **Add-only model**: Stars never decrease in normal gameplay
- **Configurable rules**: Achievement rules stored in database, not hardcoded
- **Event-driven**: Stars awarded when domain events occur (room joined, settled, season ended)
- **Idempotent**: Same rule + context = same star award (no duplicates)
- **Aggregated**: Stars computed per-room, per-season, and lifetime

### Key Concepts
1. **user_star_events** - Append-only log of star earnings
2. **achievement_rules** - Configurable rules table (new)
3. **Achievements Service** - Evaluates rules and awards stars
4. **Aggregation** - Computes totals for ranking integration
5. **Ranking Integration** - Stars feed into composite score (w_stars = 0.3)

---

## 2. DATABASE SCHEMA CHANGES REQUIRED

### New Tables

#### `user_star_events` (Append-only log)
```sql
CREATE TABLE user_star_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bull_pen_id INT NULL,
  season_id INT NULL,
  source VARCHAR(50) NOT NULL,
  reason_code VARCHAR(100) NOT NULL,
  stars_delta INT NOT NULL,
  meta JSON NULL,
  deleted_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uniq_star_event (user_id, reason_code, bull_pen_id, season_id),
  INDEX idx_user_stars (user_id),
  INDEX idx_room_stars (bull_pen_id),
  INDEX idx_season_stars (season_id),
  CONSTRAINT fk_star_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_star_events_room FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE
);
```

#### `achievement_rules` (Configurable rules)
```sql
CREATE TABLE achievement_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL,
  stars_reward INT NOT NULL,
  is_repeatable TINYINT(1) DEFAULT 0,
  max_times INT NULL,
  scope_type VARCHAR(30) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  conditions_json JSON NULL,
  ui_badge_code VARCHAR(100) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  
  INDEX idx_active_rules (is_active, deleted_at)
);
```

### Modified Tables

#### `leaderboard_snapshots` - Add stars column
```sql
ALTER TABLE leaderboard_snapshots ADD COLUMN (
  stars INT DEFAULT 0,
  score DECIMAL(10, 4) DEFAULT 0
);
```

#### `bull_pens` - Add season_id (future)
```sql
ALTER TABLE bull_pens ADD COLUMN season_id INT NULL;
```

---

## 3. INTEGRATION POINTS WITH EXISTING CODE

### Current Ranking System
- **Location**: `leaderboardController.js`, `jobs/index.js`
- **Current Logic**: Ranks by portfolio_value only
- **Issue**: No composite scoring; no stars integration
- **Change**: Add normalization + weighted scoring

### Current Leaderboard Snapshots
- **Fields**: rank, portfolio_value, pnl_abs, pnl_pct, last_trade_at
- **Missing**: stars, score
- **Impact**: Must add columns and update snapshot creation logic

### Trading Room Lifecycle
- **Join Event**: Trigger `first_room_join` achievement
- **Settlement**: Trigger `room_first_place`, `three_straight_wins`, etc.
- **Season End**: Trigger `season_top_10_percent`, `season_top_100`

---

## 4. IDENTIFIED PROBLEMS & CONCERNS

### 🔴 Critical Issues

1. **No Season System Yet**
   - Spec references `season_id` but no seasons table exists
   - Seasonal stars and global ranking undefined
   - **Impact**: Cannot implement seasonal achievements until seasons table created
   - **Recommendation**: Create seasons table first (separate task)

2. **Leaderboard Snapshots Missing Stars Column**
   - Current schema has no `stars` or `score` fields
   - Spec requires storing normalized stars in snapshots
   - **Impact**: Cannot persist composite scores
   - **Recommendation**: Add columns before implementation

3. **No Composite Scoring Logic**
   - Current ranking is simple portfolio_value sort
   - Spec requires normalization + weighted formula
   - **Impact**: Must rewrite ranking calculation
   - **Recommendation**: Implement scoring service

### 🟡 Medium Issues

4. **Idempotency Key Design**
   - Spec says use `reason_code + context` for idempotency
   - Unique constraint needed on (user_id, reason_code, bull_pen_id, season_id)
   - **Issue**: NULL values in unique constraints behave unexpectedly in MySQL
   - **Recommendation**: Use composite key with COALESCE or separate logic

5. **Achievement Rule Evaluation Complexity**
   - Rules like "3 straight wins" require streak tracking
   - Rules like "top 10% finish" require season-end aggregation
   - **Issue**: Different rules need different evaluation contexts
   - **Recommendation**: Create rule evaluator with pluggable handlers

6. **Event-Driven Architecture Not Fully Implemented**
   - No domain event system currently exists
   - Achievements service would need to hook into multiple controllers
   - **Issue**: Tight coupling risk
   - **Recommendation**: Create event emitter or pub/sub system

### 🟠 Minor Issues

7. **Tie-Breaking Logic**
   - Spec defines 5-level tie-breaker (return%, P&L, stars, trade count, account age)
   - Current code doesn't implement tie-breaking
   - **Impact**: Leaderboard may have arbitrary ordering for tied scores
   - **Recommendation**: Add tie-breaker logic to ranking calculation

8. **Admin Grant Achievement**
   - Spec includes `admin_grant` source for manual star awards
   - Requires new admin endpoint
   - **Recommendation**: Create `/api/admin/users/:id/grant-stars` endpoint

9. **Seasonal vs Lifetime Stars**
   - Spec mentions both but unclear how they interact
   - Seasonal stars reset/compress at season end
   - **Issue**: Unclear if seasonal stars are separate column or computed
   - **Recommendation**: Clarify with product team

---

## 5. IMPROVEMENTS & ADJUSTMENTS

### Recommended Changes to Spec

1. **Simplify Initial Launch**
   - Start with **lifetime stars only** (no seasonal)
   - Implement seasonal stars in Phase 2
   - Reduces complexity and dependencies

2. **Streak Tracking Table**
   - Add `user_streaks` table to track consecutive wins
   - Avoids expensive historical queries
   - Enables real-time streak notifications

3. **Rule Evaluation Context**
   - Define clear context objects for each event type
   - Create rule evaluator interface
   - Enable easy addition of new rules

4. **Notification System**
   - Spec mentions "optional notifies user"
   - Should be mandatory for engagement
   - Create notification service integration

5. **Audit Trail for Stars**
   - Log all star awards with reason and context
   - Enable debugging and fraud detection
   - Use existing `user_audit_log` table

---

## 6. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
- [ ] Create `user_star_events` table
- [ ] Create `achievement_rules` table
- [ ] Add `stars` and `score` columns to `leaderboard_snapshots`
- [ ] Create `AchievementsService` class
- [ ] Implement basic rule evaluator

### Phase 2: Core Achievements (Week 2)
- [ ] Implement `first_room_join` achievement
- [ ] Implement `room_first_place` achievement
- [ ] Implement `three_straight_wins` achievement
- [ ] Add star event logging to room settlement
- [ ] Create admin endpoint for manual grants

### Phase 3: Ranking Integration (Week 3)
- [ ] Implement normalization logic
- [ ] Implement composite scoring formula
- [ ] Update leaderboard snapshot creation
- [ ] Update leaderboard API response
- [ ] Add tie-breaking logic

### Phase 4: Advanced Achievements (Week 4)
- [ ] Implement engagement achievements (rooms played, streaks)
- [ ] Implement seasonal achievements (top 10%, top 100)
- [ ] Create achievement UI badges
- [ ] Add notifications system

### Phase 5: Admin & Monitoring (Week 5)
- [ ] Create admin UI for rule management
- [ ] Create admin UI for star grants
- [ ] Create analytics dashboard
- [ ] Add monitoring and alerting

---

## 7. OPEN QUESTIONS & CLARIFICATIONS NEEDED

### Product/Business Questions
1. **Seasonal Stars**: Should seasonal stars be separate from lifetime? How do they reset?
2. **Star Decay**: Should stars decay over time or remain permanent?
3. **Competitive Pressure**: How important is competitive pressure vs. engagement?
4. **Initial Star Grants**: Should existing users get retroactive stars?
5. **Star Marketplace**: Future plans for star redemption or trading?

### Technical Questions
1. **Event System**: Should we implement pub/sub or use direct service calls?
2. **Batch Processing**: Should achievement evaluation be real-time or batch?
3. **Performance**: What's acceptable latency for star awards?
4. **Backfill**: Should we backfill stars for historical achievements?
5. **Rollback**: How to handle star award reversals (if needed)?

### Data Questions
1. **Streak Definition**: What constitutes a "win"? (positive P&L? top 50%? top 3?)
2. **Milestone Thresholds**: What are exact thresholds for engagement achievements?
3. **Weight Tuning**: Should weights be configurable per room/season?
4. **Normalization Edge Cases**: How to handle all-zero metrics?

---

## 8. RISK ASSESSMENT

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Season system not ready | HIGH | Start with lifetime stars only |
| Event system complexity | MEDIUM | Use simple direct calls initially |
| Performance with large datasets | MEDIUM | Add indexes, batch processing |
| Idempotency bugs | MEDIUM | Comprehensive testing, unique constraints |
| User confusion about stars | LOW | Clear documentation, UI explanations |

---

## 9. SUCCESS CRITERIA

- ✅ All 9 initial achievements working correctly
- ✅ Stars properly integrated into ranking scores
- ✅ Leaderboard shows composite scores with stars
- ✅ Admin can manually grant stars
- ✅ No duplicate star awards (idempotency verified)
- ✅ Performance acceptable (< 100ms for star award)
- ✅ Comprehensive test coverage (>80%)


