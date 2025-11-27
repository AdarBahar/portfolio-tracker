# Database Scripts

This directory contains SQL scripts for database management and testing.

## load-fake-data.sql

Loads comprehensive test data for user ID 4 (adarb@bahar.co.il) including budget, transactions, and trading room participation.

### What Gets Created

**User 4 (adarb@bahar.co.il)**
- Email: adarb@bahar.co.il
- Name: Adar Bahar
- Auth Provider: demo (test user)
- Admin: No
- Demo Account: Yes

**Budget**
- Available Balance: $4,750.00
- Locked Balance: $0.00
- Currency: VUSD
- Status: active

**Budget Transactions (10 entries)**
1. Initial credit: +$5,000.00
2. Room 1 buy-in: -$500.00
3. Room 1 settlement (win): +$750.00
4. Room 2 buy-in: -$500.00
5. Room 2 settlement (loss): +$250.00
6. Room 3 buy-in: -$500.00
7. Room 3 lock: -$500.00 (locked)
8. Transfer in: +$100.00
9. Transfer out: -$50.00
10. Admin adjustment: +$200.00

**Trading Rooms (3 rooms)**

Room 1: Tech Stock Showdown
- State: completed
- Host: User 1
- Starting Cash: $500.00
- User 4 Role: player
- User 4 Rank: 1st (won)
- Portfolio Value: $1,250.00
- P&L: +$750.00 (+150%)

Room 2: Blue Chip Battle
- State: completed
- Host: User 2
- Starting Cash: $500.00
- User 4 Role: player
- User 4 Rank: 3rd (lost)
- Portfolio Value: $750.00
- P&L: +$250.00 (+50%)

Room 3: Growth Stock Challenge
- State: active
- Host: User 3
- Starting Cash: $500.00
- User 4 Role: player
- User 4 Rank: 2nd (ongoing)
- Portfolio Value: $1,100.00
- P&L: +$600.00 (+120%)

**Stock Positions (in Room 3)**
- AAPL: 10.5 shares @ $150.00 avg cost
- MSFT: 5.0 shares @ $300.00 avg cost
- GOOGL: 2.5 shares @ $140.00 avg cost

**Orders (in Room 3)**
- AAPL buy: 10.5 shares @ $150.00 (filled)
- MSFT buy: 5.0 shares @ $300.00 (filled)
- GOOGL buy: 2.5 shares @ $140.00 (filled)

### How to Use

#### Prerequisites
- MySQL/MariaDB running
- Database created: `portfolio_tracker`
- Schema already loaded: `schema.mysql.sql`

#### Load the Data
```bash
# From project root
mysql -u root -p portfolio_tracker < backend/scripts/load-fake-data.sql

# Or with password in command (not recommended for production)
mysql -u root -pYOUR_PASSWORD portfolio_tracker < backend/scripts/load-fake-data.sql
```

#### Verify Data Loaded
```bash
# Check user exists
mysql -u root -p portfolio_tracker -e "SELECT * FROM users WHERE id = 4;"

# Check budget
mysql -u root -p portfolio_tracker -e "SELECT * FROM user_budgets WHERE user_id = 4;"

# Check budget transactions
mysql -u root -p portfolio_tracker -e "SELECT * FROM budget_logs WHERE user_id = 4 ORDER BY created_at DESC;"

# Check trading rooms
mysql -u root -p portfolio_tracker -e "SELECT * FROM bull_pen_memberships WHERE user_id = 4;"

# Check leaderboard standings
mysql -u root -p portfolio_tracker -e "SELECT * FROM leaderboard_snapshots WHERE user_id = 4;"

# Check positions
mysql -u root -p portfolio_tracker -e "SELECT * FROM bull_pen_positions WHERE user_id = 4;"

# Check orders
mysql -u root -p portfolio_tracker -e "SELECT * FROM bull_pen_orders WHERE user_id = 4;"
```

#### Test Admin API
```bash
# Get user 4 details (requires admin token)
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:4000/api/admin/users/4/detail

# Expected response includes:
# - User profile
# - Budget: $4,750.00 available
# - 10 budget transactions
# - 3 trading rooms
# - Standings in completed/active rooms
```

### Idempotency

The script uses `INSERT ... ON DUPLICATE KEY UPDATE` for the budget table, making it safe to run multiple times. Other inserts will fail if data already exists (which is expected).

To reload data, delete existing records first:
```bash
DELETE FROM budget_logs WHERE user_id = 4;
DELETE FROM user_budgets WHERE user_id = 4;
DELETE FROM bull_pen_memberships WHERE user_id = 4;
DELETE FROM leaderboard_snapshots WHERE user_id = 4;
DELETE FROM bull_pen_positions WHERE user_id = 4;
DELETE FROM bull_pen_orders WHERE user_id = 4;
DELETE FROM bull_pens WHERE host_user_id IN (1, 2, 3);
```

### Notes

- Timestamps are relative to NOW() for consistency
- Room 1 and 2 are in the past (completed)
- Room 3 is active (started 14 days ago, 7-day duration)
- User 4 has realistic trading performance (1 win, 1 loss, 1 ongoing)
- Budget transactions show various operation types for testing
- Correlation IDs link transactions to rooms for audit trail

### Customization

To modify the script for different users or amounts:
1. Replace `4` with desired user ID
2. Replace `adarb@bahar.co.il` with desired email
3. Adjust balance amounts in budget INSERT
4. Modify transaction amounts and types as needed
5. Change room names and parameters
6. Adjust timestamps as needed

