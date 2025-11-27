# Phase 2: Budget Service and API Implementation

**Status:** COMPLETE (Core implementation)

## Overview

Phase 2 implements the core Budget domain service and public/internal APIs according to the locked specifications in `Specs/budget-mng/`.

## Files Created

### 1. Budget Service (`backend/src/services/budgetService.js`)
Core transactional logic for budget operations:
- `getCurrentBudget(userId)` - Fetch current budget state
- `getBudgetLogs(userId, limit, offset, filters)` - Paginated budget history
- `creditBudget(userId, amount, operationData)` - Credit with idempotency
- `debitBudget(userId, amount, operationData)` - Debit with idempotency
- `roundMoney(amount)` - Consistent monetary rounding (DECIMAL(18,2))

**Key Features:**
- Transactional consistency with `SELECT ... FOR UPDATE`
- Idempotency via `idempotency_key` deduplication
- Automatic balance validation (non-negative, active status)
- Proper error handling (INSUFFICIENT_FUNDS, BUDGET_FROZEN, BUDGET_NOT_FOUND)

### 2. Public Budget Controller (`backend/src/controllers/budgetController.js`)
User-facing endpoints:
- `getCurrentBudget(req, res)` - GET /api/v1/budget
- `getBudgetLogs(req, res)` - GET /api/v1/budget/logs

### 3. Public Budget Routes (`backend/src/routes/budgetRoutes.js`)
Express route definitions for public endpoints.

### 4. Internal Budget Controller (`backend/src/controllers/internalBudgetController.js`)
Service-to-service endpoints:
- `creditBudget(req, res)` - POST /internal/v1/budget/credit
- `debitBudget(req, res)` - POST /internal/v1/budget/debit

### 5. Internal Budget Routes (`backend/src/routes/internalBudgetRoutes.js`)
Express route definitions for internal endpoints.

### 6. Internal Service Middleware (`backend/src/utils/internalServiceMiddleware.js`)
Authentication for internal endpoints:
- `requireInternalService` middleware
- Uses `INTERNAL_SERVICE_TOKEN` environment variable
- Bearer token validation

## Files Modified

### 1. `backend/src/app.js`
- Added imports for budget routes and internal service middleware
- Registered public budget routes: `${BASE_PATH}/api/v1/budget`
- Registered internal budget routes: `${BASE_PATH}/internal/v1/budget`

### 2. `backend/.env.example`
- Added `INTERNAL_SERVICE_TOKEN` configuration

## API Endpoints

### Public Endpoints (require JWT authentication)

**GET /api/v1/budget**
- Returns current budget for authenticated user
- Response: `{ user_id, available_balance, locked_balance, currency, status, created_at, updated_at }`

**GET /api/v1/budget/logs**
- Returns paginated budget history
- Query params: `limit` (default 50, max 500), `offset`, `operation_type`, `bull_pen_id`
- Response: `{ logs: [...], pagination: { limit, offset, total_returned } }`

### Internal Endpoints (require INTERNAL_SERVICE_TOKEN)

**POST /internal/v1/budget/credit**
- Credit user budget
- Required header: `Idempotency-Key`
- Body: `{ user_id, amount, currency, operation_type, bull_pen_id, season_id, moved_from, moved_to, correlation_id, meta }`
- Response: `{ user_id, balance_before, balance_after, log_id, idempotent }`

**POST /internal/v1/budget/debit**
- Debit user budget
- Required header: `Idempotency-Key`
- Body: same as credit
- Response: same as credit
- Error: `{ error: "INSUFFICIENT_FUNDS" }` if balance insufficient

## Implementation Details

### Idempotency
- Each operation checks for existing `idempotency_key` in `budget_logs`
- If found, returns cached result without re-executing
- If not found, executes operation and stores key

### Transaction Safety
- All budget mutations use database transactions
- `SELECT ... FOR UPDATE` locks user budget row
- Prevents race conditions and ensures consistency

### Monetary Precision
- All amounts use `DECIMAL(18,2)` in database
- JavaScript uses `roundMoney()` for consistent rounding
- Prevents floating-point errors

### Error Handling
- `INSUFFICIENT_FUNDS` (400) - Not enough available balance
- `BUDGET_FROZEN` (400) - Budget status not 'active'
- `BUDGET_NOT_FOUND` (404) - User has no budget record
- Missing required fields (400)
- Invalid service token (403)

## Testing

Run the test suite:
```bash
cd backend
INTERNAL_SERVICE_TOKEN=test-token npm start &
sleep 2
node test-budget-api.js
```

## Next Steps (Phase 2 Continuation)

1. **Lock and Unlock operations** - Add `lockBudget()` and `unlockBudget()` to service
2. **Transfer operations** - Add `transferBudget()` for user-to-user transfers
3. **Admin adjustments** - Add `adjustBudget()` for admin corrections
4. **OpenAPI documentation** - Update `openapi.json` with budget endpoints
5. **Integration tests** - Full end-to-end tests with real database
6. **Trading Room integration** - Hook budget operations into room join/settlement flows

## Assumptions

- `user_budgets` table exists with proper schema (Phase 1)
- `budget_logs` table exists with proper schema (Phase 1)
- MySQL connection pool available via `backend/src/db.js`
- JWT authentication middleware available
- Environment variables properly configured

