# Production Fix - Rake Config Missing Columns

**Issue**: `#1054 - Unknown column 'name' in 'INSERT INTO'`

**Root Cause**: The production `rake_config` table exists but is missing the `name` and `description` columns.

---

## 🔧 Quick Fix

Run this command on production:

```bash
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker < backend/scripts/production-fix-rake-config.sql
```

This script will:
1. Add `name` column if missing
2. Add `description` column if missing
3. Insert default rake configuration
4. Verify the data

---

## 📋 What Happened

The production database had an older version of the `rake_config` table that was created without the `name` and `description` columns. The schema migration script created the table with `IF NOT EXISTS`, so it didn't update the existing table.

---

## ✅ Verification

After running the fix, verify with:

```bash
# Check rake_config structure
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "DESCRIBE rake_config;"

# Check rake_config data
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "SELECT * FROM rake_config;"
```

Expected output:
```
id | name | description | fee_type | fee_value | min_pool | max_pool | is_active | created_at | updated_at
1  | Default Rake Config | Default 5% percentage fee for all rooms | percentage | 5.0000 | 100.00 | NULL | 1 | ... | ...
```

---

## 🚀 Next Steps

After the fix:

1. Run the updated setup script:
```bash
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker < backend/scripts/production-setup-complete.sql
```

2. Restart the backend service:
```bash
systemctl restart fantasybroker-api
```

3. Test the login endpoint:
```bash
curl https://www.bahar.co.il/fantasybroker-api/api/health
```

---

**Status**: Ready to fix

