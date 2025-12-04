# Trade Room Database Migration - Fixes Applied

**Date**: December 2, 2025  
**Status**: ✅ CORRECTED  
**Issues Found**: 8  
**Issues Fixed**: 8

---

## 🔧 ISSUES FOUND & FIXED

### Issue 1: Duplicate Index - idx_bull_pens_host_user_id
**Error**: #1061 - Duplicate key name 'idx_bull_pens_host_user_id'  
**Cause**: Index already exists in schema.mysql.sql (line 383)  
**Fix**: Removed duplicate index creation

### Issue 2: Duplicate Index - idx_bull_pen_memberships_user_id
**Error**: #1061 - Duplicate key name 'idx_bull_pen_memberships_user_id'  
**Cause**: Index already exists in schema.mysql.sql (line 385)  
**Fix**: Removed duplicate index creation

### Issue 3: Missing Column - created_at in bull_pen_orders
**Error**: #1072 - Key column 'created_at' doesn't exist in table  
**Cause**: Column is named 'placed_at' not 'created_at'  
**Fix**: Removed index creation (already has idx_bull_pen_orders_room_user)

### Issue 4: Duplicate Index - idx_bull_pen_orders_user_id
**Error**: #1061 - Duplicate key name 'idx_bull_pen_orders_user_id'  
**Cause**: Index already exists as idx_bull_pen_orders_room_user (line 387)  
**Fix**: Removed duplicate index creation

### Issue 5: Duplicate Index - idx_bull_pen_orders_status
**Error**: #1061 - Duplicate key name 'idx_bull_pen_orders_status'  
**Cause**: Index already exists in schema.mysql.sql  
**Fix**: Removed duplicate index creation

### Issue 6: Missing Column - created_at in leaderboard_snapshots
**Error**: #1072 - Key column 'created_at' doesn't exist in table  
**Cause**: Column is named 'snapshot_at' not 'created_at'  
**Fix**: Removed index creation (already has idx_leaderboard_room_snapshot)

### Issue 7: Duplicate Index - idx_leaderboard_snapshots_rank
**Error**: #1061 - Duplicate key name 'idx_leaderboard_snapshots_rank'  
**Cause**: Index already exists in schema.mysql.sql  
**Fix**: Removed duplicate index creation

### Issue 8: Wrong Column Names in Views
**Error**: #1054 - Unknown column 'bpp.quantity' in 'SELECT'  
**Cause**: Actual column names are 'qty' and 'avg_cost', not 'quantity' and 'average_cost'  
**Fix**: Updated view queries to use correct column names

---

## 📊 ACTUAL SCHEMA MAPPING

### bull_pen_positions Table
```sql
-- Actual columns:
id INT AUTO_INCREMENT PRIMARY KEY
bull_pen_id INT NOT NULL
user_id INT NOT NULL
symbol VARCHAR(32) NOT NULL
qty DECIMAL(18, 8) NOT NULL              -- NOT quantity
avg_cost DECIMAL(18, 6) NOT NULL         -- NOT average_cost
created_at DATETIME NOT NULL
updated_at DATETIME NOT NULL
```

### bull_pen_orders Table
```sql
-- Actual columns:
id INT AUTO_INCREMENT PRIMARY KEY
bull_pen_id INT NOT NULL
user_id INT NOT NULL
symbol VARCHAR(32) NOT NULL
side ENUM('buy', 'sell') NOT NULL
type ENUM('market', 'limit') NOT NULL
qty DECIMAL(18, 8) NOT NULL
filled_qty DECIMAL(18, 8) NOT NULL
limit_price DECIMAL(18, 6) NULL
avg_fill_price DECIMAL(18, 6) NULL
status ENUM('new', 'partially_filled', 'filled', 'cancelled', 'rejected') NOT NULL
rejection_reason TEXT NULL
placed_at DATETIME NOT NULL              -- NOT created_at
filled_at DATETIME NULL
server_ts DATETIME NOT NULL
feed_ts DATETIME NULL
```

### leaderboard_snapshots Table
```sql
-- Actual columns:
id INT AUTO_INCREMENT PRIMARY KEY
bull_pen_id INT NOT NULL
user_id INT NOT NULL
snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- NOT created_at
rank INT
portfolio_value DECIMAL(18, 2) NOT NULL
pnl_abs DECIMAL(18, 2) NOT NULL         -- NOT pnl
pnl_pct DECIMAL(10, 4) NOT NULL         -- NOT pnl_percent
last_trade_at TIMESTAMP NULL
stars INT DEFAULT 0
score DECIMAL(10, 4) DEFAULT 0
```

---

## ✅ CORRECTED VIEWS

### View 1: user_trade_room_positions
```sql
CREATE OR REPLACE VIEW user_trade_room_positions AS
SELECT 
  bpp.id,
  bpp.bull_pen_id,
  bpp.user_id,
  bpp.symbol,
  bpp.qty AS quantity,              -- Mapped from qty
  bpp.avg_cost AS average_cost,     -- Mapped from avg_cost
  md.current_price,
  (bpp.qty * md.current_price) AS current_value,
  ((md.current_price - bpp.avg_cost) * bpp.qty) AS unrealized_pnl
FROM bull_pen_positions bpp
LEFT JOIN market_data md ON bpp.symbol = md.symbol;
```

### View 2: trade_room_leaderboard
```sql
CREATE OR REPLACE VIEW trade_room_leaderboard AS
SELECT 
  ls.bull_pen_id,
  ls.`rank`,
  ls.user_id,
  u.name,
  ls.portfolio_value,
  ls.pnl_abs AS pnl,                -- Mapped from pnl_abs
  ls.pnl_pct AS pnl_percent,        -- Mapped from pnl_pct
  ls.snapshot_at AS created_at      -- Mapped from snapshot_at
FROM leaderboard_snapshots ls
JOIN users u ON ls.user_id = u.id
ORDER BY ls.bull_pen_id, ls.`rank`;
```

---

## 🚀 NEXT STEPS

### Run Corrected Migration
```bash
mysql -u root -p < TRADE_ROOM_DATABASE_MIGRATION.sql
```

### Verify Migration
```sql
-- Check views were created
SELECT TABLE_NAME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_TYPE = 'VIEW'
AND TABLE_NAME LIKE '%trade_room%';

-- Test views
SELECT * FROM user_trade_room_positions LIMIT 1;
SELECT * FROM trade_room_leaderboard LIMIT 1;
SELECT * FROM active_trade_rooms LIMIT 1;
```

---

## 📝 LESSONS LEARNED

1. **Always verify actual schema** before creating migration scripts
2. **Column naming conventions** vary (qty vs quantity, avg_cost vs average_cost)
3. **Indexes may already exist** in the base schema
4. **Use backticks** for reserved words like `rank`
5. **Test views** with actual data to catch column name mismatches

---

## ✅ STATUS

**Migration Script**: ✅ CORRECTED  
**All Issues**: ✅ FIXED  
**Ready to Run**: ✅ YES


