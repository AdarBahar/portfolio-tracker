# Stars System - Updated Spec Analysis (v2)

## 📋 Changes from Updated Specification

### NEW CONTENT IDENTIFIED

#### 1. **season_user_stats Table** (CRITICAL - NEW)
**Location**: Section 6.3 "Data Flow Integration"

The spec now explicitly mentions a `season_user_stats` table that maintains per-user, per-season aggregates:
- `user_id`, `season_id`
- `total_initial_equity`, `total_portfolio_value`
- `pnl_abs`, `pnl_pct`
- `stars` (aggregated from user_star_events)
- `score` (computed composite score)

**Impact**: This was missing from my original analysis. Must add to database schema.

#### 2. **Global/Season-Level Ranking** (CRITICAL - NEW)
**Location**: Section 6.3 "Season/global ranking"

Separate ranking flow for seasons:
1. `season_user_stats` maintains per-user, per-season aggregates
2. Periodic job normalizes metrics across all users in season
3. Computes `score` for global leaderboard
4. `season_user_stats.score` used for global leaderboard reads

**Impact**: Requires separate ranking service for season-level scoring.

#### 3. **Activity Streaks Achievement** (NEW - Optional)
**Location**: Section 3.2 "Engagement Achievements"

New achievement type:
- **Code**: `activity_streak_N`
- **Condition**: Logged in / traded for N consecutive days
- **Reward**: Small recurring star bonuses
- **Status**: Optional but should be planned

**Impact**: Requires activity tracking and streak calculation.

#### 4. **Campaign Achievements** (NEW)
**Location**: Section 3.3 "Admin & Special Grants"

New achievement type:
- **Code**: `campaign_<code>`
- **Condition**: User completes campaign-specific action
- **Reward**: Defined by campaign
- **Status**: Should be supported in achievement_rules

**Impact**: Requires campaign context in achievement evaluation.

#### 5. **Star Decay/Impact on Ranking** (NEW - Mentioned)
**Location**: Section 1.3 "Progression and Pressure Without Star Loss"

New concept:
- Lifetime stars never decrease
- Seasonal stars earned during season; reset or compressed at season end
- May apply decay or season resets to *contribution* of stars in ranking
- Not to stored star counts

**Impact**: Requires clarification on decay mechanism and implementation.

---

## 🔄 WHAT NEEDS TO BE UPDATED

### Priority 1 - CRITICAL (Blocks Implementation)
- [ ] Add `season_user_stats` table to database schema
- [ ] Define season-level ranking flow
- [ ] Update ranking service to handle both room and season levels
- [ ] Add season-end event handling

### Priority 2 - HIGH (Affects Design)
- [ ] Add activity streak tracking (optional but should plan)
- [ ] Add campaign achievement support
- [ ] Update achievement_rules to support all new types
- [ ] Update data flow diagrams for season-level ranking

### Priority 3 - MEDIUM (Clarification Needed)
- [ ] Clarify star decay mechanism
- [ ] Define season reset/compression logic
- [ ] Confirm activity streak requirements
- [ ] Confirm campaign achievement requirements

---

## 📊 DATABASE SCHEMA ADDITIONS

### NEW: season_user_stats Table
```sql
CREATE TABLE season_user_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  season_id INT NOT NULL,
  total_initial_equity DECIMAL(15, 2) NOT NULL,
  total_portfolio_value DECIMAL(15, 2) NOT NULL,
  pnl_abs DECIMAL(15, 2) NOT NULL,
  pnl_pct DECIMAL(10, 4) NOT NULL,
  stars INT DEFAULT 0,
  score DECIMAL(10, 4) DEFAULT 0,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uniq_user_season (user_id, season_id),
  INDEX idx_season_score (season_id, score DESC),
  CONSTRAINT fk_season_stats_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_season_stats_season FOREIGN KEY (season_id) REFERENCES seasons(id)
);
```

### UPDATED: achievement_rules Examples
Add to initial rules:
- `activity_streak_1` - 1 day streak
- `activity_streak_7` - 7 day streak
- `activity_streak_30` - 30 day streak
- `campaign_<code>` - Campaign-specific

---

## 🏗️ ARCHITECTURE UPDATES

### Room-Level Ranking (Existing)
```
leaderboard_snapshots
  ├─ pnl_abs, pnl_pct (from trading)
  ├─ stars (from user_star_events, room scope)
  └─ score (computed: 0.5*norm_return + 0.2*norm_pnl + 0.3*norm_stars)
```

### Season-Level Ranking (NEW)
```
season_user_stats
  ├─ pnl_abs, pnl_pct (aggregated from all rooms in season)
  ├─ stars (from user_star_events, season scope)
  └─ score (computed: 0.5*norm_return + 0.2*norm_pnl + 0.3*norm_stars)
```

---

## 📈 IMPLEMENTATION IMPACT

### Phase 1: Database (Add 1 hour)
- Create `season_user_stats` table
- Add activity tracking columns (if needed)

### Phase 2: Services (Add 3 hours)
- Create `SeasonRankingService` for season-level scoring
- Add activity streak evaluator

### Phase 3: Integration (Add 2 hours)
- Add season-end event handling
- Update season_user_stats aggregation job

### Phase 5: Testing (Add 2 hours)
- Test season-level ranking
- Test activity streak evaluation

**Total Additional Time**: ~8 hours (36 → 44 hours)

---

## ✅ VERIFICATION CHECKLIST

- [x] season_user_stats table identified
- [x] Season-level ranking flow understood
- [x] Activity streaks identified
- [x] Campaign achievements identified
- [x] Star decay mentioned (needs clarification)
- [ ] All changes incorporated into updated plan
- [ ] All documents updated
- [ ] New tasks added to checklist


