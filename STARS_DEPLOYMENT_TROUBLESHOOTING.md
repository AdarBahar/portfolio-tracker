# 🔧 Stars System - Deployment Troubleshooting Guide

**Date**: 2025-11-27  
**Status**: Troubleshooting Guide  
**Purpose**: Help resolve common deployment issues

---

## ❌ ISSUE 1: "Unknown table 'achievement_rules' in information_schema"

### Symptoms
- Verification script fails with error: `#1109 - Unknown table 'achievement_rules' in information_schema`
- Error occurs when running verification through phpMyAdmin

### Root Cause
- Database context not set when running script through phpMyAdmin
- INFORMATION_SCHEMA queries require proper database selection

### Solution
**Option 1: Use Simple Verification Script (Recommended for phpMyAdmin)**
```bash
# Run this script instead - it's phpMyAdmin compatible
mysql -u root portfolio_tracker < backend/scripts/verify-deployment-simple.sql
```

**Option 2: Use Full Verification Script (Command Line)**
```bash
# Run from command line - includes database context
mysql -u root portfolio_tracker < backend/scripts/verify-deployment.sql
```

**Option 3: Manual Verification in phpMyAdmin**
1. Select `portfolio_tracker` database from dropdown
2. Run each query individually:
   ```sql
   SELECT COUNT(*) FROM achievement_rules;
   SELECT * FROM achievement_rules LIMIT 5;
   DESCRIBE user_star_events;
   DESCRIBE season_user_stats;
   ```

---

## ❌ ISSUE 2: "Table 'achievement_rules' doesn't exist"

### Symptoms
- Error when loading achievement rules: `#1146 - Table 'achievement_rules' doesn't exist`
- Occurs when running load-achievement-rules.sql before migration

### Root Cause
- Migration script (add-stars-system.sql) not executed first
- Tables not created yet

### Solution
**Execute in correct order:**
```bash
# Step 1: Run migration first
mysql -u root portfolio_tracker < backend/migrations/add-stars-system.sql

# Step 2: Then load rules
mysql -u root portfolio_tracker < backend/scripts/load-achievement-rules.sql

# Step 3: Verify
mysql -u root portfolio_tracker < backend/scripts/verify-deployment-simple.sql
```

---

## ❌ ISSUE 3: "You have an error in your SQL syntax"

### Symptoms
- Migration fails with syntax error
- Error mentions COALESCE or IF NOT EXISTS

### Root Cause
- Using older MySQL version that doesn't support certain syntax
- UNIQUE constraint with COALESCE not supported in MySQL 5.7
- IF NOT EXISTS in ALTER TABLE not supported

### Solution
- Migration has been fixed to be compatible with MySQL 5.7+
- Use the latest version: `backend/migrations/add-stars-system.sql`
- If still failing, check MySQL version:
  ```bash
  mysql -u root -e "SELECT VERSION();"
  ```

---

## ✅ VERIFICATION CHECKLIST

### After Running Migration
- [ ] No errors in output
- [ ] All 3 tables created:
  ```bash
  mysql -u root portfolio_tracker -e "SHOW TABLES LIKE '%star%';"
  mysql -u root portfolio_tracker -e "SHOW TABLES LIKE '%achievement%';"
  mysql -u root portfolio_tracker -e "SHOW TABLES LIKE '%season%';"
  ```

### After Loading Rules
- [ ] 12 rules loaded:
  ```bash
  mysql -u root portfolio_tracker -e "SELECT COUNT(*) FROM achievement_rules;"
  ```
- [ ] All rules visible:
  ```bash
  mysql -u root portfolio_tracker -e "SELECT code, name, stars_reward FROM achievement_rules;"
  ```

### After Verification
- [ ] All checks pass
- [ ] No errors in output
- [ ] All tables and columns present

---

## 🔍 MANUAL VERIFICATION COMMANDS

### Check Tables
```sql
-- Check if tables exist
SHOW TABLES LIKE '%star%';
SHOW TABLES LIKE '%achievement%';
SHOW TABLES LIKE '%season%';

-- Check table structure
DESCRIBE user_star_events;
DESCRIBE achievement_rules;
DESCRIBE season_user_stats;
```

### Check Columns Added
```sql
-- Check leaderboard_snapshots
DESCRIBE leaderboard_snapshots;
-- Should show: stars, score columns

-- Check bull_pens
DESCRIBE bull_pens;
-- Should show: season_id column
```

### Check Achievement Rules
```sql
-- Count rules
SELECT COUNT(*) FROM achievement_rules;

-- List all rules
SELECT code, name, stars_reward, category FROM achievement_rules;

-- Check specific rule
SELECT * FROM achievement_rules WHERE code = 'first_room_join';
```

### Check Data Integrity
```sql
-- Check for NULL values
SELECT COUNT(*) FROM user_star_events WHERE user_id IS NULL;
SELECT COUNT(*) FROM achievement_rules WHERE code IS NULL;

-- Check indexes
SHOW INDEX FROM user_star_events;
SHOW INDEX FROM achievement_rules;
SHOW INDEX FROM season_user_stats;
```

---

## 🔄 ROLLBACK PROCEDURE

If deployment fails and you need to rollback:

```bash
# Execute rollback script
mysql -u root portfolio_tracker < backend/migrations/rollback-stars-system.sql

# Verify rollback
mysql -u root portfolio_tracker -e "SHOW TABLES LIKE '%star%';"
mysql -u root portfolio_tracker -e "SHOW TABLES LIKE '%achievement%';"
```

---

## 📞 SUPPORT

### For phpMyAdmin Issues
1. Make sure `portfolio_tracker` database is selected
2. Use `verify-deployment-simple.sql` instead of `verify-deployment.sql`
3. Run queries one at a time if batch fails

### For Command Line Issues
1. Verify MySQL is running: `mysql -u root -e "SELECT 1;"`
2. Verify database exists: `mysql -u root -e "SHOW DATABASES;"`
3. Check user permissions: `mysql -u root -e "SHOW GRANTS;"`

### For Migration Issues
1. Check MySQL version: `mysql -u root -e "SELECT VERSION();"`
2. Verify migration file syntax: `cat backend/migrations/add-stars-system.sql | head -50`
3. Check for existing tables: `mysql -u root portfolio_tracker -e "SHOW TABLES;"`

---

## ✨ SUCCESSFUL DEPLOYMENT INDICATORS

✅ All 3 tables created  
✅ All 12 rules loaded  
✅ All columns added  
✅ All indexes created  
✅ No errors in verification  
✅ All data integrity checks pass  

---

**Last Updated**: 2025-11-27  
**Status**: All Issues Resolved ✅

