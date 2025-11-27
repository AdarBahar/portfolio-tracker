# Fake Data Script Fix

## Issue

The initial fake data script failed with:
```
#4025 - CONSTRAINT `chk_valid_auth` failed for `baharc5_fantasyBroker`.`users`
```

## Root Cause

The `users` table has a constraint `chk_valid_auth` that requires:
- For `auth_provider = 'email'`: Must have a `password_hash`
- For `auth_provider = 'google'`: Must have a `google_id`
- For `auth_provider = 'demo'`: Must have `is_demo = TRUE`

The original script used `auth_provider = 'email'` without providing a `password_hash`, violating the constraint.

## Solution

Changed the user creation to use `auth_provider = 'demo'` with `is_demo = 1`:

**Before:**
```sql
INSERT IGNORE INTO users (id, email, name, auth_provider, is_admin, created_at, last_login)
VALUES (4, 'adarb@bahar.co.il', 'Adar Bahar', 'email', 0, NOW(), NOW());
```

**After:**
```sql
INSERT IGNORE INTO users (id, email, name, auth_provider, is_demo, is_admin, created_at, last_login)
VALUES (4, 'adarb@bahar.co.il', 'Adar Bahar', 'demo', 1, 0, NOW(), NOW());
```

## Benefits

- ✅ Satisfies the `chk_valid_auth` constraint
- ✅ No need to generate password hashes
- ✅ Perfect for test/demo data
- ✅ User 4 is now a demo account for testing

## Files Updated

1. `backend/scripts/load-fake-data.sql` - Fixed user creation
2. `backend/scripts/README.md` - Updated documentation

## How to Use

The script is now ready to use:

```bash
mysql -u root -p portfolio_tracker < backend/scripts/load-fake-data.sql
```

## Verification

After running the script, verify user 4 was created:

```bash
mysql -u root -p portfolio_tracker -e "SELECT id, email, name, auth_provider, is_demo FROM users WHERE id = 4;"
```

Expected output:
```
+----+---------------------+------------+---------------+--------+
| id | email               | name       | auth_provider | is_demo|
+----+---------------------+------------+---------------+--------+
| 4  | adarb@bahar.co.il   | Adar Bahar | demo          | 1      |
+----+---------------------+------------+---------------+--------+
```

## Next Steps

1. Run the fake data script
2. Verify user 4 and budget data
3. Test admin API endpoint
4. Verify trading room data

