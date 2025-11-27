# Fixes and Corrections - Phase 3 Implementation

## Summary

During Phase 3 implementation, two constraint issues were discovered and fixed:

1. **User Auth Provider Constraint** - Fixed fake data script
2. **Budget Logs Direction Constraint** - Fixed schema

## Fix 1: User Auth Provider Constraint

### Issue
```
#4025 - CONSTRAINT `chk_valid_auth` failed
```

### Root Cause
The `users` table constraint required:
- `auth_provider = 'email'` → must have `password_hash`
- `auth_provider = 'google'` → must have `google_id`
- `auth_provider = 'demo'` → must have `is_demo = TRUE`

The fake data script used `auth_provider = 'email'` without providing a password hash.

### Solution
Changed user creation to use `auth_provider = 'demo'` with `is_demo = 1`:

```sql
-- Before
INSERT IGNORE INTO users (id, email, name, auth_provider, is_admin, created_at, last_login)
VALUES (4, 'adarb@bahar.co.il', 'Adar Bahar', 'email', 0, NOW(), NOW());

-- After
INSERT IGNORE INTO users (id, email, name, auth_provider, is_demo, is_admin, created_at, last_login)
VALUES (4, 'adarb@bahar.co.il', 'Adar Bahar', 'demo', 1, 0, NOW(), NOW());
```

### Files Updated
- `backend/scripts/load-fake-data.sql` - Fixed user creation
- `backend/scripts/README.md` - Updated documentation

## Fix 2: Budget Logs Direction Constraint

### Issue
```
#4025 - CONSTRAINT `chk_budget_logs_direction` failed
```

### Root Cause
The `budget_logs` table constraint only allowed `'IN'` or `'OUT'`:
```sql
CONSTRAINT chk_budget_logs_direction CHECK (direction IN ('IN', 'OUT'))
```

But the budget service implementation uses `'LOCK'` and `'UNLOCK'` for lock/unlock operations, causing a schema/implementation mismatch.

### Solution
Updated the schema constraint to include all valid direction values:

```sql
-- Before
CONSTRAINT chk_budget_logs_direction CHECK (direction IN ('IN', 'OUT'))

-- After
CONSTRAINT chk_budget_logs_direction CHECK (direction IN ('IN', 'OUT', 'LOCK', 'UNLOCK'))
```

### Valid Direction Values

1. **'IN'** - Money coming in
   - INITIAL_CREDIT
   - ROOM_SETTLEMENT_WIN
   - ROOM_SETTLEMENT_LOSS
   - TRANSFER_IN
   - ADJUSTMENT_CREDIT

2. **'OUT'** - Money going out
   - ROOM_BUY_IN
   - TRANSFER_OUT
   - ADJUSTMENT_DEBIT

3. **'LOCK'** - Funds locked
   - ROOM_BUY_IN_LOCK

4. **'UNLOCK'** - Funds unlocked
   - ROOM_BUY_IN_UNLOCK

### Files Updated
- `schema.mysql.sql` - Updated constraint

### Migration for Existing Databases

If you have an existing database, apply this migration:

```sql
-- Drop the old constraint
ALTER TABLE budget_logs DROP CONSTRAINT chk_budget_logs_direction;

-- Add the new constraint
ALTER TABLE budget_logs ADD CONSTRAINT chk_budget_logs_direction 
  CHECK (direction IN ('IN', 'OUT', 'LOCK', 'UNLOCK'));
```

## Testing

After applying both fixes, the fake data script should load successfully:

```bash
mysql -u root -p portfolio_tracker < backend/scripts/load-fake-data.sql
```

Verify the data:

```bash
# Check user 4
mysql -u root -p portfolio_tracker -e \
  "SELECT id, email, auth_provider, is_demo FROM users WHERE id = 4;"

# Check budget
mysql -u root -p portfolio_tracker -e \
  "SELECT * FROM user_budgets WHERE user_id = 4;"

# Check budget logs
mysql -u root -p portfolio_tracker -e \
  "SELECT * FROM budget_logs WHERE user_id = 4 LIMIT 5;"
```

## Documentation

- `docs/FAKE_DATA_FIX.md` - Details on user auth provider fix
- `docs/SCHEMA_CONSTRAINT_FIX.md` - Details on budget logs direction fix
- `docs/FIXES_AND_CORRECTIONS.md` - This file

## Status

✅ Both fixes applied
✅ Schema updated
✅ Fake data script corrected
✅ Documentation updated
✅ Ready for testing

## Next Steps

1. Apply schema update to database
2. Run fake data script
3. Verify data loaded successfully
4. Test admin API endpoint
5. Proceed with Phase 3 continuation tasks

