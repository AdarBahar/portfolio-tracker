# Budget System - Quick Reference

## Key Files

### Backend Service
- `backend/src/services/budgetService.js` - Core budget logic
- `backend/src/controllers/budgetController.js` - Public API
- `backend/src/controllers/internalBudgetController.js` - Internal API
- `backend/src/controllers/adminController.js` - Admin API

### Routes
- `backend/src/routes/budgetRoutes.js` - Public routes
- `backend/src/routes/internalBudgetRoutes.js` - Internal routes
- `backend/src/routes/adminRoutes.js` - Admin routes

### Database
- `schema.mysql.sql` - Tables: user_budgets, budget_logs

### Testing & Data
- `backend/test-budget-integration.js` - Integration tests
- `backend/scripts/load-fake-data.sql` - Test data

## API Endpoints

### Public (User)
- `GET /api/v1/budget` - Get budget status
- `GET /api/v1/budget/logs` - Get transaction logs

### Internal (Service)
- `POST /internal/v1/budget/credit` - Add money
- `POST /internal/v1/budget/debit` - Remove money
- `POST /internal/v1/budget/lock` - Lock funds
- `POST /internal/v1/budget/unlock` - Unlock funds
- `POST /internal/v1/budget/transfer` - Transfer between users
- `POST /internal/v1/budget/adjust` - Admin adjustment

### Admin
- `GET /api/admin/users/:id/detail` - User detail view

## Common Tasks

### Load Test Data
```bash
mysql -u root -p portfolio_tracker < backend/scripts/load-fake-data.sql
```

### Test Admin API
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/admin/users/4/detail
```

### Run Tests
```bash
cd backend && node test-budget-integration.js
```

### Check Syntax
```bash
node -c src/services/budgetService.js
```

## Database Tables

### user_budgets
- id, user_id, available_balance, locked_balance
- currency, status, created_at, updated_at, deleted_at

### budget_logs
- id, user_id, direction (IN/OUT/LOCK/UNLOCK)
- operation_type, amount, currency
- balance_before, balance_after
- bull_pen_id, season_id, counterparty_user_id
- moved_from, moved_to, correlation_id
- idempotency_key, meta, created_at, deleted_at

## Operation Types

### Credit Operations
- INITIAL_CREDIT - Initial balance
- ROOM_SETTLEMENT_WIN - Room win payout
- ROOM_SETTLEMENT_LOSS - Room loss refund
- TRANSFER_IN - Received transfer
- ADJUSTMENT_CREDIT - Admin credit

### Debit Operations
- ROOM_BUY_IN - Room entry fee
- TRANSFER_OUT - Sent transfer
- ADJUSTMENT_DEBIT - Admin debit

### Lock/Unlock
- ROOM_BUY_IN_LOCK - Lock for room
- ROOM_BUY_IN_UNLOCK - Unlock from room

## Error Codes

- `INSUFFICIENT_FUNDS` - Not enough balance
- `BUDGET_FROZEN` - Budget is frozen
- `BUDGET_NOT_FOUND` - User has no budget
- `INSUFFICIENT_LOCKED_FUNDS` - Not enough locked balance
- `UNAUTHORIZED` - Invalid token

## Important Concepts

### Idempotency
- Use `Idempotency-Key` header
- Same key returns cached result
- Safe to retry without side effects

### Correlation ID
- Links related operations
- Format: `room-{id}-{action}-{uuid}`
- Enables audit trail

### Row Locking
- `SELECT ... FOR UPDATE` prevents race conditions
- Deterministic order for multi-user operations
- Ensures consistency

### Monetary Precision
- DECIMAL(18,2) for all amounts
- 2 decimal places (cents)
- ROUND_HALF_UP rounding

## Documentation

- `docs/BUDGET_API_REFERENCE.md` - Complete API docs
- `docs/ADMIN_PANEL_ENHANCEMENTS.md` - Admin panel guide
- `docs/BUDGET_TRADING_ROOM_INTEGRATION.md` - Integration guide
- `docs/IMPLEMENTATION_CHECKLIST.md` - Task checklist
- `docs/FINAL_SUMMARY_PHASE2_PHASE3.md` - Full summary

## Environment Variables

```bash
# .env
INTERNAL_SERVICE_TOKEN=<secret-token>
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<password>
DB_NAME=portfolio_tracker
```

## Testing Checklist

- [ ] Load fake data
- [ ] Test admin endpoint
- [ ] Verify budget balance
- [ ] Check transactions
- [ ] Verify trading rooms
- [ ] Check leaderboard standings
- [ ] Run integration tests
- [ ] Check error handling

## Deployment Checklist

- [ ] Apply database schema
- [ ] Set environment variables
- [ ] Deploy backend code
- [ ] Verify API endpoints
- [ ] Load test data
- [ ] Test admin panel
- [ ] Monitor logs
- [ ] Verify functionality

## Support

For questions or issues:
1. Check `docs/BUDGET_API_REFERENCE.md`
2. Review `docs/IMPLEMENTATION_CHECKLIST.md`
3. Check `PROJECT_HISTORY.md` for context
4. Run integration tests
5. Check database directly

## Status

✅ Phase 2: Complete
✅ Phase 3 (Admin): Complete
⏳ Phase 3 (Settlement): Pending
⏳ Phase 3 (Fees): Pending
⏳ Frontend: Pending

