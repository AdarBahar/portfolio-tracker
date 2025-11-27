# Admin Panel Enhancements - Phase 3

## Overview

Enhanced the admin panel with comprehensive user management features including budget tracking, trading room memberships, and leaderboard standings.

## New Endpoint

### GET /api/admin/users/:id/detail

Retrieves comprehensive user information including budget status, transaction history, and trading room participation.

**Authentication**: Admin only (Bearer token)

**Response Structure**:
```json
{
  "user": {
    "id": 4,
    "email": "adarb@bahar.co.il",
    "name": "Adar Bahar",
    "authProvider": "email",
    "isDemo": false,
    "isAdmin": false,
    "status": "active",
    "createdAt": "2025-11-20T10:00:00Z",
    "lastLogin": "2025-11-26T15:30:00Z"
  },
  "budget": {
    "id": 1,
    "userId": 4,
    "availableBalance": 4750.00,
    "lockedBalance": 0.00,
    "currency": "VUSD",
    "status": "active",
    "createdAt": "2025-11-20T10:00:00Z",
    "updatedAt": "2025-11-26T15:30:00Z"
  },
  "budgetLogs": [
    {
      "id": 10,
      "userId": 4,
      "direction": "IN",
      "operationType": "ADJUSTMENT_CREDIT",
      "amount": 200.00,
      "currency": "VUSD",
      "balanceBefore": 4550.00,
      "balanceAfter": 4750.00,
      "bullPenId": null,
      "seasonId": null,
      "correlationId": "admin-adjust-001",
      "createdAt": "2025-11-21T10:00:00Z"
    }
    // ... up to 10 most recent transactions
  ],
  "tradingRooms": [
    {
      "id": 1,
      "name": "Tech Stock Showdown",
      "state": "completed",
      "startingCash": 500.00,
      "hostUserId": 1,
      "startTime": "2025-11-01T09:00:00Z",
      "durationSec": 86400,
      "role": "player",
      "status": "active",
      "cash": 500.00,
      "joinedAt": "2025-11-01T08:30:00Z"
    }
    // ... all rooms user is member of
  ],
  "standings": [
    {
      "bullPenId": 1,
      "bullPenName": "Tech Stock Showdown",
      "rank": 1,
      "portfolioValue": 1250.00,
      "pnlAbs": 750.00,
      "pnlPct": 150.00
    }
    // ... standings in active/completed rooms
  ]
}
```

## Data Included

### User Information
- Basic profile (id, email, name)
- Authentication provider
- Admin status
- Account status
- Creation and last login timestamps

### Budget Information
- Current available balance
- Locked balance (pending operations)
- Currency
- Budget status (active/frozen)
- Last 10 budget transactions with:
  - Direction (IN/OUT/LOCK/UNLOCK)
  - Operation type (ROOM_BUY_IN, ROOM_SETTLEMENT_WIN, TRANSFER_IN, etc.)
  - Amount and currency
  - Balance before/after
  - Associated trading room (if applicable)
  - Correlation ID for tracing

### Trading Room Memberships
- All rooms user is member of
- Room name, state, starting cash
- User's role (host/player)
- Membership status (pending/active/kicked/left)
- Current cash in room
- Join timestamp

### Leaderboard Standings
- Rank in each active/completed room
- Portfolio value
- Profit/Loss (absolute and percentage)
- Only shown for active or completed rooms

## Use Cases

### 1. User Support
Support team can quickly view user's budget status and recent transactions to help with:
- Balance inquiries
- Transaction disputes
- Refund requests
- Account issues

### 2. Fraud Detection
Admins can identify suspicious patterns:
- Unusual transaction amounts
- Rapid balance changes
- Transfers between accounts
- Multiple room entries/exits

### 3. User Performance Tracking
Monitor user's trading performance:
- Win/loss record across rooms
- Profit/loss trends
- Room participation frequency
- Leaderboard rankings

### 4. Account Management
Manage user accounts:
- View complete account history
- Verify budget consistency
- Check room participation
- Audit user activity

## Implementation Details

### Files Modified
- `backend/src/controllers/adminController.js` - Added `getUserDetail()` function
- `backend/src/routes/adminRoutes.js` - Added GET /users/:id/detail route

### Database Queries
- Fetches user profile from `users` table
- Fetches budget from `user_budgets` table
- Fetches last 10 transactions from `budget_logs` table
- Fetches room memberships from `bull_pen_memberships` and `bull_pens` tables
- Fetches standings from `leaderboard_snapshots` table

### Performance Considerations
- Queries are indexed on user_id for fast lookups
- Limits budget logs to 10 most recent entries
- Only fetches standings for active/completed rooms
- Single endpoint reduces number of API calls

## Testing

### Manual Testing
```bash
# Get user 4 details
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:4000/api/admin/users/4/detail

# Verify response includes:
# - User profile
# - Budget with $4,750 available
# - 10 budget transactions
# - 3 trading rooms
# - Standings in completed/active rooms
```

### Load Test Data
```bash
# Load fake data for user 4
mysql -u root -p portfolio_tracker < backend/scripts/load-fake-data.sql

# Verify data loaded
mysql -u root -p portfolio_tracker -e "SELECT * FROM user_budgets WHERE user_id = 4;"
mysql -u root -p portfolio_tracker -e "SELECT * FROM budget_logs WHERE user_id = 4 LIMIT 10;"
mysql -u root -p portfolio_tracker -e "SELECT * FROM bull_pen_memberships WHERE user_id = 4;"
```

## Fake Data Script

### Location
`backend/scripts/load-fake-data.sql`

### What It Creates
For user 4 (adarb@bahar.co.il):
- Budget: $5,000 initial, $4,750 current
- 10 budget transactions showing:
  - Initial credit
  - Room buy-ins
  - Room settlements (win/loss)
  - Transfers
  - Admin adjustments
- 3 trading rooms:
  - Room 1: Completed (user won, ranked 1st)
  - Room 2: Completed (user lost, ranked 3rd)
  - Room 3: Active (user ranked 2nd)
- Stock positions in active room (AAPL, MSFT, GOOGL)
- Order history in active room

### How to Use
```bash
# Load fake data
mysql -u root -p portfolio_tracker < backend/scripts/load-fake-data.sql

# Verify user 4 has budget
mysql -u root -p portfolio_tracker -e "SELECT * FROM user_budgets WHERE user_id = 4;"

# Check budget transactions
mysql -u root -p portfolio_tracker -e "SELECT * FROM budget_logs WHERE user_id = 4 ORDER BY created_at DESC;"

# View trading rooms
mysql -u root -p portfolio_tracker -e "SELECT * FROM bull_pen_memberships WHERE user_id = 4;"
```

## Future Enhancements

- [ ] Add budget adjustment UI (admin can credit/debit user)
- [ ] Add transaction filtering (by date, type, amount)
- [ ] Add export functionality (CSV, PDF)
- [ ] Add user search and filtering
- [ ] Add bulk operations (freeze multiple accounts, etc.)
- [ ] Add real-time notifications for large transactions
- [ ] Add reconciliation reports
- [ ] Add user activity timeline

