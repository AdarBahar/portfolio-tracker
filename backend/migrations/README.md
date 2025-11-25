# Database Migrations

This directory contains database migration scripts for the Portfolio Tracker application.

## Available Migrations

### 1. Soft Delete, Status, and Audit Log (Applied)
- **Migration:** `add-soft-delete-status-audit.sql`
- **Rollback:** `rollback-soft-delete-status-audit.sql`
- **Status:** ✅ Applied to production
- **Description:** Adds soft delete functionality, user/holding status columns, and audit logging

### 2. Bull Pen Orders and Positions (Applied)
- **Migration:** `add-bull-pen-orders-positions.sql`
- **Status:** ✅ Applied to production
- **Description:** Adds tables for Bull Pen trading feature (orders, positions, market data, leaderboards)

### 3. Admin Flag Feature (NEW)
- **Migration:** `add-is-admin-column.sql`
- **Rollback:** `rollback-is-admin-column.sql`
- **Status:** ⏳ Pending application
- **Description:** Adds `is_admin` flag to users table for admin privileges
- **Guide:** `ADMIN_FEATURE_GUIDE.md`

## How to Apply Migrations

### Using MySQL Command Line

```bash
# Apply migration
mysql -u [username] -p [database_name] < backend/migrations/[migration-file].sql

# Example for admin feature
mysql -u root -p portfolio_tracker < backend/migrations/add-is-admin-column.sql
```

### Using phpMyAdmin

1. Open phpMyAdmin
2. Select your database (`portfolio_tracker`)
3. Click "SQL" tab
4. Copy and paste the contents of the migration file
5. Click "Go"

### Verification

After applying a migration, verify it was successful:

```sql
-- Check table structure
DESCRIBE users;

-- For admin feature, verify is_admin column exists
SHOW COLUMNS FROM users LIKE 'is_admin';

-- Check indexes
SHOW INDEX FROM users;
```

## Rollback Procedure

⚠️ **WARNING:** Rollbacks may result in data loss. Always backup your database first!

```bash
# Backup database first
mysqldump -u [username] -p [database_name] > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply rollback
mysql -u [username] -p [database_name] < backend/migrations/rollback-[feature].sql
```

## Migration Order

If setting up a new database, apply migrations in this order:

1. **Base Schema:** `schema.mysql.sql` (from project root)
2. **Soft Delete & Audit:** `add-soft-delete-status-audit.sql`
3. **Bull Pen Feature:** `add-bull-pen-orders-positions.sql`
4. **Admin Feature:** `add-is-admin-column.sql`

## Best Practices

1. **Always backup** before applying migrations
2. **Test migrations** on a development database first
3. **Apply migrations** during low-traffic periods
4. **Verify success** after each migration
5. **Keep rollback scripts** ready in case of issues
6. **Document changes** in migration files with comments
7. **Version control** all migration files

## Production Deployment

### Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Test migration on staging/development database
- [ ] Review migration SQL for correctness
- [ ] Prepare rollback script
- [ ] Schedule maintenance window (if needed)
- [ ] Notify team of deployment

### Deployment Steps

1. **Backup database:**
   ```bash
   mysqldump -u user -p database > backup_before_migration.sql
   ```

2. **Apply migration:**
   ```bash
   mysql -u user -p database < backend/migrations/[migration-file].sql
   ```

3. **Verify migration:**
   ```sql
   -- Check table structure
   DESCRIBE [table_name];
   
   -- Test queries
   SELECT * FROM [table_name] LIMIT 1;
   ```

4. **Deploy application code:**
   - Deploy backend code that uses new schema
   - Deploy frontend code if needed

5. **Monitor:**
   - Check application logs for errors
   - Monitor database performance
   - Test critical user flows

### Rollback Steps (if needed)

1. **Stop application** (if possible)
2. **Apply rollback script:**
   ```bash
   mysql -u user -p database < backend/migrations/rollback-[feature].sql
   ```
3. **Restore previous application version**
4. **Verify system is working**

## Migration File Naming Convention

Format: `[action]-[feature]-[description].sql`

Examples:
- `add-is-admin-column.sql`
- `rollback-is-admin-column.sql`
- `add-soft-delete-status-audit.sql`

## Documentation

Each major migration should include:
- Migration SQL file
- Rollback SQL file
- Implementation guide (markdown)
- Update to this README

## Support

For questions about migrations:
1. Check the migration's guide file (e.g., `ADMIN_FEATURE_GUIDE.md`)
2. Review the migration SQL file comments
3. Check the main database documentation in `/docs/DATABASE_SCHEMA.md`
4. Consult the project's `DATABASE_SETUP_MYSQL.md`

## Migration History

| Date | Migration | Status | Notes |
|------|-----------|--------|-------|
| 2025-11-25 | Soft Delete & Audit | ✅ Applied | Added soft delete, status columns, audit logging |
| 2025-11-25 | Bull Pen Feature | ✅ Applied | Added trading room tables |
| 2025-11-25 | Admin Flag | ⏳ Pending | Adds is_admin column to users table |

