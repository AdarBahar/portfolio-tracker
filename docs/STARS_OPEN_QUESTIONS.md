# Stars System - Open Questions & Issues

## 🔴 CRITICAL BLOCKERS

### 1. Season System Not Implemented
**Status**: BLOCKER  
**Severity**: HIGH  
**Description**: Spec references `season_id` and seasonal achievements, but no seasons table exists in schema.

**Questions**:
- When will seasons table be created?
- What defines a season? (calendar-based? manual? duration-based?)
- How long is a season? (1 month? 3 months? 1 year?)
- Can users participate in multiple seasons simultaneously?
- How do seasonal stars interact with lifetime stars?

**Recommendation**: 
- Implement lifetime stars only in Phase 1
- Add seasonal achievements in Phase 2 after seasons table created
- Create separate `seasons` table with: id, name, start_date, end_date, status

**Action Items**:
- [ ] Clarify season system requirements with product team
- [ ] Create seasons table schema
- [ ] Define season lifecycle (draft → active → completed)

---

### 2. Leaderboard Ranking Overhaul Needed
**Status**: BLOCKER  
**Severity**: HIGH  
**Description**: Current ranking is simple portfolio_value sort. Spec requires complex normalization + weighted scoring.

**Current Implementation**:
```javascript
leaderboard.sort((a, b) => b.portfolioValue - a.portfolioValue);
```

**Required Implementation**:
```javascript
// Normalize each metric to [0,1]
// Compute: score = 0.5*norm_return + 0.2*norm_pnl + 0.3*norm_stars
// Apply tie-breakers: return% → pnl → stars → trade_count → account_age
```

**Questions**:
- Should we keep portfolio_value as primary sort for backward compatibility?
- Should score be displayed to users or only used internally?
- How to handle edge cases (all users have same score)?
- Should weights be configurable per room/season?

**Recommendation**:
- Implement composite scoring as new feature
- Keep portfolio_value sort as fallback
- Add feature flag to toggle between old/new ranking

**Action Items**:
- [ ] Design composite scoring service
- [ ] Implement normalization with edge case handling
- [ ] Add tie-breaking logic
- [ ] Update leaderboard API response schema

---

### 3. Event-Driven Architecture Not Implemented
**Status**: BLOCKER  
**Severity**: MEDIUM  
**Description**: Spec requires event-driven achievement evaluation, but no event system exists.

**Current Approach**: Direct function calls in controllers  
**Spec Approach**: Domain events published → Achievements service subscribes

**Questions**:
- Should we implement full pub/sub system or use direct service calls?
- What events need to be published? (room.joined, room.settled, season.ended, etc.)
- Should events be persisted for audit trail?
- How to handle event ordering and consistency?

**Recommendation**:
- Start with direct service calls (simpler, faster to implement)
- Use event emitter pattern for loose coupling
- Migrate to pub/sub if needed later

**Action Items**:
- [ ] Create EventEmitter wrapper
- [ ] Define domain events interface
- [ ] Integrate into room join/settlement flows

---

## 🟡 MEDIUM PRIORITY ISSUES

### 4. Idempotency Key Design Flaw
**Status**: ISSUE  
**Severity**: MEDIUM  
**Description**: Unique constraint on (user_id, reason_code, bull_pen_id, season_id) has NULL handling issues.

**Problem**: In MySQL, NULL != NULL, so multiple rows with NULL season_id can exist.

**Example**:
```sql
-- Both rows inserted successfully (should be prevented)
INSERT INTO user_star_events (user_id, reason_code, bull_pen_id, season_id, stars_delta)
VALUES (1, 'first_room_join', NULL, NULL, 10);

INSERT INTO user_star_events (user_id, reason_code, bull_pen_id, season_id, stars_delta)
VALUES (1, 'first_room_join', NULL, NULL, 10);
```

**Solutions**:
1. Use COALESCE in unique constraint: `UNIQUE(user_id, reason_code, COALESCE(bull_pen_id, 0), COALESCE(season_id, 0))`
2. Use generated column: `UNIQUE(user_id, reason_code, context_hash)`
3. Application-level check before insert

**Recommendation**: Use COALESCE approach (simplest, most portable)

**Action Items**:
- [ ] Update unique constraint definition
- [ ] Add application-level validation
- [ ] Add test for idempotency with NULL values

---

### 5. Streak Tracking Performance
**Status**: ISSUE  
**Severity**: MEDIUM  
**Description**: "3 straight wins" achievement requires checking historical room results.

**Current Approach**: Query all user's rooms, check last 3 results  
**Problem**: Expensive query, especially with many rooms

**Optimization Options**:
1. Add `user_streaks` table to track current streak
2. Update streak on each room settlement
3. Query only recent rooms (last 10)

**Recommendation**: Add `user_streaks` table for O(1) lookup

