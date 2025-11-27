# 🌟 Stars System - Manual Testing Checklist

**Date**: 2025-11-27  
**Status**: Ready for Manual Testing  
**Tester**: [Your Name]

---

## ✅ ACHIEVEMENT AWARDS

### First Room Join
- [ ] Create new user account
- [ ] Join first bull pen (room)
- [ ] Verify 10 stars awarded
- [ ] Check `user_star_events` table for entry
- [ ] Verify idempotency: joining again doesn't award more stars

### Room First Place
- [ ] Join a bull pen with multiple users
- [ ] Complete room settlement with user in 1st place
- [ ] Verify 100 stars awarded to 1st place user
- [ ] Verify other users don't get this achievement
- [ ] Check leaderboard shows stars

### Three Straight Wins
- [ ] Complete 3 consecutive room settlements with same user winning all 3
- [ ] Verify 40 stars awarded after 3rd win
- [ ] Verify idempotency: doesn't award again on 4th win
- [ ] Check star event has correct reason_code

### Rooms Played Milestones
- [ ] Complete 10 rooms with a user
- [ ] Verify 20 stars awarded at 10 rooms
- [ ] Complete 50 rooms total
- [ ] Verify 60 stars awarded at 50 rooms
- [ ] Complete 100 rooms total
- [ ] Verify 150 stars awarded at 100 rooms

---

## 📊 LEADERBOARD & SCORING

### Composite Scoring
- [ ] Complete room settlement
- [ ] Check leaderboard snapshot created
- [ ] Verify `stars` column populated
- [ ] Verify `score` column populated
- [ ] Verify score = 0.5*return + 0.2*pnl + 0.3*stars

### Leaderboard Sorting
- [ ] Get leaderboard via API
- [ ] Verify sorted by composite score (highest first)
- [ ] Verify stars displayed in response
- [ ] Verify score displayed in response
- [ ] Verify tie-breaking applied correctly

### Tie-Breaking Logic
- [ ] Create scenario with same score
- [ ] Verify sorted by return% (highest first)
- [ ] If tied, verify sorted by P&L (highest first)
- [ ] If tied, verify sorted by stars (highest first)
- [ ] If tied, verify sorted by trade count (highest first)
- [ ] If tied, verify sorted by account age (oldest first)

---

## 🎯 ADMIN ENDPOINTS

### Grant Stars
- [ ] Call `POST /api/admin/users/:id/grant-stars`
- [ ] Verify 200 stars granted
- [ ] Check user's total stars increased
- [ ] Verify audit log entry created
- [ ] Verify idempotency: same grant doesn't duplicate

### List Achievement Rules
- [ ] Call `GET /api/admin/achievement-rules`
- [ ] Verify all 12 initial rules returned
- [ ] Verify rule fields: code, name, category, stars_reward
- [ ] Verify pagination works

### Get Specific Rule
- [ ] Call `GET /api/admin/achievement-rules/1`
- [ ] Verify correct rule returned
- [ ] Verify all fields populated

### Create Achievement Rule
- [ ] Call `POST /api/admin/achievement-rules`
- [ ] Create new rule: code=test_rule, stars=50
- [ ] Verify rule created in database
- [ ] Verify audit log entry created

### Update Achievement Rule
- [ ] Call `PATCH /api/admin/achievement-rules/1`
- [ ] Update stars_reward to 75
- [ ] Verify update in database
- [ ] Verify audit log entry created

---

## 🔄 INTEGRATION FLOWS

### End-to-End: Join → Settle → Leaderboard
- [ ] New user joins room
- [ ] Verify first_room_join stars awarded
- [ ] Complete room settlement
- [ ] Verify room_first_place stars awarded (if 1st)
- [ ] Check leaderboard
- [ ] Verify stars and score displayed
- [ ] Verify correct ranking

### Season-End Event
- [ ] Complete season
- [ ] Trigger season.ended event
- [ ] Verify season_user_stats aggregated
- [ ] Verify season_top_10_percent stars awarded
- [ ] Verify season_top_100 stars awarded
- [ ] Check season leaderboard

### Error Handling
- [ ] Disable database temporarily
- [ ] Verify achievement award fails gracefully
- [ ] Verify room join still succeeds
- [ ] Verify settlement still succeeds
- [ ] Verify error logged

---

## 📈 DATA VALIDATION

### Star Events Table
- [ ] Verify all events have user_id
- [ ] Verify all events have reason_code
- [ ] Verify all events have stars_delta > 0
- [ ] Verify deleted_at is NULL for active events
- [ ] Verify unique constraint on (user_id, reason_code, bull_pen_id, season_id)

### Leaderboard Snapshots
- [ ] Verify stars column populated
- [ ] Verify score column populated
- [ ] Verify rank column correct
- [ ] Verify snapshot_at timestamp correct

### Season User Stats
- [ ] Verify pnl_abs calculated correctly
- [ ] Verify pnl_pct calculated correctly
- [ ] Verify stars aggregated correctly
- [ ] Verify score calculated correctly

---

## 🐛 EDGE CASES

### Null Values
- [ ] User with no stars: verify 0 displayed
- [ ] User with no trades: verify handled
- [ ] Room with no snapshot: verify graceful fallback

### Boundary Values
- [ ] User with 0 stars: verify normalized to 0.5
- [ ] User with max stars: verify normalized to 1.0
- [ ] All users with same score: verify tie-breakers applied

### Concurrency
- [ ] Multiple users join same room simultaneously
- [ ] Verify all get first_room_join stars
- [ ] Multiple settlements in parallel
- [ ] Verify all achievements awarded correctly

---

## ✨ FINAL VERIFICATION

- [ ] All unit tests pass: `npm test`
- [ ] All integration tests pass
- [ ] No console errors in browser
- [ ] No database errors in logs
- [ ] All API responses valid JSON
- [ ] All timestamps in correct format
- [ ] All calculations accurate
- [ ] All audit logs created

---

**Tester Signature**: ________________  
**Date Completed**: ________________  
**Issues Found**: ________________  


