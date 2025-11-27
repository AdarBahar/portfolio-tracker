# Phase 3 Migration Guide

## Overview

This guide walks through applying Phase 3 schema changes and setting up default configurations.

## Prerequisites

- MySQL/MariaDB access to production database
- Backup of existing database
- No active rooms or transactions during migration

## Migration Steps

### Step 1: Backup Database

```bash
mysqldump -u root -p portfolio_tracker > backup_phase3_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Schema Migration

```bash
mysql -u root -p portfolio_tracker < backend/scripts/migrate-phase3.sql
```

**What this does:**
- Adds `settlement_status` column to `bull_pens` table
- Updates `bull_pens.state` constraint to include 'cancelled'
- Updates `bull_pen_memberships.status` constraint to include 'cancelled' and 'kicked'
- Creates `rake_config` table
- Creates `rake_collection` table
- Creates `promotions` table
- Creates `bonus_redemptions` table

### Step 3: Setup Default Configuration

```bash
mysql -u root -p portfolio_tracker < backend/scripts/setup-defaults.sql
```

**What this does:**
- Creates default rake configuration (5% percentage fee)
- Creates 5 sample promotions:
  - WELCOME100: 100 VUSD for new users
  - REFER50: 50 VUSD for referrals
  - HOLIDAY250: 250 VUSD seasonal bonus
  - VIP200: 200 VUSD for active traders
  - FLASH75: 75 VUSD flash sale

### Step 4: Verify Migration

```bash
# Check new tables exist
mysql -u root -p portfolio_tracker -e "SHOW TABLES LIKE '%rake%' OR LIKE '%promotion%' OR LIKE '%bonus%';"

# Check rake config
mysql -u root -p portfolio_tracker -e "SELECT * FROM rake_config;"

# Check promotions
mysql -u root -p portfolio_tracker -e "SELECT * FROM promotions WHERE is_active = TRUE;"

# Check bull_pens modifications
mysql -u root -p portfolio_tracker -e "DESCRIBE bull_pens;" | grep settlement_status
```

## Rollback Procedure

If migration fails, restore from backup:

```bash
mysql -u root -p portfolio_tracker < backup_phase3_YYYYMMDD_HHMMSS.sql
```

## Migration Checklist

- [ ] Database backup created
- [ ] Schema migration applied successfully
- [ ] Default configuration created
- [ ] All tables verified to exist
- [ ] Constraints verified
- [ ] Indexes verified
- [ ] Sample data verified
- [ ] Application tested with new schema

## Post-Migration Tasks

1. **Load Fake Data** (optional, for testing):
   ```bash
   mysql -u root -p portfolio_tracker < backend/scripts/load-fake-data.sql
   ```

2. **Test Settlement Flow**:
   - Create test room
   - Wait for completion
   - Verify settlement executed
   - Check budget logs

3. **Test Bonus Redemption**:
   - Redeem WELCOME100 code
   - Verify budget credited
   - Check bonus_redemptions table

4. **Test Rake Collection**:
   - Settle room
   - Verify rake collected
   - Check rake_collection table

## Troubleshooting

### Error: "Constraint already exists"

If you get constraint errors, the migration may have been partially applied. Check:

```bash
mysql -u root -p portfolio_tracker -e "SHOW CREATE TABLE bull_pens\G"
```

### Error: "Column already exists"

If `settlement_status` column already exists, skip that step or use:

```bash
ALTER TABLE bull_pens MODIFY settlement_status VARCHAR(20) DEFAULT 'pending';
```

### Error: "Foreign key constraint fails"

Ensure all referenced tables exist:

```bash
mysql -u root -p portfolio_tracker -e "SHOW TABLES;"
```

## Files Involved

- `backend/scripts/migrate-phase3.sql` - Schema migration
- `backend/scripts/setup-defaults.sql` - Default configuration
- `backend/scripts/load-fake-data.sql` - Test data (optional)

## Timeline

- Migration: ~5 minutes
- Setup defaults: ~1 minute
- Verification: ~5 minutes
- **Total: ~15 minutes**

## Support

For issues, check:
1. `docs/ROOM_SETTLEMENT_IMPLEMENTATION.md`
2. `docs/RAKE_HOUSE_FEE_SYSTEM.md`
3. `docs/BONUS_PROMOTION_SYSTEM.md`
4. `docs/PHASE_3_COMPLETION_SUMMARY.md`