**Schema**:
```sql
CREATE TABLE user_streaks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  streak_type VARCHAR(50) NOT NULL,
  current_count INT DEFAULT 0,
  best_count INT DEFAULT 0,
  last_updated DATETIME,
  UNIQUE KEY uniq_user_streak (user_id, streak_type)
);
```

**Action Items**:
- [ ] Create user_streaks table
- [ ] Update streak on room settlement
- [ ] Use streak table for achievement evaluation

---

### 6. Normalization Edge Cases
**Status**: ISSUE  
**Severity**: MEDIUM  
**Description**: Normalization formula breaks when all users have same metric value.

**Formula**: `norm = (value - min) / (max - min)`  
**Problem**: When max == min, division by zero

**Spec Solution**: Return 0.5 for all users

**Questions**:
- Is 0.5 the right default? (seems arbitrary)
- Should all users get same score when metrics are identical?
- How to handle negative values (e.g., negative P&L)?

**Recommendation**: 
- Use 0.5 as default (per spec)
- Add logging when this occurs (indicates data issue)
- Consider alternative: use percentile ranking instead

**Action Items**:
- [ ] Implement normalization with edge case handling
- [ ] Add unit tests for edge cases
- [ ] Add monitoring/alerting for edge case occurrence

---

## 🟠 LOWER PRIORITY QUESTIONS

### 7. Seasonal vs Lifetime Stars Interaction
**Status**: QUESTION  
**Severity**: LOW  
**Description**: Spec mentions both seasonal and lifetime stars but interaction unclear.

**Questions**:
- Are seasonal stars separate column or computed from events?
- Do seasonal stars reset at season end?
- Can user see both seasonal and lifetime totals?
- How do seasonal stars affect ranking vs lifetime?

**Recommendation**: Clarify with product team before implementation

---

### 8. Star Decay / Expiration
**Status**: QUESTION  
**Severity**: LOW  
**Description**: Spec doesn't mention if stars expire or decay over time.

**Questions**:
- Should old stars decay? (e.g., 10% per year)
- Should seasonal stars expire at season end?
- Should there be a "star reset" mechanism?

**Recommendation**: Assume no decay (add-only model) unless specified

---

### 9. Retroactive Star Awards
**Status**: QUESTION  
**Severity**: LOW  
**Description**: Should existing users get stars for historical achievements?

**Questions**:
- Should we backfill stars for users who already won rooms?
- Should we backfill stars for users who already joined rooms?
- How far back should we backfill? (all time? last 6 months?)

**Recommendation**: Don't backfill initially; add as optional admin feature later

---

### 10. Star Marketplace / Redemption
**Status**: QUESTION  
**Severity**: LOW  
**Description**: Spec doesn't mention what users can do with stars.

**Questions**:
- Can stars be traded/sold?
- Can stars be redeemed for rewards?
- Can stars be transferred between users?
- Are stars just for leaderboard ranking or have other value?

**Recommendation**: Clarify with product team; implement as future feature

---

### 11. Notification System Integration
**Status**: QUESTION  
**Severity**: LOW  
**Description**: Spec says "optionally notifies user" but no notification system exists.

**Questions**:
- Should star awards trigger notifications?
- What channel? (in-app toast? email? push?)
- Should users be able to disable notifications?

**Recommendation**: Implement in-app toast notifications; add email later

---

### 12. Admin Star Grant Audit Trail
**Status**: QUESTION  
**Severity**: LOW  
**Description**: How to track admin star grants for compliance?

**Questions**:
- Should admin grants be logged to user_audit_log?
- Should we track which admin granted stars?
- Should there be approval workflow for large grants?

**Recommendation**: Log to user_audit_log with admin_id and reason

---

## 📋 CLARIFICATION CHECKLIST

Before starting implementation, confirm:

- [ ] Season system requirements finalized
- [ ] Seasonal vs lifetime stars interaction defined
- [ ] Exact thresholds for all achievements (e.g., what is a "win"?)
- [ ] Weight values confirmed (0.5, 0.2, 0.3 or different?)
- [ ] Tie-breaker order confirmed
- [ ] Notification requirements defined
- [ ] Admin grant workflow defined
- [ ] Retroactive backfill decision made
- [ ] Star decay/expiration policy defined
- [ ] Star marketplace plans clarified

---

## 🚀 RECOMMENDED NEXT STEPS

1. **Immediate** (Today)
   - [ ] Review this analysis with product team
   - [ ] Clarify season system requirements
   - [ ] Confirm achievement thresholds

2. **This Week**
   - [ ] Create seasons table schema
   - [ ] Finalize achievement rules configuration
   - [ ] Design composite scoring service

3. **Next Week**
   - [ ] Start Phase 1 database implementation
   - [ ] Begin Phase 2 services development
   - [ ] Set up testing infrastructure


