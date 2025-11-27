# Production Fix: Add deleted_at Columns

## 🔴 Problem

The portfolio tables exist but are missing the `deleted_at` column that the controllers expect for soft deletes.

**Error**: `Error: Unknown column 'deleted_at' in 'WHERE'`

---

## ✅ Solution

Run this script to add the `deleted_at` column to all three tables:

```bash
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker < backend/scripts/production-add-deleted-at-columns.sql
```

---

## 📋 What Gets Added

1. **holdings** - Adds `deleted_at DATETIME NULL` after `updated_at`
2. **dividends** - Adds `deleted_at DATETIME NULL` after `created_at`
3. **transactions** - Adds `deleted_at DATETIME NULL` after `created_at`

---

## 🚀 After Running the Script

1. **Verify columns were added**:
```bash
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "DESCRIBE holdings; DESCRIBE dividends; DESCRIBE transactions;"
```

2. **Refresh the browser** at https://www.bahar.co.il/fantasybroker/

3. **Expected result**: 
   - Dashboard loads without 500 errors ✅
   - No more "Unknown column 'deleted_at'" errors ✅
   - Portfolio data displays correctly ✅

---

**Status**: Ready to deploy! 🚀

