# Schema Constraint Fix: Budget Logs Direction

## Issue

The fake data script failed with:
```
#4025 - CONSTRAINT `chk_budget_logs_direction` failed
```

## Root Cause

The `budget_logs` table had a constraint that only allowed `'IN'` or `'OUT'` as direction values:

```sql
CONSTRAINT chk_budget_logs_direction CHECK (direction IN ('IN', 'OUT'))
```

However, the budget service implementation uses `'LOCK'` and `'UNLOCK'` directions for lock/unlock operations, causing a mismatch between the schema and the implementation.

## Solution

Updated the schema constraint to include all valid direction values:

**Before:**
```sql
CONSTRAINT chk_budget_logs_direction CHECK (direction IN ('IN', 'OUT'))
```

**After:**
```sql
CONSTRAINT chk_budget_logs_direction CHECK (direction IN ('IN', 'OUT', 'LOCK', 'UNLOCK'))
```

## Valid Direction Values

The `direction` column in `budget_logs` now supports:

1. **'IN'** - Money coming into the budget
   - INITIAL_CREDIT
   - ROOM_SETTLEMENT_WIN
   - ROOM_SETTLEMENT_LOSS
   - TRANSFER_IN
   - ADJUSTMENT_CREDIT

2. **'OUT'** - Money going out of the budget
   - ROOM_BUY_IN
   - TRANSFER_OUT
   - ADJUSTMENT_DEBIT

3. **'LOCK'** - Funds moved from available to locked
   - ROOM_BUY_IN_LOCK
   - Other lock operations

4. **'UNLOCK'** - Funds moved from locked back to available
   - ROOM_BUY_IN_UNLOCK
   - Other unlock operations

## Files Updated

1. `schema.mysql.sql` - Updated constraint to allow LOCK and UNLOCK

## Migration Required

If you have an existing database, you need to update the constraint:

```sql
-- Drop the old constraint
ALTER TABLE budget_logs DROP CONSTRAINT chk_budget_logs_direction;

-- Add the new constraint
ALTER TABLE budget_logs ADD CONSTRAINT chk_budget_logs_direction 
  CHECK (direction IN ('IN', 'OUT', 'LOCK', 'UNLOCK'));
```

## Verification

After applying the schema update, verify the constraint:

```sql
-- Check the constraint definition
SELECT CONSTRAINT_NAME, CHECK_CLAUSE 
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
WHERE TABLE_NAME = 'budget_logs' AND CONSTRAINT_NAME = 'chk_budget_logs_direction';
```

Expected output:
```
+---------------------------+--------------------------------------------------+
| CONSTRAINT_NAME           | CHECK_CLAUSE                                     |
+---------------------------+--------------------------------------------------+
| chk_budget_logs_direction | direction IN ('IN','OUT','LOCK','UNLOCK')       |
+---------------------------+--------------------------------------------------+
```

## Next Steps

1. Apply the schema update to your database
2. Run the fake data script again
3. Verify the data loaded successfully

## Related Issues

This fix resolves the schema/implementation mismatch where:
- The budget service was using LOCK/UNLOCK directions
- The schema constraint was rejecting these values
- The fake data script was failing

Now both the schema and implementation are aligned.

