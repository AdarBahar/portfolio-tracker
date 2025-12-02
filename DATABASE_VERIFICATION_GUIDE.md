# Database Verification Guide - Trade Room Migration

**Date**: December 2, 2025  
**Status**: READY FOR VERIFICATION  
**Migration**: TRADE_ROOM_DATABASE_MIGRATION.sql  
**Database**: portfolio_tracker (Production)

---

## 🎯 VERIFICATION OVERVIEW

This guide helps you verify that the Trade Room database migration was successfully applied to the production database.

---

## 📋 QUICK VERIFICATION (5 minutes)

### Step 1: Connect to Database
```bash
mysql -u [DB_USER] -p[DB_PASSWORD] -h [DB_HOST] portfolio_tracker
```

### Step 2: Run Quick Checks
```sql
-- Check tables exist
SELECT COUNT(*) AS tables_found FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('bull_pens', 'bull_pen_memberships', 'bull_pen_positions', 
                   'bull_pen_orders', 'leaderboard_snapshots', 'market_data');

-- Check views exist
SELECT COUNT(*) AS views_found FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'VIEW'
AND TABLE_NAME IN ('active_trade_rooms', 'user_trade_room_positions', 'trade_room_leaderboard');

-- Test views
SELECT COUNT(*) FROM active_trade_rooms;
SELECT COUNT(*) FROM user_trade_room_positions;
SELECT COUNT(*) FROM trade_room_leaderboard;
```

**Expected Results**:
- tables_found: 6
- views_found: 3
- All SELECT COUNT queries return 0 or positive numbers (no errors)

---

## 🔍 COMPREHENSIVE VERIFICATION (15 minutes)

### Step 1: Run Full Verification Script
```bash
mysql -u [DB_USER] -p[DB_PASSWORD] -h [DB_HOST] portfolio_tracker < DATABASE_VERIFICATION_SCRIPT.sql
```

### Step 2: Review Output Sections

**Section 1: Trade Room Tables**
- Should show 6 tables: bull_pens, bull_pen_memberships, bull_pen_positions, bull_pen_orders, leaderboard_snapshots, market_data

**Section 2: Views Created**
- Should show 3 views: active_trade_rooms, user_trade_room_positions, trade_room_leaderboard

**Section 3-5: Column Definitions**
- Verify column names match expected schema
- Key columns: qty (not quantity), avg_cost (not average_cost), placed_at (not created_at), snapshot_at (not created_at)

**Section 6: Indexes**
- Should show 10+ indexes across Trade Room tables

**Section 7: Foreign Keys**
- Should show 9 foreign key relationships

**Section 8: View Tests**
- All three views should return row counts (0 or positive)

**Section 9: Bull Pens Columns**
- Should include settlement_status and season_id columns

**Section 10: Summary**
- tables_found: 6
- views_found: 3

---

## ✅ DETAILED VERIFICATION CHECKLIST

### Tables (6 total)
- [ ] bull_pens exists
- [ ] bull_pen_memberships exists
- [ ] bull_pen_positions exists
- [ ] bull_pen_orders exists
- [ ] leaderboard_snapshots exists
- [ ] market_data exists

### Views (3 total)
- [ ] active_trade_rooms exists
- [ ] user_trade_room_positions exists
- [ ] trade_room_leaderboard exists

### Columns Added
- [ ] bull_pens.settlement_status exists
- [ ] bull_pens.season_id exists

### Key Columns Verified
- [ ] bull_pen_positions.qty exists (not quantity)
- [ ] bull_pen_positions.avg_cost exists (not average_cost)
- [ ] bull_pen_orders.placed_at exists (not created_at)
- [ ] leaderboard_snapshots.snapshot_at exists (not created_at)
- [ ] leaderboard_snapshots.pnl_abs exists (not pnl)
- [ ] leaderboard_snapshots.pnl_pct exists (not pnl_percent)

### Indexes (10 total)
- [ ] idx_bull_pens_host_user_id
- [ ] idx_bull_pens_state_start_time
- [ ] idx_bull_pen_memberships_user_id
- [ ] idx_bull_pen_memberships_bull_pen_id_status
- [ ] idx_bull_pen_positions_room_user_symbol
- [ ] idx_bull_pen_orders_room_user
- [ ] idx_bull_pen_orders_room_symbol
- [ ] idx_leaderboard_room_snapshot
- [ ] idx_leaderboard_user
- [ ] idx_market_data_updated

### Foreign Keys (9 total)
- [ ] bull_pens.host_user_id → users.id
- [ ] bull_pen_memberships.bull_pen_id → bull_pens.id
- [ ] bull_pen_memberships.user_id → users.id
- [ ] bull_pen_positions.bull_pen_id → bull_pens.id
- [ ] bull_pen_positions.user_id → users.id
- [ ] bull_pen_orders.bull_pen_id → bull_pens.id
- [ ] bull_pen_orders.user_id → users.id
- [ ] leaderboard_snapshots.bull_pen_id → bull_pens.id
- [ ] leaderboard_snapshots.user_id → users.id

### View Functionality
- [ ] active_trade_rooms returns data without errors
- [ ] user_trade_room_positions returns data without errors
- [ ] trade_room_leaderboard returns data without errors

---

## 🚨 TROUBLESHOOTING

### Issue: "Table doesn't exist"
**Cause**: Migration didn't run or failed  
**Solution**: Re-run TRADE_ROOM_DATABASE_MIGRATION.sql

### Issue: "View doesn't exist"
**Cause**: CREATE VIEW statements didn't execute  
**Solution**: Check migration script output for errors

### Issue: "Unknown column"
**Cause**: Column names don't match  
**Solution**: Verify column names in DESCRIBE output

### Issue: "Access denied"
**Cause**: Wrong credentials  
**Solution**: Check DB_USER and DB_PASSWORD

---

## 📊 COMPARISON DOCUMENTS

- **MIGRATION_PLAN_VS_ACTUAL.md** - Detailed comparison of plan vs actual
- **DATABASE_VERIFICATION_REPORT.md** - Full verification report
- **DATABASE_VERIFICATION_SCRIPT.sql** - SQL verification script

---

## 📝 DOCUMENTATION

- **TRADE_ROOM_DATABASE_MIGRATION.sql** - Migration script
- **TRADE_ROOM_DATABASE_MIGRATION_FIXES.md** - Issues fixed
- **schema.mysql.sql** - Full database schema

---

## ✅ VERIFICATION COMPLETE

Once all checks pass:
1. ✅ Migration successful
2. ✅ All tables exist
3. ✅ All views created
4. ✅ All columns correct
5. ✅ All indexes present
6. ✅ Ready for Phase 1 implementation

---

## 🚀 NEXT STEPS

After verification passes:
1. Begin Phase 1 implementation
2. Create API routes
3. Implement services
4. Set up scheduled jobs
5. Test with sample data

---

**Status**: ✅ READY FOR VERIFICATION


