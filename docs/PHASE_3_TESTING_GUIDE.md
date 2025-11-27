# Phase 3 Testing Guide

## Overview

Comprehensive testing guide for all Phase 3 features: settlement, cancellation, rake, and bonuses.

## Prerequisites

1. Database migrated with Phase 3 schema
2. Default rake configuration created
3. Sample promotions created
4. Fake data loaded (optional but recommended)
5. Backend server running

## Test 1: Settlement Flow

### Setup
```bash
# Load fake data
mysql -u root -p portfolio_tracker < backend/scripts/load-fake-data.sql

# Verify user 4 exists
mysql -u root -p portfolio_tracker -e "SELECT * FROM users WHERE id = 4;"
```

### Test Steps

1. **Verify Room Exists**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT id, name, state FROM bull_pens LIMIT 1;"
   ```

2. **Check Initial Budget**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM user_budgets WHERE user_id = 4;"
   ```

3. **Trigger Settlement** (via API or manual)
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <internal-token>" \
     http://localhost:4000/internal/v1/settlement/rooms/1
   ```

4. **Verify Settlement Executed**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT settlement_status FROM bull_pens WHERE id = 1;"
   ```

5. **Check Budget Updated**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM user_budgets WHERE user_id = 4;"
   ```

6. **Verify Budget Logs**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM budget_logs WHERE user_id = 4 AND operation_type LIKE 'ROOM_SETTLEMENT%';"
   ```

### Expected Results
- ✅ Settlement status changed to 'completed'
- ✅ User budget increased (if won) or decreased (if lost)
- ✅ Budget logs created with ROOM_SETTLEMENT_WIN/LOSS/BREAKEVEN
- ✅ Correlation IDs match room settlement

## Test 2: Rake Collection

### Setup
```bash
# Verify rake config exists
mysql -u root -p portfolio_tracker -e "SELECT * FROM rake_config WHERE is_active = TRUE;"
```

### Test Steps

1. **Check Rake Configuration**
   ```bash
   curl -X GET \
     -H "Authorization: Bearer <admin-token>" \
     http://localhost:4000/api/admin/rake/config
   ```

2. **Settle Room (triggers rake collection)**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <internal-token>" \
     http://localhost:4000/internal/v1/settlement/rooms/1
   ```

3. **Verify Rake Collected**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM rake_collection WHERE bull_pen_id = 1;"
   ```

4. **Check Rake Statistics**
   ```bash
   curl -X GET \
     -H "Authorization: Bearer <admin-token>" \
     http://localhost:4000/api/admin/rake/stats
   ```

### Expected Results
- ✅ Rake collected from pool
- ✅ Rake amount calculated correctly (5% of pool)
- ✅ Rake collection logged
- ✅ Statistics show total rake collected

## Test 3: Bonus Redemption

### Setup
```bash
# Verify promotions exist
mysql -u root -p portfolio_tracker -e "SELECT * FROM promotions WHERE is_active = TRUE;"
```

### Test Steps

1. **Get Available Promotions**
   ```bash
   curl -X GET \
     -H "Authorization: Bearer <admin-token>" \
     http://localhost:4000/api/admin/promotions
   ```

2. **Redeem Promotion**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <user-token>" \
     -H "Content-Type: application/json" \
     -d '{"code": "WELCOME100"}' \
     http://localhost:4000/api/v1/bonus/redeem
   ```

3. **Verify Redemption**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM bonus_redemptions WHERE user_id = 4;"
   ```

4. **Check Budget Credited**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM user_budgets WHERE user_id = 4;"
   ```

5. **Verify Budget Log**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM budget_logs WHERE user_id = 4 AND operation_type = 'BONUS_REDEMPTION';"
   ```

6. **Try Duplicate Redemption (should fail)**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <user-token>" \
     -H "Content-Type: application/json" \
     -d '{"code": "WELCOME100"}' \
     http://localhost:4000/api/v1/bonus/redeem
   ```

### Expected Results
- ✅ Promotion redeemed successfully
- ✅ Budget credited with bonus amount
- ✅ Bonus redemption logged
- ✅ Duplicate redemption rejected with ALREADY_REDEEMED error

## Test 4: Room Cancellation

### Setup
```bash
# Create test room in draft state
mysql -u root -p portfolio_tracker -e "INSERT INTO bull_pens (name, state, buy_in, duration_minutes) VALUES ('Test Cancel Room', 'draft', 100, 60);"
```

### Test Steps

1. **Add Members to Room**
   ```bash
   # Add user 4 to room
   mysql -u root -p portfolio_tracker -e "INSERT INTO bull_pen_memberships (bull_pen_id, user_id, role, status) VALUES (1, 4, 'member', 'active');"
   ```

2. **Check Initial Budget**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM user_budgets WHERE user_id = 4;"
   ```

3. **Cancel Room**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <internal-token>" \
     http://localhost:4000/internal/v1/cancellation/rooms/1
   ```

4. **Verify Cancellation**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT state FROM bull_pens WHERE id = 1;"
   ```

5. **Check Membership Status**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT status FROM bull_pen_memberships WHERE bull_pen_id = 1;"
   ```

6. **Verify Refund**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM budget_logs WHERE user_id = 4 AND operation_type = 'ROOM_CANCELLATION_REFUND';"
   ```

### Expected Results
- ✅ Room state changed to 'cancelled'
- ✅ Membership status changed to 'cancelled'
- ✅ User budget refunded
- ✅ Refund logged in budget_logs

## Test 5: Member Kick

### Setup
```bash
# Create test room with members
mysql -u root -p portfolio_tracker -e "INSERT INTO bull_pens (name, state, buy_in, duration_minutes) VALUES ('Test Kick Room', 'draft', 100, 60);"
mysql -u root -p portfolio_tracker -e "INSERT INTO bull_pen_memberships (bull_pen_id, user_id, role, status) VALUES (2, 4, 'member', 'active');"
```

### Test Steps

1. **Kick Member**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <internal-token>" \
     http://localhost:4000/internal/v1/cancellation/rooms/2/members/4
   ```

2. **Verify Membership Status**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT status FROM bull_pen_memberships WHERE bull_pen_id = 2 AND user_id = 4;"
   ```

3. **Verify Refund**
   ```bash
   mysql -u root -p portfolio_tracker -e "SELECT * FROM budget_logs WHERE user_id = 4 AND operation_type = 'ROOM_MEMBER_KICK_REFUND';"
   ```

### Expected Results
- ✅ Membership status changed to 'kicked'
- ✅ User budget refunded
- ✅ Refund logged

## Verification Checklist

- [ ] All settlement tests passed
- [ ] All rake collection tests passed
- [ ] All bonus redemption tests passed
- [ ] All cancellation tests passed
- [ ] All member kick tests passed
- [ ] No errors in application logs
- [ ] All budget logs created correctly
- [ ] All correlation IDs match events
- [ ] Idempotency keys prevent duplicates

## Troubleshooting

### Settlement Not Executing
- Check room state is 'completed'
- Check settlement_status is 'pending'
- Check background job is running
- Check application logs for errors

### Rake Not Collected
- Check rake_config exists and is active
- Check pool size meets min_pool requirement
- Check rake_collection table for entries

### Bonus Not Redeemed
- Check promotion exists and is active
- Check promotion dates are valid
- Check user hasn't already redeemed
- Check account age meets requirement

### Cancellation Failing
- Check room state is 'draft' or 'scheduled'
- Check all members exist
- Check budget is sufficient for refunds

