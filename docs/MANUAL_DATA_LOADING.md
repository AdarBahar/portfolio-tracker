# Manual Data Loading Guide

## Overview

The fake data script is ready to load, but requires direct database access. This guide provides multiple methods to load the test data.

## Method 1: Direct MySQL Command (Recommended)

If you have direct access to the database server:

```bash
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p baharc5_fantasyBroker < backend/scripts/load-fake-data.sql
```

When prompted, enter the password from `backend/.env` (DB_PASSWORD).

## Method 2: Using phpMyAdmin or Database GUI

1. Open your database management tool (phpMyAdmin, MySQL Workbench, etc.)
2. Connect to: `213.165.242.8:3306`
3. Database: `baharc5_fantasyBroker`
4. Username: `baharc5_fantasyBroker`
5. Password: (from backend/.env)
6. Open the SQL editor
7. Copy and paste the contents of `backend/scripts/load-fake-data.sql`
8. Execute the script

## Method 3: Using Backend API (After Schema Update)

Once the schema is updated with the LOCK/UNLOCK direction constraint:

```bash
# 1. First, apply the schema update
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p baharc5_fantasyBroker << 'EOF'
ALTER TABLE budget_logs DROP CONSTRAINT chk_budget_logs_direction;
ALTER TABLE budget_logs ADD CONSTRAINT chk_budget_logs_direction 
  CHECK (direction IN ('IN', 'OUT', 'LOCK', 'UNLOCK'));
EOF

# 2. Then load the fake data
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p baharc5_fantasyBroker < backend/scripts/load-fake-data.sql
```

## Verification

After loading the data, verify it was successful:

```bash
# Check user 4 exists
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p baharc5_fantasyBroker -e \
  "SELECT id, email, auth_provider, is_demo FROM users WHERE id = 4;"

# Check budget was created
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p baharc5_fantasyBroker -e \
  "SELECT * FROM user_budgets WHERE user_id = 4;"

# Check budget logs
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p baharc5_fantasyBroker -e \
  "SELECT COUNT(*) as transaction_count FROM budget_logs WHERE user_id = 4;"

# Check trading rooms
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p baharc5_fantasyBroker -e \
  "SELECT COUNT(*) as room_count FROM bull_pen_memberships WHERE user_id = 4;"
```

## Expected Results

After successful loading:

- ✅ User 4 (adarb@bahar.co.il) exists as demo account
- ✅ Budget: $5,000 initial → $4,750 current
- ✅ 10 budget transactions
- ✅ 3 trading room memberships
- ✅ Leaderboard standings in each room

## Testing the Admin API

Once data is loaded, test the admin endpoint:

```bash
# Get user 4 details
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:4000/api/admin/users/4/detail
```

Expected response includes:
- User profile
- Budget status
- Last 10 transactions
- Trading rooms
- Leaderboard standings

## Troubleshooting

### Access Denied Error
- Verify credentials in `backend/.env`
- Check if your IP is whitelisted on the remote database
- Try connecting from the server where the backend is running

### Constraint Errors
- Ensure schema has been updated with LOCK/UNLOCK directions
- Run the schema migration first

### Data Not Appearing
- Verify the script executed without errors
- Check that the database name is correct
- Verify user 4 exists before checking related tables

## Next Steps

1. Load the fake data using one of the methods above
2. Verify the data was loaded successfully
3. Test the admin API endpoint
4. Proceed with Phase 3 continuation tasks

