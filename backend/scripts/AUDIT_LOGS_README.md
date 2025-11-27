# Audit Logs for User 4 (adarb@bahar.co.il)

## Overview

The `load-fake-audit-logs.sql` script generates a comprehensive and realistic audit trail for user 4 spanning the past 2 weeks. The logs document the complete user journey from account creation through active trading.

## What's Included

### Total Logs: 39 entries

**Distribution by Category:**
- **Transaction Events (26)**: Room joins, order placements, order fills, rank changes, room completions
- **Budget Events (8)**: Budget assignments, buy-ins, settlements, unlocks
- **Authentication Events (3)**: Account creation, logins
- **Profile Events (2)**: Profile creation, portfolio views

## Timeline (Past 2 Weeks)

### Week 1: Account Setup & First Room

**Day 1 (14 days ago):**
- Account registration via demo auth
- First login
- Profile initialization
- Initial budget assignment: 5000 VUSD

**Day 2-5 (13-10 days ago):**
- Joined "Tech Stock Showdown" (Room 1)
- Placed buy orders: AAPL (10 shares), MSFT (5 shares)
- Rank progression: 3rd → 2nd → 1st place
- **Room completed: WON** - 750 VUSD prize
- Final balance: 5250 VUSD

### Week 2: Multiple Rooms & Active Trading

**Day 6-10 (9-5 days ago):**
- Joined "Market Movers Challenge" (Room 2)
- Placed buy order: GOOGL (8 shares)
- Placed sell order: GOOGL (5 shares)
- Rank progression: 5th → 4th → 3rd place
- **Room completed: LOST** - 250 VUSD loss
- Final balance: 4750 VUSD

**Day 11-14 (4-1 days ago):**
- Joined "Growth Stocks Battle" (Room 3) - **ACTIVE**
- Placed buy orders: TSLA (15 shares), NVDA (20 shares)
- Placed sell order: TSLA (10 shares)
- Rank progression: 6th → 2nd → 1st → 2nd place
- Current status: 2nd place, actively trading

## Event Types

### Authentication
- `ACCOUNT_CREATED` - Initial account setup
- `LOGIN` - User login events

### Profile
- `PROFILE_CREATED` - Profile initialization
- `PORTFOLIO_VIEWED` - Portfolio access

### Budget
- `BUDGET_ASSIGNED` - Initial budget allocation
- `BUDGET_LOCKED` - Buy-in for room participation
- `BUDGET_UNLOCKED` - Return of buy-in after room completion
- `SETTLEMENT_PROCESSED` - Win/loss settlement

### Transaction
- `ROOM_JOINED` - User joins a trading room
- `ROOM_COMPLETED` - Trading room session ends
- `ORDER_PLACED` - User places a buy/sell order
- `ORDER_FILLED` - Order execution confirmation
- `RANK_CHANGED` - Leaderboard position update

## Data Consistency

All audit logs are consistent with:
- **User Budget**: Reflects actual balance changes from room settlements
- **Trading Rooms**: References real rooms (IDs 1, 2, 3)
- **Timestamps**: Realistic progression over 14 days
- **IP Addresses**: Simulated client IPs (192.168.1.100-113)
- **Event Descriptions**: Human-readable, detailed descriptions

## How to Use

### Load the Audit Logs

```bash
mysql -u root portfolio_tracker < backend/scripts/load-fake-audit-logs.sql
```

### Verify the Data

```bash
# Count total logs
mysql -u root portfolio_tracker -e "SELECT COUNT(*) FROM user_audit_log WHERE user_id = 4;"

# View recent logs
mysql -u root portfolio_tracker -e "SELECT * FROM user_audit_log WHERE user_id = 4 ORDER BY created_at DESC LIMIT 20;"

# View logs by category
mysql -u root portfolio_tracker -e "SELECT event_category, COUNT(*) FROM user_audit_log WHERE user_id = 4 GROUP BY event_category;"
```

### View in Admin Panel

1. Navigate to the admin panel
2. Click on user "Adar Bahar" (ID: 4)
3. Scroll to the "Audit Logs" section
4. Use filters to search by:
   - Free text (event type, description)
   - Transaction type (authentication, budget, transaction, profile)
   - Star rating (if implemented)

## Notes

- All timestamps are relative to `NOW()` for consistency
- The script uses `DELETE FROM user_audit_log WHERE user_id = 4` to clean existing logs
- IP addresses are simulated and increment throughout the timeline
- Event descriptions are detailed and realistic
- All numeric values (shares, prices, amounts) are realistic for stock trading

## Related Files

- `load-fake-data.sql` - Creates user, budget, trading rooms, and leaderboard data
- `schema.mysql.sql` - Database schema including `user_audit_log` table
- `admin.html` - Admin panel UI
- `user-detail.html` - User detail page with audit logs display

