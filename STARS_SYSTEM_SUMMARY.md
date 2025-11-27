# Stars System - Executive Summary

## Overview

The Stars system is a **meta-progression layer** that rewards user achievements and feeds into composite ranking scores. It transforms the current simple portfolio-value-based ranking into a sophisticated system that balances performance (P&L) with engagement (achievements).

---

## Key Findings

### ✅ What's Good About the Spec

1. **Well-Designed Add-Only Model**: Stars never decrease, avoiding frustration
2. **Configurable Rules**: Database-driven rules enable non-technical staff to manage achievements
3. **Clear Aggregation Logic**: Per-room, per-season, lifetime stars well-defined
4. **Thoughtful Composite Scoring**: Normalization + weighted formula is mathematically sound
5. **Idempotency Built-In**: Prevents duplicate star awards

### 🔴 Critical Issues Found

1. **Season System Missing**: Spec references seasons but no seasons table exists
   - **Impact**: Cannot implement seasonal achievements
   - **Fix**: Create seasons table first (separate task)

2. **Leaderboard Ranking Needs Overhaul**: Current code sorts by portfolio_value only
   - **Impact**: Composite scoring not implemented
   - **Fix**: Implement normalization + weighted scoring service

3. **No Event System**: Spec requires event-driven architecture
   - **Impact**: Tight coupling between achievements and controllers
   - **Fix**: Implement event emitter or direct service calls

4. **Idempotency Key Design Flaw**: NULL values in unique constraints
   - **Impact**: Duplicate star awards possible
   - **Fix**: Use COALESCE in unique constraint

5. **Leaderboard Schema Incomplete**: Missing `stars` and `score` columns
   - **Impact**: Cannot persist composite scores
   - **Fix**: Add columns to leaderboard_snapshots

### 🟡 Medium Issues

6. **Streak Tracking Performance**: "3 straight wins" requires expensive queries
   - **Fix**: Add user_streaks table for O(1) lookup

7. **Normalization Edge Cases**: Division by zero when all metrics identical
   - **Fix**: Return 0.5 as default (per spec)

8. **Unclear Seasonal vs Lifetime Interaction**: Spec mentions both but interaction undefined
   - **Fix**: Clarify with product team

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN EVENTS                             │
│  (room.joined, room.settled, season.ended, etc.)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              ACHIEVEMENTS SERVICE                            │
│  - Evaluates achievement rules                              │
│  - Checks idempotency                                       │
│  - Awards stars to user_star_events                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           USER_STAR_EVENTS (Append-Only Log)                │
│  - Immutable record of all star awards                      │
│  - Includes reason_code, context, metadata                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            RANKING SERVICE                                   │
│  - Aggregates stars (room/season/lifetime)                  │
│  - Normalizes metrics (return%, P&L, stars)                 │
│  - Computes composite score                                 │
│  - Applies tie-breakers                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        LEADERBOARD_SNAPSHOTS                                │
│  - Stores rank, portfolio_value, pnl_abs, pnl_pct           │
│  - NEW: stars, score                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Changes Required

### New Tables
- `user_star_events` - Append-only log of star earnings
- `achievement_rules` - Configurable achievement rules

### Modified Tables
- `leaderboard_snapshots` - Add `stars` and `score` columns
- `bull_pens` - Add `season_id` (for future use)

### New Indexes
- user_star_events: (user_id), (bull_pen_id), (season_id)
- achievement_rules: (is_active, deleted_at)

---

## Integration Points

| Component | Change | Impact |
|-----------|--------|--------|
| bullPenMembershipsController | Award `first_room_join` on join | 1 hour |
| settlementService | Award `room_first_place`, `three_straight_wins` | 2 hours |
| leaderboardController | Include stars in response | 1 hour |
| jobs/index.js | Compute composite scores in snapshots | 2 hours |
| adminRoutes | Add star grant endpoint | 1 hour |

---

## Implementation Timeline

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| 1 | Database foundation | 3 hours | 📋 Ready |
| 2 | Core services | 12 hours | 📋 Ready |
| 3 | Integration | 6 hours | 📋 Ready |
| 4 | Admin endpoints | 3 hours | 📋 Ready |
| 5 | Testing | 9 hours | 📋 Ready |
| 6 | Docs & deployment | 3 hours | 📋 Ready |

**Total**: 36 hours (4.5 days)

---

## Critical Path

1. **Clarify season system** (blocks seasonal achievements)
2. **Create seasons table** (if needed)
3. **Implement database foundation** (Phase 1)
4. **Implement core services** (Phase 2)
5. **Integrate with room flows** (Phase 3)
6. **Test thoroughly** (Phase 5)
7. **Deploy to production** (Phase 6)

---

## Success Metrics

- ✅ All 9 initial achievements working
- ✅ Stars properly integrated into ranking
- ✅ Leaderboard shows composite scores
- ✅ No duplicate star awards
- ✅ Admin can manually grant stars
- ✅ Performance acceptable (< 100ms per award)
- ✅ Test coverage > 80%

---

## Risk Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Season system not ready | HIGH | Start with lifetime stars only |
| Event system complexity | MEDIUM | Use direct service calls initially |
| Performance issues | MEDIUM | Add indexes, batch processing |
| Idempotency bugs | MEDIUM | Comprehensive testing |
| User confusion | LOW | Clear documentation |

---

## Recommended Actions

### Immediate (Today)
- [ ] Review this analysis with product team
- [ ] Clarify season system requirements
- [ ] Confirm achievement thresholds

### This Week
- [ ] Create seasons table schema (if needed)
- [ ] Finalize achievement rules
- [ ] Design composite scoring service

### Next Week
- [ ] Start Phase 1 implementation
- [ ] Set up testing infrastructure
- [ ] Begin Phase 2 services

---

## Documents Created

1. **STARS_SYSTEM_ANALYSIS.md** - Detailed analysis of requirements, problems, and improvements
2. **STARS_IMPLEMENTATION_PLAN.md** - Step-by-step implementation guide with time estimates
3. **STARS_OPEN_QUESTIONS.md** - Critical blockers and clarification questions
4. **STARS_SYSTEM_SUMMARY.md** - This executive summary

---

## Next Steps

1. Review all analysis documents
2. Schedule meeting with product team to clarify open questions
3. Create seasons table schema (if needed)
4. Begin Phase 1 database implementation
5. Set up development environment and testing


